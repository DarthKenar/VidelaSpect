import { getPersonalWhitId } from "../utils/adminPanel.utils"
import { Request, Response } from "express"
import { getPersonalUiOrCreate } from "../utils/adminProfile.utils"
import { error, ValidationClass } from "../interfaces/interfaces"
import { getAiOptionsOrCreate, updateAiAccuracy, updateAiStatus } from "../utils/adminOptions.utils"


export const getOptions = async (req: Request, res: Response)=>{
    try {
        let personal = await getPersonalWhitId(req.cookies.userId)
        if (personal) {
            let personalUi = await getPersonalUiOrCreate(personal)
            res.render('adminOptions', { personal, personalUi })
        }
    } catch (err) {
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const getIa = async (req: Request, res: Response)=>{
    try {
        let personal = await getPersonalWhitId(req.cookies.userId)
        if (personal) {
            let personalUi = await getPersonalUiOrCreate(personal)
            let aiOptions = await getAiOptionsOrCreate()
            res.render('adminOptionsAi', { personal, personalUi, aiOptions})
        }
    } catch (err) {
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const postAiOptions = async (req: Request, res: Response)=>{
    try {
        let personal = await getPersonalWhitId(req.cookies.userId)
        if (personal) {
            let validation = new ValidationClass
            console.log(req.body.status)
            let status = req.body.status === "on" ? true : false
            let accuracy = req.body.accuracy
            validation = await updateAiStatus(validation, status)
            validation = await updateAiAccuracy(validation, accuracy)
            if (validation.status) {
                let personalUi = await getPersonalUiOrCreate(personal)
                let aiOptions = await getAiOptionsOrCreate()
                res.render('adminOptionsAi', { personal, personalUi, aiOptions,  messages: validation.messages })
            }else{
                validation.addMessage("No se pudo actualizar el estado de la inteligencia artificial.", "error")
                res.render('error', { personal, messages: validation.messages })
            }
        }
    } catch (err) {
        console.log(err)
        res.render("error", {messages: error})
    }
}