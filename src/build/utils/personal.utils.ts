import { Personal } from "../../database/entity/models";

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

export function saveImage(personal:Personal, image:Image|undefined){
    if(image){
        fs.writeFile(`${personal.name}`+".png", image.buffer, function(err:Error) {
            if (err) {
              console.log('Hubo un error al escribir el archivo', err);
            } else {
              console.log('Archivo guardado con éxito');
            }
          });
    }else{
        console.log("La imagen no se está enviando correctamente.")
    }
}
