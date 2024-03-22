import { Request, Response } from "express";

export const getPanel = async (req:Request, res:Response)=>{
    res.render("adminPanel")
}
export const getPanelPersonal = async (req:Request, res:Response)=>{
    res.render("adminPanelPersonal")
}
export const getPanelRegistros = async (req:Request, res:Response)=>{
    res.render("adminPanelRegistros")
}