import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Personal, Registro } from "../../database/entity/models";
import { saveImage, getPassWhitPersonal, clearCookies, createRegisterWithPersonal, makeRegistrationMessage, makeRegistrationMessageRefuse, getPersonalWhitDni, getIsParRegistersQuantity } from "../utils/personal.utils"
import { existDniValidation, existPersonalWhitDni, validateDailyStaffRegistration } from "../validators/personal.validator"
import { ValidationClass , Image, error} from "../interfaces/interfaces";
import {comparePass} from "../helpers/bcrypt.helpers"
import { getPersonalUiOrCreate } from "../utils/adminProfile.utils";
import { getAiOptionsOrCreate } from "../utils/adminOptions.utils";
import { getImageClassification } from "../helpers/huggingface.helpers";
import { getPersonalWhitId } from "../utils/adminPanel.utils";

const jwt = require("jsonwebtoken")

export const getRegistroDNI = async (req:Request, res:Response)=>{
    try{
        clearCookies(res)
        res.render("registroDNI")
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const postRegistroDNI = async (req:Request, res:Response)=>{
    try{
        let validation = new ValidationClass
        let dni = req.body.dni
        validation = existDniValidation(validation, dni)
        validation = await existPersonalWhitDni(validation, dni)
        if (validation.status) {
            let personal = await getPersonalWhitDni(dni)
            if(personal){
                if(!personal.admin){
                    validation = await validateDailyStaffRegistration(validation, personal)
                    if (validation.status) {
                        if(await getIsParRegistersQuantity(personal)){
                            var tipoDeRegistro = "entrada"
                            res.render("registroFoto", {personal, tipoDeRegistro})
                        }else if(!await getIsParRegistersQuantity(personal)){
                            var tipoDeRegistro = "salida"
                            res.render("registroFoto", {personal, tipoDeRegistro})
                        }
                    }else{
                        res.render("registroError",{personal, messages: validation.messages})
                    }
                }else{
                    res.render("registroPassword",{admin: personal})
                }
            }
        }
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const postRegistroFoto = async (req:Request, res:Response)=>{
    try{
        console.log(req.body.userId)
        let personal = await getPersonalWhitId(req.body.userId)
        if(personal){
            let validation = new ValidationClass
            validation = await validateDailyStaffRegistration(validation, personal)
            if(validation.status){
                let img:Image|undefined = req.file
                let register = await createRegisterWithPersonal(personal)
                let aiOptions = await getAiOptionsOrCreate()
                if (aiOptions.status) {
                    let data = await getImageClassification(img)
                    console.log(data)
                    //TODO:
                    //hacer algo con la información que devuelve el modelo
                    //validaciones de ia?

                    await saveImage(register.id, img)
                    res.render("registroOk",{personal, messages: validation.messages})
                }else{
                    await saveImage(register.id, img)
                    validation = await makeRegistrationMessage(validation, personal)
                    res.render("registroOk",{personal, messages: validation.messages})
                }
            }else{
                validation = await makeRegistrationMessageRefuse(validation, personal)
                res.render("registroError",{personal, messages: validation.messages})
            }
        }
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const getErrorTemplate = async (req:Request, res:Response)=>{
    try{
        res.render("error")
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const postRegistroPassword = async (req:Request, res:Response)=>{
    let adminId = Number(req.params.id)
    let personalRepository = await DataBase.getRepository(Personal)
    let admin = await personalRepository.findOneBy({id: adminId})
    let password = String(req.body.password)
    if (admin) {
        let personalUi = await getPersonalUiOrCreate(admin)
        if(await comparePass(password, await getPassWhitPersonal(admin))){
            const token = jwt.sign({id: admin.id}, process.env.JWT_TOKEN_KEY, {
                expiresIn: 60 * 60 * 1
            })
            res.cookie('token', token, { httpOnly: true })
            res.cookie("adminId", adminId, { httpOnly: true })
            res.render("adminPanel", {admin, personalUi})
        }else{
            let validation = new ValidationClass
            validation.addMessage("La contraseña ingresada no es correcta.","warning")
            res.render("registroPassword", {admin, messages: validation.messages})
        }
    }
}
