import { Request, Response } from "express";
import { Auth, Personal, UserInOutRecords } from "../../database/entity/models";
import DataBase from "../../database/data-source";
import { savePersonal, registersFiltered, personalFiltered, saveAuth, getAuthOrCreate, deleteAuth } from "../utils/adminPanel.utils"
import { validateAndHandleExcelExport, validateDniFormat, validatePersonWithDniDoesNotExist } from "../validators/adminPanel.validator"
import  { validateAreEmptyFieldsInPersonal }  from "../validators/personal.validator"
import * as fs from 'fs';
import { error } from "../interfaces/interfaces"
import { ValidationClass } from "../interfaces/interfaces";
import { getPersonalUiOrCreate } from "../utils/adminProfile.utils";
import { validatePassword } from "../validators/general.validator";
const PATH = require("path")

export const getPanel = async (req:Request, res:Response)=>{
    try{
        let admin = req.admin
        let personalUi = await getPersonalUiOrCreate(admin)
        res.render("adminPanel",{admin, personalUi})
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
    let registroRepository = DataBase.getRepository(UserInOutRecords)
    let registros:UserInOutRecords[] = await registroRepository.find()
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
        if (personal) {
            let auth = await getAuthOrCreate(personal)
            let email = auth.email
            let phone = auth.phone
            res.render("adminPersonalUpdate",{personal, email, phone})
        }
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
        let validation = new ValidationClass()
        validation = validateAreEmptyFieldsInPersonal(validation, name, dni, position)
        validation = await validatePersonWithDniDoesNotExist(validation, dni)
        if(admin) {
            validation = validatePassword(validation, password, password2)
        }
        // Acciones
        if (validation.status) {
            let personal = new Personal
            await savePersonal(personal, name, dni, position, admin, dailyEntries)
            if (admin) {
                let auth = new Auth
                await saveAuth(personal,auth,email,password,phone)
            }
            validation.addMessage("El personal fue guardado correctamente.","success")
            res.render("adminPersonalCreate",{messages: validation.messages})
        }else{
            let newUser = new Personal
            newUser.name = name
            newUser.dni = dni
            newUser.position = position
            newUser.dailyEntries = dailyEntries
            res.render("adminPersonalCreate",{messages: validation.messages, newUser, email, phone})
        }
        
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
            let validation = new ValidationClass()
            if (!personalToUpdate.admin) {
                // Validaciones
                validation = await validateDniFormat(validation, dni)
                validation = await validatePersonWithDniDoesNotExist(validation, dni, personalToUpdate)
                validation = validateAreEmptyFieldsInPersonal(validation, name, dni, position)
                if(admin) {
                    validation = validatePassword(validation, password, password2)
                }
                // Acciones
                if (validation.status) {
                    await savePersonal(personalToUpdate, name, dni, position, admin, dailyEntries)
                    if (admin) {
                        let auth = await getAuthOrCreate(personalToUpdate)
                        await saveAuth(personalToUpdate,auth,email,password,phone)
                    }else{
                        await deleteAuth(personalToUpdate)
                    }
                    validation.addMessage("El personal fue guardado correctamente.", "success")
                    let personal = await personalRepository.find()
                    res.render("adminPanelPersonal",{personal, messages: validation.messages})
                }else{
                    res.render("adminPersonalUpdate",{personal: personalToUpdate, messages: validation.messages})
                }
            }else{
                validation.addMessage("No se puede modificar un administrador, no tienes privilegios","error")
                res.render("adminPersonalUpdate",{personal: personalToUpdate, messages: validation.messages})
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
        let validation = new ValidationClass
        if(personalToDelete){
            let personalToDeleteName = personalToDelete.name
            await personalRepository.delete(personalToDelete)
            if (personalToDelete.admin) {
                await deleteAuth(personalToDelete)
            }
            validation.addMessage(`${personalToDeleteName} se ha eliminado correctamente del personal.`,"success")
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal, messages: validation.messages})
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
                let validation = new ValidationClass
                let registroRepository = DataBase.getRepository(UserInOutRecords)
                let registros:UserInOutRecords[] = await registroRepository.find()
                let registro:UserInOutRecords|null = await registroRepository.findOneBy({id:registroId})
                if(registro){
                    validation.addMessage(`La foto buscada de ${registro.personal_name} no se encuentra.`,"error")
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
        let emailOption = Boolean(req.query.email)
        let admin = req.admin
        let personal = await personalFiltered(input, select)
        let validation = new ValidationClass
        validation = await validateAndHandleExcelExport(validation, personal, emailOption, admin.id, input, select)
        res.render("adminPanelPersonalResponse",{personal, input, select, messages: validation.messages})

    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
    }
}

export const getPanelRegisterExcel = async (req:Request, res:Response)=>{
    try{
        let input = String(req.query.input)
        let select = String(req.query.select)
        let emailOption = Boolean(req.query.email)
        let admin = req.admin
        let registros = await registersFiltered(input, select)
        let validation = new ValidationClass
        validation = await validateAndHandleExcelExport(validation, registros, emailOption, admin.id, input, select)
        res.render("adminPanelRegistrosResponse",{registros, input, select, messages: validation.messages})

    }catch(err){
        console.log(err)
        res.render("error", {messages: error})
    }
}