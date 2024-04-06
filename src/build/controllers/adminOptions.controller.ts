import { Request, Response } from "express"
import { getPersonalUiOrCreate } from "../utils/adminProfile.utils"
import { error, ValidationClass } from "../interfaces/interfaces"
import { getAiOptionsOrCreate } from "../utils/adminOptions.utils"
import { aiValidations } from "../validators/general.validator"

export const getOptions = async (req: Request, res: Response)=>{
    try {
        let admin = req.admin
        let personalUi = await getPersonalUiOrCreate(admin)
        res.render('adminOptions', { admin, personalUi })
    } catch (err) {
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const getIa = async (req: Request, res: Response)=>{
    try {
        let admin = req.admin
        let personalUi = await getPersonalUiOrCreate(admin)
        let aiOptions = await getAiOptionsOrCreate()
        res.render('adminOptionsAi', { admin, personalUi, aiOptions})
    } catch (err) {
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const postAiOptions = async (req: Request, res: Response)=>{
    try {
        let admin = req.admin
        let validation = new ValidationClass
        console.log(req.body.status)
        let status = req.body.status === "on" ? true : false
        let accuracy = req.body.accuracy
        validation = await aiValidations(validation, status, accuracy)
        if (validation.status) {
            let personalUi = await getPersonalUiOrCreate(admin)
            let aiOptions = await getAiOptionsOrCreate()
            res.render('adminOptionsAi', { admin, personalUi, aiOptions,  messages: validation.messages })
        }else{
            validation.addMessage("No se pudo actualizar el estado de la inteligencia artificial.", "error")
            res.render('error', { admin, messages: validation.messages })
        }
    } catch (err) {
        console.log(err)
        res.render("error", {messages: error})
    }
}