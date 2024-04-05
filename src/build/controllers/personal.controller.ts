import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Personal, Registro } from "../../database/entity/models";
import { saveImage, registerPersonal, getTodaysRegisterCountById, isPar, getDate, getPassWhitPersonal, formalizeMinutes, clearCookies } from "../utils/personal.utils"
import { ValidationClass , Image, error} from "../interfaces/interfaces";
import {comparePass} from "../helpers/bcrypt.helpers"
import { getPersonalUiOrCreate } from "../utils/adminProfile.utils";
import { getAiOptionsOrCreate } from "../utils/adminOptions.utils";
import { getImageClassification } from "../helpers/huggingface.helpers";
const PORT = process.env.PORT
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
                    let ahora = new Date
                    let cantidadDeRegistros = await getTodaysRegisterCountById(personal,ahora)
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
        let userId = req.body.userId
        let personalRepository = await DataBase.getRepository(Personal)
        let personal = await personalRepository.findOneBy({id: userId})
        if(personal){
            //CÓDIGO DE OK
            //Ayuda a generar el mensaje al usuario
            let fecha = new Date
            //Registra al personal
            let [confirm, registros, registroId] = await registerPersonal(personal, fecha)
            //
            if(confirm){
                //Guarda la foto con el objeto {personal}
                let img:Image|undefined = req.file 
                let aiOptions = await getAiOptionsOrCreate()
                if (aiOptions.status) {
                    let data = await getImageClassification(img)
                    console.log(data)
                    if(typeof registroId === "number"){
                        await saveImage(registroId, img)
                    }
                    //
                    res.json({url:`http://localhost:${PORT}/personal/foto/send/${personal.id}`})
                }else{
                    if(typeof registroId === "number"){
                        await saveImage(registroId, img)
                    }
                    //
                    res.json({url:`http://localhost:${PORT}/personal/foto/send/${personal.id}`})
                }
            }else{
                if (Array.isArray(registros)) {
                    let entrada = registros[0];
                    let salida = registros[registros.length-1];
                    res.render("registroError",{personal, entrada, salida, error:`No se puede realizar un nuevo registro ya que hoy ya se han realizado las cargas correspondientes a su entrada y salida.`})
                }
            }
        }
    }catch(err){
        console.log(err)
        res.render("error", {error})
    }
}

export const postRegistroFotoOk = async (req:Request, res:Response)=>{
    try{
        let userId = Number(req.params.id)
        let personalRepository = await DataBase.getRepository(Personal)
        let personal = await personalRepository.findOneBy({id: userId})
        if (personal) {
            let ahora = new Date
            //lógica por cantidad de registros
            //Ayuda a generar el mensaje al usuario
            let date = new Date
            let hours = date.getHours()
            let minutes = date.getMinutes()
            let minutesString = formalizeMinutes(minutes)
            //
            let cantidadDeRegistros = await getTodaysRegisterCountById(personal,ahora)
            if(!(isPar(cantidadDeRegistros))){
                let tipoDeRegistro = "entrada"
                res.render("registroOk",{personal, message:`Se ha registrado correctamente su ${tipoDeRegistro} a las: ${hours}:${minutesString}`, farewell:"Esperamos que tenga una excelente jornada laboral."})
            }else{
                let tipoDeRegistro = "salida"
                res.render("registroOk",{personal, message:`Se ha registrado correctamente su ${tipoDeRegistro} a las: ${hours}:${minutesString}`, farewell:"Gracias por registrar su salida, que tenga buenos días."})
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
