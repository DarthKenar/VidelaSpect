import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Personal, Registro } from "../../database/entity/models";
import { saveImage, Image, registrarPersonal, getCantidadDeRegistrosPorIdDePersonaHoy, isPar, getDate } from "../utils/personal.utils"

export const getRegistroDNI = async (req:Request, res:Response)=>{
    res.render("registroDNI")
}

export const postRegistroDNI = async (req:Request, res:Response)=>{
    try{
        if(req.body.dni){
            let dni:string = req.body.dni.toString()
            let personalRepository = DataBase.getRepository(Personal)
            let personal = await personalRepository.findOneBy({dni})
            if(personal){
                if(personal.admin === false){
                    let ahora = new Date
                    let cantidadDeRegistros = await getCantidadDeRegistrosPorIdDePersonaHoy(personal,ahora)
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
                    res.render("adminPanel")
                }
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
    //Datos de usuario para trabajar
    let userId = req.body.userId
    let personalRepository = await DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({id: userId})
    if(personal){
        //CÓDIGO DE OK
        //Ayuda a generar el mensaje al usuario
        let fecha = new Date
        //Registra al personal
        let [confirm, registros, registroId] = await registrarPersonal(personal, fecha)
        //
        if(confirm){
            //Guarda la foto con el objeto {personal}
            let data:Image|undefined = req.file 
            if(typeof registroId === "number"){
                saveImage(registroId, data)
            }
            //
            res.json({url:`http://localhost:7000/personal/foto/send/${personal.id}`})
        }else{
            if (Array.isArray(registros)) {
                let entrada = registros[0];
                let salida = registros[registros.length-1];
                res.render("registroError",{personal, entrada, salida, error:`No se puede realizar un nuevo registro ya que hoy ya se han realizado las cargas correspondientes a su entrada y salida.`})
            }
        }
    }
}

export const postRegistroFotoOk = async (req:Request, res:Response)=>{
    //Datos de usuario para trabajar
    let userId = Number(req.params.id)
    let personalRepository = await DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({id: userId})
    if (personal) {
        let ahora = new Date
        //lógica por cantidad de registros
        //Ayuda a generar el mensaje al usuario
        let fecha = new Date
        let horas = fecha.getHours()
        let minutos = fecha.getMinutes()
        const formalizeMinutes = (num: number): string => num < 10 ? `0${num}` : `${num}`;
        let minutosFormalize = formalizeMinutes(minutos)
        //
        let cantidadDeRegistros = await getCantidadDeRegistrosPorIdDePersonaHoy(personal,ahora)
        if(isPar(cantidadDeRegistros)){
            let tipoDeRegistro = "entrada"
            res.render("registroOk",{personal, message:`Se ha registrado correctamente su ${tipoDeRegistro} a las: ${horas}:${minutosFormalize}`, despedida:"Esperamos que tenga una excelente jornada laboral."})
        }else{
            let tipoDeRegistro = "salida"
            res.render("registroOk",{personal, message:`Se ha registrado correctamente su ${tipoDeRegistro} a las: ${horas}:${minutosFormalize}`, despedida:"Gracias por registrar su salida, que tenga buenos días."})
        }
    }else{
        throw new Error("Ha ocurrido un error inesperado, contacte al administrador");
    }
}

export const get500 = async (req:Request, res:Response)=>{
    res.render("500")
}
