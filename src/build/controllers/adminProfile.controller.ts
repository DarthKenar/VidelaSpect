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
    let admin = req.admin
    let personalUi = await getPersonalUiOrCreate(admin)
    res.render("adminProfile", {admin, personalUi})
}

export const getProfileEmail = async (req:Request, res:Response) => {
    let admin = req.admin
    let personalUi = await getPersonalUiOrCreate(admin)
    let auth = await getAuthOrCreate(admin)
    res.render("adminProfileEmail", {admin, personalUi, email: auth.email})
}

export const getProfilePassword = async (req:Request, res:Response) => {
    let admin = req.admin
    let personalUi = await getPersonalUiOrCreate(admin)
    res.render("adminProfilePassword", {admin, personalUi})
}

export const postProfileEmail = async (req:Request, res:Response) => {
    let admin = req.admin
    let email = req.body.email
    let validation = new ValidationClass
    let personalUi = await getPersonalUiOrCreate(admin)
    let auth = await getAuthOrCreate(admin)
    validation = emailValidations(validation, auth.email, email)
    if (validation.status) {
        auth.email = email
        DataBase.manager.save(auth)
        validation.addMessage("Email actualizado correctamente.", "success")
    }
    res.render("adminProfileEmail", {admin, personalUi, email: auth.email, messages: validation.messages})

}

export const postProfilePassword = async (req:Request, res:Response) => {
    let admin = req.admin
    let passwordOld = req.body.password_old
    let password = req.body.password
    let password2 = req.body.password2
    let validation = new ValidationClass
    let personalUi = await getPersonalUiOrCreate(admin)
    let auth = await getAuthOrCreate(admin)
    validation = await comparePassValidation(validation, passwordOld, auth.password)
    validation = passwordValidations(validation, password, password2)
    if (validation.status) {
        auth.password = await encryptPass(password)
        DataBase.manager.save(auth)
        validation.addMessage("Contraseña actualizada correctamente.", "success")
        res.render("adminProfile", {admin, messages: validation.messages})
    }else{
        res.render("adminProfilePassword", {admin, personalUi, messages: validation.messages, passwordOld, password, password2})
    }
}

export const getProfileImage = async (req:Request, res:Response) => {
    let admin = req.admin
    let personalUi = await getPersonalUiOrCreate(admin)
    let filenamesList = getListFileNamesOnDir(path.join(__dirname, "../../public/images"))
    res.render("adminProfileImage", {admin, personalUi, filenamesList})
}

export const postProfileImage = async (req:Request, res:Response) => {
    let admin = req.admin
    let imageName = String(req.body.imageName)
    let validation = new ValidationClass
    let personalUi = await getPersonalUiOrCreate(admin)
    let filenamesList = getListFileNamesOnDir(path.join(__dirname, "../../public/images"))
    validation = existImageSelected(validation, imageName)
    validation = imageOnList(validation, imageName)
    if (validation.status) {
        personalUi.profile_image_name = imageName
        await DataBase.manager.save(personalUi)
        validation.addMessage("Imagen actualizada correctamente.", "success")
    }
    res.render("adminProfileImage", {admin, personalUi, messages: validation.messages, filenamesList})
}

export const postDeleteAccount = async (req:Request, res:Response) => {
    let admin = req.admin
    let validation = new ValidationClass
    let personalUi = await getPersonalUiOrCreate(admin)
    let auth = await getAuthOrCreate(admin)
    validation = await isNotSingleAccount(validation)
    if(validation.status){
        await DataBase.manager.remove(auth)
        await DataBase.manager.remove(personalUi)
        await DataBase.manager.remove(admin)
        clearCookies(res)
        validation.addMessage("La cuenta se ha eliminado correctamente.", "success")
        res.render("error", {messages: validation.messages})
    }else{
        res.render("adminProfile", {admin, personalUi, messages: validation.messages})
    }
}