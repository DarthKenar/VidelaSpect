import DataBase from "../../database/data-source";
import { Personal, Registro } from "../../database/entity/models";

const fs = require('fs');
// Escribe el buffer en un archivo
export interface Image {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }

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
            //Aca estaría bueno eliminar automáticamente la carpeta pero sale un error porque pareciera que se necesitan ciertos permisos.
          } else {
            console.log('Archivo guardado con éxito');
          }
        });
    }else{
        console.log("La imagen no se está enviando correctamente.")
    }
}

export async function registrarPersonal(personal:Personal, dateTime:Date){
  let date = getDate(dateTime)
  let time = getTime(dateTime)
  let registroRepository = await DataBase.getRepository(Registro)
  let registros = await registroRepository.findBy({personal_id:personal.id,date:date})
  if(registros.length === personal.dailyEntries){
    return [false,registros]
  }else{
    let registroNuevo = new Registro
    registroNuevo.date = date
    registroNuevo.time = time
    registroNuevo.personal_id = personal.id
    registroNuevo.personal_name = personal.name
    registroNuevo = await registroRepository.save(registroNuevo)
    return [true, registros, registroNuevo.id]
  }
}

export async function getCantidadDeRegistrosPorIdDePersonaHoy(personal:Personal, ahora:Date):Promise<number> {
  let fecha = getDate(ahora)
  let registroRepository = await DataBase.getRepository(Registro)
  let registros = await registroRepository.findBy({personal_id:personal.id,date:fecha})
  return registros.length
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