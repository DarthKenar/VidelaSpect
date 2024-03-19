import { Request, Response } from "express";

export const getRegistroDNI = async (req:Request, res:Response)=>{
    res.render("registroDNI")
}
export const getRegistroFoto = async (req:Request, res:Response)=>{
    res.render("registroFoto")
}

