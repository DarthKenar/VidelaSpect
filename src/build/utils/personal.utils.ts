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

export function saveImage(image:string|undefined){
  console.log(image)
    if(image){
        fs.writeFile(image.originalname, image.buffer, function(err:Error) {
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
