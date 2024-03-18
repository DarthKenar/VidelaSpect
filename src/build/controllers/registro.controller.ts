import { Request, Response } from "express";

export const getIndex = async (req:Request, res:Response)=>{
    res.render("home")
}
export const postRegistro = async (req:Request, res:Response)=>{
    res.render("home")
}

