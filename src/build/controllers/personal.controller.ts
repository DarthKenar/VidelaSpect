import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Personal } from "../../database/entity/models";
import { saveImage, Image } from "../utils/personal.utils"
import { error } from "console";

export const getRegistroDNI = async (req:Request, res:Response)=>{
    res.render("registroDNI")
}

export const getRegistroFoto = async (req:Request, res:Response)=>{
    res.render("registroFoto")
}

export const postRegistroDNI = async (req:Request, res:Response)=>{
    try{
        if(req.body.dni){
            let dni:string = req.body.dni.toString()
            let personalRepository = DataBase.getRepository(Personal)
            let personal = await personalRepository.findOneBy({dni})
            if(personal){
                res.render("registroFoto", {personal: personal})
            }else{
                res.render("registroDNI",{error: `El número de DNI - ${dni} no está registrado en el sistema. Contacte al administrador.`})
            }
        }else{
            res.render("registroDNI",{error: "El número de DNI no fue ingresado."})
        }
    }catch(err){
        console.log(err)
        res.render("500")
    }
}

export const postRegistroFoto = async (req:Request, res:Response)=>{
    try{
        let personalId = req.body.personalId
        let data:Image|undefined = req.file 
        console.log(data)
        saveImage(data)
        res.render('registroDNI',{message: "El horario se ha registrado correctamente" });
    }catch(err){
        res.render("registroDNI", {error: "No se ha registrado correctamente el ingreso, por favor contacte al administrador."})
        console.log(err)
    }

}


export const get500 = async (req:Request, res:Response)=>{
    res.render("500")
}
