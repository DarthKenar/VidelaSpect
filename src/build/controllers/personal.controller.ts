import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Personal, Registro } from "../../database/entity/models";
import { saveImage, getTodayRegistersWithPersonal, isPar, getDate, getPassWhitPersonal, clearCookies, createRegisterWithPersonal, makeRegistrationMessage, makeRegistrationMessageRefuse } from "../utils/personal.utils"
import { validateDailyStaffRegistration } from "../validators/personal.validator"
import { ValidationClass , Image, error} from "../interfaces/interfaces";
import {comparePass} from "../helpers/bcrypt.helpers"
import { getPersonalUiOrCreate } from "../utils/adminProfile.utils";
import { getAiOptionsOrCreate } from "../utils/adminOptions.utils";
import { getImageClassification } from "../helpers/huggingface.helpers";
import { getPersonalWhitId } from "../utils/adminPanel.utils";

const jwt = require("jsonwebtoken")

export const getRegistroDNI = async (req:Request, res:Response)=>{
    try{
        clearCookies(res)
        res.render("registroDNI")
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const postRegistroDNI = async (req:Request, res:Response)=>{
    try{
        if(req.body.dni){
            let dni:string = req.body.dni.toString()
            let personalRepository = DataBase.getRepository(Personal)
            let personal = await personalRepository.findOneBy({dni})
            if(personal){
                if(!personal.admin){
                    let cantidadDeRegistros = await (await getTodayRegistersWithPersonal(personal)).length
                    if(isPar(cantidadDeRegistros) && cantidadDeRegistros < personal.dailyEntries){
                        var tipoDeRegistro = "entrada"
                        res.render("registroFoto", {personal, tipoDeRegistro})
                    }else if(!isPar(cantidadDeRegistros) && cantidadDeRegistros < personal.dailyEntries){
                        var tipoDeRegistro = "salida"
                        res.render("registroFoto", {personal, tipoDeRegistro})
                    }else{
                        let ahora = new Date
                        let fecha = getDate(ahora)
                        let registroRepository = DataBase.getRepository(Registro)
                        let registros = await registroRepository.findBy({personal_id:personal.id,date:fecha})
                        if (Array.isArray(registros)) {
                            let entrada = registros[0];
                            let salida = registros[registros.length-1];
                            res.render("registroError",{personal, entrada, salida, error:`No se puede realizar un nuevo registro ya que hoy ya se han realizado las cargas para su entrada y salida de la escuela.`})
                        }
                    }
                }else{
                    res.render("registroPassword",{admin: personal})
                }
            }else{
                let validation = new ValidationClass
                validation.addMessage(`El número de DNI - ${dni} no está registrado en el sistema. Contacte al administrador.`, "error")
                res.render("registroDNI",{messages: validation.messages})
            }
        }else{
            let validation = new ValidationClass
            validation.addMessage("El número de DNI no fue ingresado.","error")
            res.render("registroDNI",{messages: validation.messages})
        }
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const postRegistroFoto = async (req:Request, res:Response)=>{
    try{
        console.log(req.body.userId)
        let personal = await getPersonalWhitId(req.body.userId)
        if(personal){
            let validation = new ValidationClass
            validation = await validateDailyStaffRegistration(validation, personal)
            if(validation.status){
                let img:Image|undefined = req.file
                let register = await createRegisterWithPersonal(personal)
                let aiOptions = await getAiOptionsOrCreate()
                if (aiOptions.status) {
                    let data = await getImageClassification(img)
                    console.log(data)
                    //hacer algo con la información que devuelve el modelo

                    await saveImage(register.id, img)
                }else{
                    await saveImage(register.id, img)
                    validation = await makeRegistrationMessage(validation, personal)
                }
                console.log("registroOk")
                res.render("registroOk",{personal, messages: validation.messages})
            }else{
                validation = await makeRegistrationMessageRefuse(validation, personal)
                res.render("registroError",{personal, messages: validation.messages})
            }
        }
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const getErrorTemplate = async (req:Request, res:Response)=>{
    try{
        res.render("error")
    }catch(err){
        console.log(err)
        res.render("error", {message: error, type:"error"})
    }
}

export const postRegistroPassword = async (req:Request, res:Response)=>{
    let adminId = Number(req.params.id)
    let personalRepository = await DataBase.getRepository(Personal)
    let admin = await personalRepository.findOneBy({id: adminId})
    let password = String(req.body.password)
    if (admin) {
        let personalUi = await getPersonalUiOrCreate(admin)
        if(await comparePass(password, await getPassWhitPersonal(admin))){
            const token = jwt.sign({id: admin.id}, process.env.JWT_TOKEN_KEY, {
                expiresIn: 60 * 60 * 1
            })
            res.cookie('token', token, { httpOnly: true })
            res.cookie("adminId", adminId, { httpOnly: true })
            res.render("adminPanel", {admin, personalUi})
        }else{
            let validation = new ValidationClass
            validation.addMessage("La contraseña ingresada no es correcta.","warning")
            res.render("registroPassword", {admin, messages: validation.messages})
        }
    }
}
