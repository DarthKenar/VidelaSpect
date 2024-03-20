import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Personal } from "../../database/entity/models";

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
            let persona = await personalRepository.findOneBy({dni})
            if(persona){
                res.render("registroFoto", persona)
            }else{
                res.render("registroDNI",{error: `El número de DNI - ${dni} no está registrado en el sistema. Contacte al administrador.`})
            }
        }else{
            res.render("registroDNI",{error: "El número de DNI no fue ingresado."})
        }
    }catch(err){
        console.log(err)
        console.log("--------------------------------")
        res.render("500")
    }
}

export const postRegistroFoto = async (req:Request, res:Response)=>{
    try{
        console.log("------")
        let data = req.file
        console.log(data)
        console.log("------")
        res.redirect("/personal/dni")
    }catch(err){
        console.log(err)
    }

}


export const get500 = async (req:Request, res:Response)=>{
    res.render("500")
}
