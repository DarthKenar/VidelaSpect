import { Request, Response } from "express";
import { Personal, Registro } from "../../database/entity/models";
import DataBase from "../../database/data-source";

export const getPanel = async (req:Request, res:Response)=>{
    res.render("adminPanel")
}
export const getPanelPersonal = async (req:Request, res:Response)=>{
    let personalRepository = DataBase.getRepository(Personal)
    let personal:Personal[] = await personalRepository.find()
    console.log(personal)
    res.render("adminPanelPersonal", {personal})
}
export const getPanelRegistros = async (req:Request, res:Response)=>{
    let registroRepository = DataBase.getRepository(Registro)
    let registro:Registro[] = await registroRepository.find()
    console.log(registro)
    res.render("adminPanelRegistros",{registro})
}