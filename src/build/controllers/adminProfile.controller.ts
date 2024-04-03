import e, { Request, Response } from "express";
import { getAuthOrCreate, getAuthOrNull, getPersonalWhitId } from "../utils/adminPanel.utils";
import { ValidationClass } from "../interfaces/interfaces";
import DataBase from "../../database/data-source";
import { passwordValidations, comparePassValidation } from "../validators/personal.validator";
import { emailValidations } from "../validators/adminProfile.validator"
import { encryptPass } from "../helpers/bcrypt.helpers";

export const getProfile = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        res.render("adminProfile", {personal})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const getProfileEmail = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        let auth = await getAuthOrCreate(personal)
        res.render("adminProfileEmail", {personal, email: auth.email})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const getProfilePassword = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        res.render("adminProfilePassword", {personal})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const postProfileEmail = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    let email = req.body.email
    let validation = new ValidationClass
    if (personal) {
        let auth = await getAuthOrCreate(personal)
        validation = emailValidations(validation, auth.email, email)
        if (validation.status) {
            auth.email = email
            DataBase.manager.save(auth)
            validation.addMessage("Email actualizado correctamente.", "success")
            res.render("adminProfileEmail", {personal, email: auth.email, messages: validation.messages})
        }
        res.render("adminProfileEmail", {personal, email: auth.email, messages: validation.messages})
    }else{
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const postProfilePassword = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    let passwordOld = req.body.password_old
    let password = req.body.password
    let password2 = req.body.password2
    let validation = new ValidationClass
    if (personal) {
        let auth = await getAuthOrCreate(personal)
        validation = await comparePassValidation(validation, passwordOld, auth.password)
        validation = passwordValidations(validation, password, password2)
        if (validation.status) {
            auth.password = await encryptPass(password)
            DataBase.manager.save(auth)
            validation.addMessage("Contraseña actualizada correctamente.", "success")
            res.render("adminProfile", {personal, messages: validation.messages})
        }else{
            res.render("adminProfilePassword", {personal, messages: validation.messages, passwordOld, password, password2})
        }
        
    }else{
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}