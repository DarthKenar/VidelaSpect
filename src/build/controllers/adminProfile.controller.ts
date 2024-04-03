import { Request, Response } from "express";
import { getPersonalWhitId } from "../utils/adminPanel.utils";
import { ValidationClass } from "../interfaces/interfaces";
export const getProfile = async (req:Request, res:Response) => {
    let personal = await getPersonalWhitId(req.cookies.userId)
    if (personal) {
        res.render("adminOptions", {personal})
    }else{
        let validation = new ValidationClass
        validation.addMessage("No se encontró el usuario, por favor inicie sesión nuevamente.", "error")
        res.render("error", {messages: validation.messages})
    }
    
}