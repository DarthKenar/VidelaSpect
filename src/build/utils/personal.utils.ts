import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Auth, Personal, Registro } from "../../database/entity/models";
import { Image, ValidationClass } from "../interfaces/interfaces";
const fs = require('fs');
// Escribe el buffer en un archivo

export async function saveImage(registroId:number, image:Image|undefined){
    if(image){
      // ${dia},${dia}.${mes}-${horas}.${minutos}-${personal.name}`
      fs.writeFile(`dist/database/fotos/${registroId}`+".png", image.buffer, function(err:Error) {
          if (err) {
            console.log('Hubo un error al escribir el archivo', err);
            fs.mkdirSync(`./dist/database/fotos/`,{recursive:true});
            fs.writeFile(`dist/database/fotos/${registroId}`+".png", image.buffer,function(err:Error) {
              if(err){
                console.log(err)
              }else{
                console.log("La carpeta se ha creado correctamente")
              }
            })
            //TODO:
            //Aca estaría bueno eliminar automáticamente la carpeta pero sale un error cuando lo hago porque pareciera que se necesitan ciertos permisos.
          } else {
            console.log('Archivo guardado con éxito');
          }
        });
    }else{
        console.log("La imagen no se está enviando correctamente.")
    }
}

export const createRegisterWithPersonal = async (personal:Personal):Promise<Registro>=>{
  let registerRepository = DataBase.getRepository(Registro)
  let dateTime = new Date
  let date = getDate(dateTime)
  let time = getTime(dateTime)
  let registerNew = new Registro
  registerNew.personal_id = personal.id
  registerNew.personal_name = personal.name
  registerNew.date = date
  registerNew.time = time
  registerNew = await registerRepository.save(registerNew)
  return registerNew
}

export async function getTodayRegistersWithPersonal(personal:Personal):Promise<Registro[]> {
  let dateTime = new Date
  let fecha = getDate(dateTime)
  let registroRepository = await DataBase.getRepository(Registro)
  let registers = await registroRepository.findBy({personal_id:personal.id,date:fecha})
  return registers
} 

export function getDate(ahora:Date):string {
  let ano = ahora.getFullYear()
  let dia = ("0" + ahora.getDate()).slice(-2)
  let mes = ("0" + (ahora.getMonth() + 1)).slice(-2)
  return `${dia}-${mes}-${ano}`
}

export function getTime(dateTime:Date):string {
  return dateTime.toTimeString().split(' ')[0];  // Formato: "HH:mm:ss"
}

export const isPar = (numero:number) => numero % 2 === 0;

export const formalizeMinutes = (num: number): string => num < 10 ? `0${num}` : `${num}`;

export async function getPassWhitPersonal(personal:Personal):Promise<string>{
  let authRepository = await DataBase.getRepository(Auth)
  let auth = await authRepository.findOneBy({personal})
  if (auth) {
    return auth.password
  }else{
    return ""
  }
}

export const clearCookies = (res:Response) => {
  res.clearCookie('token');
  res.clearCookie('userId');
}

export const makeRegistrationMessage = async (validation:ValidationClass, personal:Personal)=>{
  let date = new Date
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let minutesString = formalizeMinutes(minutes)
  let cantidadDeRegistros = await (await getTodayRegistersWithPersonal(personal)).length
  if(!(isPar(cantidadDeRegistros))){
      var tipoDeRegistro = "entrada" 
  }else{
      var tipoDeRegistro = "salida"
  }
  validation.addMessage(`Se ha registrado correctamente su ${tipoDeRegistro} a las: ${hours}:${minutesString} <br> Esperamos que tenga una excelente jornada laboral.`, "success")
  return validation
}

export const makeRegistrationMessageRefuse = async (validation:ValidationClass, personal:Personal):Promise<ValidationClass>=>{
    //obtengo la cantidad de registros totales y los agrego al mensaje de validación
    let registers = await getTodayRegistersWithPersonal(personal)
    let entrada = registers[0];
    let salida = registers[registers.length-1];
    validation.addMessage(`No se puede realizar un nuevo registro ya que hoy ya se han realizado las cargas correspondientes a su entrada y salida. <br> Entrada: ${entrada.time} <br> Salida: ${salida.time} `, "warning")
    return validation
}
