import { Request, Response } from "express";

import { Auth, Personal, Registro } from "../../database/entity/models";
import DataBase from "../../database/data-source";
import {savePersonal, exportExcel, registersFiltered, personalFiltered, sendExcel, saveAuth, getAuth, deleteAuth} from "../utils/admin.utils"
import {areEmptyFieldsInPersonal, arePasswordsEqual} from "../validators/personal.validator"
import * as fs from 'fs';
import {error} from "../helpers/error.helper"
import { Validation, ValidationClass } from "../interfaces/interfaces";
const PATH = require("path")

export const getPanel = async (req:Request, res:Response)=>{
    try{
        res.render("adminPanel")
    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const getPanelPersonal = async (req:Request, res:Response)=>{
    try{
        let personalRepository = DataBase.getRepository(Personal)
        let personal:Personal[] = await personalRepository.find()
        res.render("adminPanelPersonal", {personal})
    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
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
        res.render("error", {messages: error})
    }
}

export const getUpdatePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = Number(req.params.id)
        let personalRepository = DataBase.getRepository(Personal)
        let personal = await personalRepository.findOneBy({id: personalId})
        res.render("adminPersonalUpdate",{personal})
    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const postCreatePersonal = async (req:Request, res:Response)=>{
    try{
        // Datos
        let name:string = req.body.nombre
        let dni:string = req.body.dni
        let position:string = req.body.position
        let dailyEntries:number = Number(req.body.dailyEntries)
        let admin:boolean = !!req.body.admin
        let email:string = req.body.email
        let phone:string = req.body.phone
        let password:string = req.body.password
        let password2:string = req.body.password2
        // Validaciones
        let validation:Validation = new ValidationClass()
        validation = areEmptyFieldsInPersonal(validation, name, dni, position)
        if(admin) {
            validation = arePasswordsEqual(validation, password, password2)
        }
        // Acciones
        if (validation.status) {
            let personal = new Personal
            await savePersonal(personal, name, dni, position, admin, dailyEntries)
            if (admin) {
                let auth = new Auth
                await saveAuth(personal,auth,email,password,phone)
            }
            validation.messages.push({message:"El personal fue guardado correctamente.", type:"success"})
        }
        res.render("adminPersonalCreate",{messages: validation.messages})
    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const postUpdatePersonal = async (req:Request, res:Response)=>{
    try{
        // Datos
        let personalId = Number(req.params.id)
        let name:string = req.body.nombre
        let dni:string = req.body.dni
        let position:string = req.body.position
        let dailyEntries:number = Number(req.body.dailyEntries)
        let admin:boolean = !!req.body.admin
        let email:string = req.body.email
        let phone:string = req.body.phone
        let password:string = req.body.password
        let password2:string = req.body.password2
        let personalRepository = DataBase.getRepository(Personal)
        let personalToUpdate = await personalRepository.findOneBy({id: personalId})
        if (personalToUpdate){
            // Validaciones
            let validation:Validation = new ValidationClass()
            validation = areEmptyFieldsInPersonal(validation, name, dni, position)
            if(admin) {
                validation = arePasswordsEqual(validation, password, password2)
            }
            // Acciones
            if (validation.status) {
                await savePersonal(personalToUpdate, name, dni, position, admin, dailyEntries)
                if (admin) {
                    let auth = await getAuth(personalToUpdate)
                    await saveAuth(personalToUpdate,auth,email,password,phone)
                }else{
                    await deleteAuth(personalToUpdate)
                }
                validation.messages.push({message:"El personal fue guardado correctamente.", type:"success"})
                let personal = await personalRepository.find()
                res.render("adminPanelPersonal",{personal, messages: validation.messages})
            }else{
                res.render("adminPersonalUpdate",{messages: validation.messages})
            }
        }
    }catch(err){
        console.log(err)
        res.render("adminPersonalUpdate",{messages: error})
    }
}

export const postDeletePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = Number(req.params.id)
        let personalRepository = DataBase.getRepository(Personal)
        let personalToDelete = await personalRepository.findOneBy({id: personalId})
        let validation:Validation = new ValidationClass
        if(personalToDelete){
            let personalToDeleteName = personalToDelete.name
            await personalRepository.delete(personalToDelete)
            if (personalToDelete.admin) {
                await deleteAuth(personalToDelete)
            }
            validation.messages.push({message:`${personalToDeleteName} se ha eliminado correctamente del personal.`, type:"success"})
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{messages: validation.messages})
        }
    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
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
                let validation:Validation = new ValidationClass
                let registroRepository = DataBase.getRepository(Registro)
                let registros:Registro[] = await registroRepository.find()
                let registro:Registro|null = await registroRepository.findOneBy({id:registroId})
                if(registro){
                    validation.messages.push({message:`La foto buscada de ${registro.personal_name} no se encuentra.`, type:"error"})
                    res.render("adminPanelRegistros",{registros, messages: validation.messages})
                }
            }
        }
    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
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
        res.render("error", {messages: error})
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
        res.render("error", {messages: error})
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
        res.render("error", {messages: error})
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
        res.render("error", {messages: error})
    }
}