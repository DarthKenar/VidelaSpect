import { Request, Response } from "express";
import {Like} from 'typeorm';
import { Personal, Registro } from "../../database/entity/models";
import DataBase from "../../database/data-source";
import {buildPersonal} from "../utils/admin.utils"
import * as fs from 'fs';
const PATH = require("path")

export const getPanel = async (req:Request, res:Response)=>{
    res.render("adminPanel")
}

export const getPanelPersonal = async (req:Request, res:Response)=>{
    let personalRepository = DataBase.getRepository(Personal)
    let personal:Personal[] = await personalRepository.find()
    res.render("adminPanelPersonal", {personal})
}

export const getPanelRegisters = async (req:Request, res:Response)=>{
    let registroRepository = DataBase.getRepository(Registro)
    let registros:Registro[] = await registroRepository.find()
    res.render("adminPanelRegistros",{registros})
}

export const getCreatePersonal = async (req:Request, res:Response)=>{
    res.render("adminPersonalCreate")
}

export const getUpdatePersonal = async (req:Request, res:Response)=>{
    let personalId = req.params.id
    let personalRepository = DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({id: Number(personalId)})
    res.render("adminPersonalUpdate",{personal})
}

export const postCreatePersonal = async (req:Request, res:Response)=>{
    try{
        let nombre:string = req.body.nombre
        let dni:string = req.body.dni
        let position:string = req.body.position
        let dailyEntries:number = Number(req.body.dailyEntries)
        let admin:boolean;
        if (nombre.length === 0 || dni.length === 0 || position.length === 0 || dailyEntries === 1 ) {
            throw new Error("Alguno de los datos del personal están vacíos y no se guardará");
        }
        if(req.body.admin){
            admin = true
        }else{
            admin = false
        }
        let personal = new Personal
        await buildPersonal(personal, nombre, dni, position, admin, dailyEntries)
        res.render("adminPersonalCreate",{message:"El personal fue guardado correctamente.", type:"success"})
    }catch(err){
        console.log(err)
        res.render("adminPersonalCreate",{message:"Se deben completar todos los datos antes de intentar guardar un nuevo miembro del personal.", type: "warning"})
    }
}

export const postUpdatePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = Number(req.params.id)
        let personalRepository = DataBase.getRepository(Personal)
        let personalToUpdate = await personalRepository.findOneBy({id: personalId})
        if (personalToUpdate) {
            let nombre:string = req.body.nombre
            let dni:string = req.body.dni
            let position:string = req.body.position
            let dailyEntries:number = Number(req.body.dailyEntries)
            let admin:boolean;
            if (nombre.length === 0 || dni.length === 0 || position.length === 0 ) {
                throw new Error("Alguno de los datos del personal están vacíos y no se guardará");
            }
            if(req.body.admin){
                admin = true
            }else{
                admin = false
            }
            await buildPersonal(personalToUpdate,nombre,dni,position,admin,dailyEntries)
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal, message:`Se ha modificado correctamente a ${personalToUpdate.name}`, type:"info"})
        }
    }catch(err){
        console.log(err)
        res.render("adminPersonalUpdate",{message:`${err}`, type:"error"})
    }
}

export const postDeletePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = Number(req.params.id)
        let personalRepository = DataBase.getRepository(Personal)
        let personalToDelete = await personalRepository.findOneBy({id: personalId})
        if(personalToDelete){
            let personalToDeleteName = personalToDelete.name
            await personalRepository.delete(personalToDelete)
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal,message:`${personalToDeleteName} se ha eliminado correctamente del personal.`, type:"success"})
        }else{
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal, message:`La eliminación del personal no se ha podido concretar.`, type:"error"})
        }
    }catch(err){
        console.log(err)
        return res.render("adminPanel")
    }
}

export const getPanelRegisterPhoto = async (req:Request, res:Response)=>{
    try{
        let registroId = Number(req.params.id)
        let fotoPath:string = PATH.join(__dirname, `../../database/fotos/${registroId}.png`)
        if(registroId){
            if(fs.existsSync(fotoPath)){
                res.sendFile(fotoPath,(err)=>{console.log(err)})
            }else{
                let registroRepository = DataBase.getRepository(Registro)
                let registros:Registro[] = await registroRepository.find()
                let registro:Registro|null = await registroRepository.findOneBy({id:registroId})
                if(registro){
                    res.render("adminPanelRegistros",{registros, message:`La foto buscada de ${registro.personal_name} no se encuentra.`, type:"error"})
                }
            }
        }
    }catch(err){
        console.log(err)
    }
}

export const getPanelPersonalFiltered = async (req:Request, res:Response)=>{
    let input = req.query.input
    let select = req.query.select
    let personalRepository = DataBase.getRepository(Personal)
    if(typeof input === "string"){
        let personal:Personal[];
        if(select === "dni"){
            personal = await personalRepository.findBy({dni: Like(`%${input}%`)});
        }else if(select === "name"){
            console.log("name")
            personal = await personalRepository.findBy({name: Like(`%${input}%`)});
            
        }else{
            personal = await personalRepository.find()
        }
        res.render("adminPanelPersonalResponse",{personal, input, select})
    }
}

export const getPanelRegistersFiltered = async (req:Request, res:Response)=>{
    try{
        let input = req.query.input
        let select = req.query.select
        let registroRepository = DataBase.getRepository(Registro)
        let registros:Registro[];
        if(typeof input === "string"){
            if(select === "personal_name"){
                registros = await registroRepository.findBy({personal_name: Like(`%${input}%`)});
            }else if(select === "fecha"){
                registros = await registroRepository.findBy({fecha: Like(`%${input}%`)});
            }else if(select === "hora"){
                registros = await registroRepository.findBy({hora: Like(`%${input}%`)});
            }else{
                registros = await registroRepository.find()
            }
            res.render("adminPanelRegistrosResponse",{registros, input, select})
        }else{
            registros = await registroRepository.find()
            res.render("adminPanelRegistrosResponse",{registros, input, select})
        }
    }catch(err){
        console.log(err)
    }
}