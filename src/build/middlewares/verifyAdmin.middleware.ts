import { NextFunction, Request, Response } from "express";
import { getPersonalWhitId } from "../utils/adminPanel.utils"
import { ValidationClass } from "../interfaces/interfaces";

export async function verifyUserId(req:Request, res:Response, next:NextFunction){
    try{
        let admin = await getPersonalWhitId(req.cookies.adminId)
        if (admin){
            req.admin = admin
            next()
        }else{
            let validation = new ValidationClass
            validation.addMessage("Usted no tiene permisos de administrador para acceder a esta sección.", "error")
            return res.render("error", {messages: validation.messages})
        }
    }catch(err) {
        let validation = new ValidationClass
        console.log(err)
        validation.addMessage("La sesión ha expirado, por favor vuelva a iniciar sesión", "error")
        return res.render("error", {messages: validation.messages})
    }
}