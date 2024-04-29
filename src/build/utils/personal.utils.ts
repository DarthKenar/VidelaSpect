import { Request, Response } from "express";
import { addDay } from "@formkit/tempo"
import DataBase from "../../database/data-source";
import { AiOptions, Auth, Personal, UserInOutRecords } from "../../database/entity/models";
import { AiDataClass, Image, ValidationClass } from "../interfaces/interfaces";
const fs = require('fs');
import { format } from "@formkit/tempo"
const PATH = require("path")

// Escribe el buffer en un archivo

export async function saveImage(registroId:number, image:Image|undefined, photoPath:string, dateTime:Date){
    
    if(image){
      // ${dia},${dia}.${mes}-${horas}.${minutos}-${personal.name}`
      fs.writeFile(PATH.join(__dirname, photoPath), image.buffer, function(err:Error) {
          if (err) {
            console.log('Hubo un error al escribir el archivo, se creará la carpeta para almacenar las fotos.', err);
            fs.mkdirSync(`./dist/database/fotos/${dateTime.getFullYear()}/${dateTime.getMonth()+1}/`,{recursive:true});
            fs.writeFile(PATH.join(__dirname, photoPath), image.buffer,function(err:Error) {
              if(err){
                console.log(err)
                console.log("La carpeta para la/s imagen/es no existe.")
              }else{
                console.log("La carpeta se ha creado correctamente.")
              }
            })
            //TODO:
            //Si esta activada la opción en la base de datos de eliminar la imagen, se debería eliminar la imagen guardada en la carpeta.
            //Si no está activada la opción, no hace nada.
            //Aca estaría bueno eliminar automáticamente la carpeta pero sale un error cuando lo hago porque pareciera que se necesitan ciertos permisos.
          } else {
            console.log('Archivo guardado con éxito');
          }
        });
    }else{
        console.log("La imagen no se está enviando correctamente.")
    }
}

export function createDateInTimeZone() {
  let date = new Date();
  let offset = date.getTimezoneOffset();
  return new Date(date.getTime() - (offset*60*1000));
}

export const createRegisterWithPersonal = async (personal:Personal, img:Image|undefined):Promise<UserInOutRecords>=>{
  let registerRepository = DataBase.getRepository(UserInOutRecords)
  let dateTime = new Date
  let recordNew = new UserInOutRecords
  recordNew.personal_id = personal.id
  recordNew.personal_name = personal.name
  recordNew.dateTime = dateTime
  recordNew.photoPath = ""
  recordNew = await registerRepository.save(recordNew)
  recordNew.photoPath = `../../database/fotos/${recordNew.dateTime.getFullYear()}/${recordNew.dateTime.getMonth()+1}/${personal.name}-${recordNew.id}.png`
  recordNew = await registerRepository.save(recordNew)
  await saveImage(recordNew.id, img, recordNew.photoPath, recordNew.dateTime)
  return recordNew
}

export async function getTodayRegistersWithPersonal(personal:Personal):Promise<UserInOutRecords[]> {
  let today = new Date()
  today.setHours(0, 0, 0, 0);
  let tomorrow = addDay(today, 1)
  let registroRepository = await DataBase.getRepository(UserInOutRecords);
  let records = await registroRepository.createQueryBuilder("record")
  .where("record.personal_id = :personal_id", { personal_id: personal.id })
  .andWhere("record.dateTime >= :today", { today: today })
  .andWhere("record.dateTime < :tomorrow", { tomorrow: tomorrow })
  .getMany();
  return records;
}

export function getTime(dateTime:Date):string {
  return format(dateTime, { time: "medium" }, "es") //HH:MM:SS
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
  let dateTime = new Date()
  let cantidadDeRegistros = await (await getTodayRegistersWithPersonal(personal)).length
  if(!(isPar(cantidadDeRegistros))){
      var tipoDeRegistro = "entrada" 
  }else{
      var tipoDeRegistro = "salida"
  }
  validation.addMessage(`Se ha registrado correctamente su ${tipoDeRegistro} a las: ${getTime(dateTime)} \nEsperamos que tenga una excelente jornada laboral.`, "success")
  return validation
}

export const makeRegistrationMessageRefuse = async (validation:ValidationClass, personal:Personal):Promise<ValidationClass>=>{
    //obtengo la cantidad de registros totales y los agrego al mensaje de validación
    let records = await getTodayRegistersWithPersonal(personal)
    let entrada = records[0];
    let salida = records[records.length-1];
    validation.addMessage(`No se puede realizar un nuevo registro ya que hoy ya se han realizado las cargas correspondientes a su entrada y salida. \nEntrada: ${getTime(entrada.dateTime)} \nSalida: ${getTime(salida.dateTime)} `, "warning")
    return validation
}

export const getPersonalWhitDni = async (dni:string):Promise<Personal|null>=>{
  let personalRepository = await DataBase.getRepository(Personal)
  let personal = await personalRepository.findOneBy({dni})
  return personal
}

export const getIsParRegistersQuantity = async (personal:Personal):Promise<boolean>=>{
  let recordsQuantity = await (await getTodayRegistersWithPersonal(personal)).length
  return isPar(recordsQuantity) && recordsQuantity < personal.dailyEntries
}

export const makeAiData = (data:any, aiOptions:AiOptions, validation:ValidationClass):AiDataClass=>{
  var response:string = ""
  var score:number = 0
  var label:string = ""
  for (let index = 0; index < data.length; index++) {
      if (data[index].label === "Human Face") {
          score = Math.round(data[index].score*100)
          label = data[index].label
      }
  }
  if (validation.status) {
    response = "Muchas gracias por completar el registro."
  }else{
    if (data[0].label === "Empty Place") {
      response = "En la foto pareciera figurar un lugar vacío. Por favor, intente nuevamente acercándose a la cámara."
    }
    if (data[0].label === "Inanimate Object") {
        response = "En la foto pareciera figurar un objeto inanimado. Por favor, intente nuevamente acercándose a la cámara."
    }
    if (data[0].label === "Human Face") {
        response = "En la foto pareciera figurar un rostro humano, pero la confianza de la IA no es suficiente para validar el registro. Por favor, intente nuevamente acercándose a la cámara."
    }
  }
  let aiData = (new AiDataClass(score, label, response))
  return aiData
}