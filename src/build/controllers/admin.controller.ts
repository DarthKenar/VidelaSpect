import { Request, Response } from "express";

import { Personal, Registro } from "../../database/entity/models";
import DataBase from "../../database/data-source";
import {savePersonal, exportExcel, registersFiltered, personalFiltered, sendExcel} from "../utils/admin.utils"
import {getErrorTemplate} from "./personal.controller"

import * as fs from 'fs';
import {error} from "../utils/error.utils"
const PATH = require("path")

export const getPanel = async (req:Request, res:Response)=>{
    try{
        res.render("adminPanel")
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const getPanelPersonal = async (req:Request, res:Response)=>{
    try{
        let personalRepository = DataBase.getRepository(Personal)
        let personal:Personal[] = await personalRepository.find()
        res.render("adminPanelPersonal", {personal})
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const getPanelRegisters = async (req:Request, res:Response)=>{
    let registroRepository = DataBase.getRepository(Registro)
    let registros:Registro[] = await registroRepository.find()
    res.render("adminPanelRegistros",{registros})
}

export const getCreatePersonal = async (req:Request, res:Response)=>{
    try{
        res.render("adminPersonalCreate")
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const getUpdatePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = req.params.id
        let personalRepository = DataBase.getRepository(Personal)
        let personal = await personalRepository.findOneBy({id: Number(personalId)})
        res.render("adminPersonalUpdate",{personal})
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const postCreatePersonal = async (req:Request, res:Response)=>{
    try{
        let nombre:string = req.body.nombre
        let dni:string = req.body.dni
        let position:string = req.body.position
        let dailyEntries:number = Number(req.body.dailyEntries)
        let admin:boolean = !!req.body.admin
        if (!(nombre.length === 0 || dni.length === 0 || position.length === 0)) {
            let personal = new Personal
            await savePersonal(personal, nombre, dni, position, admin, dailyEntries)
            res.render("adminPersonalCreate",{message:"El personal fue guardado correctamente.", type:"success"})
        }else{
            res.render("adminPersonalCreate",{message:"Alguno de los datos del personal están vacíos y no se guardará", type: "warning"})
        }
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
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
            let admin:boolean = !!req.body.admin
            if (!(nombre.length === 0 || dni.length === 0 || position.length === 0)) {
                await savePersonal(personalToUpdate,nombre,dni,position,admin,dailyEntries)
                let personal = await personalRepository.find()
                res.render("adminPanelPersonal",{personal, message:`Se ha modificado correctamente a ${personalToUpdate.name}`, type:"info"})
            }else{
                res.render("adminPanelPersonal",{message:"Alguno de los datos del personal están vacíos y no se guardará", type:"warning"})
            }
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
        res.render("error", {message: error, type:"error"})
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
        res.render("error", {message: error, type:"error"})
    }
}

export const getPanelPersonalFiltered = async (req:Request, res:Response)=>{
    try{
        let input = String(req.query.input)
        let select = String(req.query.select)
        let personal = await personalFiltered(input, select)
        res.render("adminPanelPersonalResponse",{personal, input, select})
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const getPanelRegistersFiltered = async (req:Request, res:Response)=>{
    try{
        let input = String(req.query.input)
        let select = String(req.query.select)
        let registros = await registersFiltered(input, select)
        res.render("adminPanelRegistrosResponse",{registros, input, select})
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const getPanelPersonalExcel = async (req:Request, res:Response)=>{
    try{
        let input = String(req.query.input)
        let select = String(req.query.select)
        let email = Boolean(req.query.email)
        let personal = await personalFiltered(input, select)
        let excelPath = await exportExcel(personal,input,select,email)
        let emailAdmin = String(process.env.EMAIL_ADMIN)
        await sendExcel(excelPath, emailAdmin)
        res.render("adminPanelPersonalResponse",{personal, input, select, message:"El archivo excel se ha exportado correctamente.", type:"success"})
    }catch(err){
        console.log(err)
        res.redirect("/personal/error")
    }
}
export const getPanelRegisterExcel = async (req:Request, res:Response)=>{
    try{
        let input = String(req.query.input)
        let select = String(req.query.select)
        let registros = await registersFiltered(input, select)
        let excelPath = await exportExcel(registros,input,select, true)
        let emailAdmin = String(process.env.EMAIL_ADMIN)
        await sendExcel(excelPath, emailAdmin)
        res.render("adminPanelRegistrosResponse",{registros, input, select, message:"El archivo excel se ha exportado correctamente.", type:"success"})
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}