import e, { Request, Response } from "express";
import { getAuthOrCreate, getPersonalWhitId } from "../utils/adminPanel.utils";
import { ValidationClass } from "../interfaces/interfaces";
import DataBase from "../../database/data-source";
import { passwordValidations, comparePassValidation } from "../validators/personal.validator";
import { emailValidations, existImageSelected, imageOnList, isNotSingleAccount } from "../validators/adminProfile.validator"
import { getListFileNamesOnDir, getPersonalUiOrCreate } from "../utils/adminProfile.utils"
import { encryptPass } from "../helpers/bcrypt.helpers";
import path from "path";
import { clearCookies } from "../utils/personal.utils";

export const getProfile = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        let personalUi = await getPersonalUiOrCreate(personal)
        res.render("adminProfile", {personal, personalUi})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const getProfileEmail = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        let personalUi = await getPersonalUiOrCreate(personal)
        let auth = await getAuthOrCreate(personal)
        res.render("adminProfileEmail", {personal, personalUi, email: auth.email})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const getProfilePassword = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        let personalUi = await getPersonalUiOrCreate(personal)
        res.render("adminProfilePassword", {personal, personalUi})
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
        let personalUi = await getPersonalUiOrCreate(personal)
        let auth = await getAuthOrCreate(personal)
        validation = emailValidations(validation, auth.email, email)
        if (validation.status) {
            auth.email = email
            DataBase.manager.save(auth)
            validation.addMessage("Email actualizado correctamente.", "success")
            res.render("adminProfileEmail", {personal, email: auth.email, messages: validation.messages})
        }
        res.render("adminProfileEmail", {personal, personalUi, email: auth.email, messages: validation.messages})
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
        let personalUi = await getPersonalUiOrCreate(personal)
        let auth = await getAuthOrCreate(personal)
        validation = await comparePassValidation(validation, passwordOld, auth.password)
        validation = passwordValidations(validation, password, password2)
        if (validation.status) {
            auth.password = await encryptPass(password)
            DataBase.manager.save(auth)
            validation.addMessage("Contraseña actualizada correctamente.", "success")
            res.render("adminProfile", {personal, messages: validation.messages})
        }else{
            res.render("adminProfilePassword", {personal, personalUi, messages: validation.messages, passwordOld, password, password2})
        }
    }else{
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const getProfileImage = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        let personalUi = await getPersonalUiOrCreate(personal)
        let filenamesList = getListFileNamesOnDir(path.join(__dirname, "../../public/images"))
        res.render("adminProfileImage", {personal, personalUi, filenamesList})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const postProfileImage = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    let imageName = String(req.body.imageName)
    let validation = new ValidationClass
    if (personal) {
        let personalUi = await getPersonalUiOrCreate(personal)
        let filenamesList = getListFileNamesOnDir(path.join(__dirname, "../../public/images"))
        validation = existImageSelected(validation, imageName)
        validation = imageOnList(validation, imageName)
        if (validation.status) {
            personalUi.profile_image_name = imageName
            await DataBase.manager.save(personalUi)
            validation.addMessage("Imagen actualizada correctamente.", "success")
        }
        res.render("adminProfileImage", {personal, personalUi, messages: validation.messages, filenamesList})
    }else{
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}

export const postDeleteAccount = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    let validation = new ValidationClass
    if (personal) {
        let personalUi = await getPersonalUiOrCreate(personal)
        let auth = await getAuthOrCreate(personal)
        validation = await isNotSingleAccount(validation)
        if(validation.status){
            await DataBase.manager.remove(auth)
            await DataBase.manager.remove(personalUi)
            await DataBase.manager.remove(personal)
            clearCookies(res)
            validation.addMessage("La cuenta se ha eliminado correctamente.", "success")
            res.render("error", {messages: validation.messages})
        }else{
            res.render("adminProfile", {personal, personalUi, messages: validation.messages})
        }
    }else{
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
}