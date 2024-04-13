import { Request, Response } from "express";
import { addDay } from "@formkit/tempo"
import DataBase from "../../database/data-source";
import { AiOptions, Auth, Personal, UserInOutRecords } from "../../database/entity/models";
import { AiDataClass, Image, ValidationClass } from "../interfaces/interfaces";
const fs = require('fs');
import { dayEnd, dayStart, format } from "@formkit/tempo"
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

export const createRegisterWithPersonal = async (personal:Personal):Promise<UserInOutRecords>=>{
  let registerRepository = DataBase.getRepository(UserInOutRecords)
  let dateTime = new Date
  let registerNew = new UserInOutRecords
  registerNew.personal_id = personal.id
  registerNew.personal_name = personal.name
  registerNew.dateTime = dateTime
  registerNew = await registerRepository.save(registerNew)
  return registerNew
}

export async function getTodayRegistersWithPersonal(personal:Personal):Promise<UserInOutRecords[]> {
  let today = new Date();
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


export function getDate(dateTime:Date):string {
  return format(dateTime, "DD/MM/AAAA", "es")
}

export function getTime(dateTime:Date):string {
  return format(dateTime, "HH:MM:SS", "es")
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
  let dateTime = new Date
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
    console.log(records)
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

export const makeAiData = (data:any, aiOptions:AiOptions):AiDataClass=>{

  let replaceLabel = (label:string):string =>{
      let newLabel = label
      switch (label) {
          case "Human Face":
              newLabel = "Rostro humano"
              break;
          case "Empty Place":
              newLabel = "Lugar vacío"
              break;
          case "Inanimate Object":
              newLabel = "Objeto inanimado"
              break;
      }
      return newLabel
  }

  var score: number = 0
  var label: string = "Error"
  var response:string = "No se pudo obtener información de la imagen."
  
  for (let index = 0; index < data.length; index++) {
      if (data[index].label === "Human Face" && data[index].score*100 > aiOptions.accuracy) {
          score = Math.round(data[index].score*100)
          label = replaceLabel(data[index].label);
          if (index === 0) {
              response = "Muchas gracias por completar el registro."
          }
      }
      if (data[index].label === "Empty Place" && index === 0) {
          response = "En la foto pareciera figurar un lugar vacío. Por favor, acérquese a la cámara."
      }
      if (data[index].label === "Inanimate Object" && index === 0) {
          response = "En la foto pareciera figurar un objeto inanimado. Por favor, acérquese a la cámara."
      }
  }

  let aiData = (new AiDataClass(score, replaceLabel(label), response))
  return aiData
}