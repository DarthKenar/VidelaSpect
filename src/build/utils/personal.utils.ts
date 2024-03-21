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

export async function saveImage(personal:Personal, image:Image|undefined){
    if(image){
      let fecha = new Date
      let mes = fecha.getMonth()
      let dia = fecha.getDate()
      let horas = fecha.getHours()
      let minutos = fecha.getMinutes()
      mes = mes + 1
      fs.writeFile(`dist/database/fotos/${mes}/${dia}/${horas}.${minutos}-${personal.name}`+".png", image.buffer, function(err:Error) {
          if (err) {
            console.log('Hubo un error al escribir el archivo', err);
            fs.mkdirSync(`./dist/database/fotos/${mes}/${dia}/`,{recursive:true});
            fs.writeFile(`dist/database/fotos/${mes}/${dia}/${horas}.${minutos}-${personal.name}`+".png", image.buffer,function(err:Error) {
              if(err){
                console.log(err)
              }else{
                console.log("La carpeta se ha creado correctamente")
              }
            })
            let mesHaceDosMeses = mes - 2;
            if (mesHaceDosMeses < 1) {
              mesHaceDosMeses += 12; // Ajustamos el mes
            }
            //Aca estaría bueno eliminar automáticamente la carpeta pero sale un error porque pareciera que se necesitan ciertos permisos.
          } else {
            console.log('Archivo guardado con éxito');
          }
        });
    }else{
        console.log("La imagen no se está enviando correctamente.")
    }
}
