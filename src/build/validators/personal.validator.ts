import DataBase from "../../database/data-source"
import { AiOptions, Personal } from "../../database/entity/models"
import { comparePass } from "../helpers/bcrypt.helpers"
import { Image, ValidationClass} from "../interfaces/interfaces"
import { makeRegistrationMessageRefuse } from "../utils/personal.utils"
import { getTodayRegistersWithPersonal } from "../utils/personal.utils"

export const validateAreEmptyFieldsInPersonal = (validation:ValidationClass, name:string, dni:string, position:string):ValidationClass => {
    if (name.length === 0 || dni.length === 0 || position.length === 0) {
        validation.status = false
        validation.addMessage("Por favor completa los campos requeridos.","warning")
    }
    return validation
}

export const validateArePasswordsEqual = (validation:ValidationClass, password:string, password2:string):ValidationClass=>{
    if (password !== password2) {
        validation.status = false
        validation.addMessage("Las contraseñas no coinciden.","warning")
    }
    return validation
}

export const validateArePasswordsEmpty = (validation:ValidationClass, password:string, password2:string):ValidationClass=>{
    if (password === "" || password2 === "") {
        validation.status = false
        validation.addMessage("Las contraseñas no pueden estar vacías","warning")
    }
    return validation
}

export const validateArePasswordsMinLength = (validation:ValidationClass, password:string, password2:string, len:number):ValidationClass=>{
    if (password.length < len || password2.length < len) {
        validation.status = false
        validation.addMessage(`Las contraseñas debe tener al menos ${len} caracteres.`,"warning")
    }
    return validation
}



export const validateComparePass = async (validation:ValidationClass, passwordOld:string, passwordInDb:string):Promise<ValidationClass>=>{
    if(!await comparePass(passwordOld, passwordInDb)) {
        validation.status = false
        validation.addMessage("La contraseña actual es incorrecta.","warning")
    }
    return validation
}

export const validateDailyStaffRegistration = async(validation: ValidationClass, personal:Personal):Promise<ValidationClass>=>{

    let records = await getTodayRegistersWithPersonal(personal)
    if(records.length >= personal.dailyEntries){
      validation.status = false
      validation = await makeRegistrationMessageRefuse(validation, personal)
    }
    return validation
  }

export const validateExistDni = (validation:ValidationClass, dni:string):ValidationClass=>{
    if (!dni) {
        validation.status = false
        validation.addMessage("Por favor ingrese un número de DNI.","warning")
    }
    return validation
}

export const validateExistPersonalWhitDni = async (validation:ValidationClass, dni:string):Promise<ValidationClass>=>{
    let personalRepository = await DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({dni})
    if (!personal) {
        validation.status = false
        validation.addMessage(`El número de DNI - ${dni} no está registrado en el sistema. Contacte al administrador.`,"warning")
    }
    return validation
}

export const validateHumanFaceInImage = async (validation:ValidationClass, data:any, aiOptions:AiOptions):Promise<ValidationClass>=>{
    if (data) {
        console.log(data)
        for (let index = 0; index < data.length; index++) {
            let score = data[index].score;
            let label = data[index].label;
            if (label === "Human Face") {
                if (score*100 > aiOptions.accuracy) {
                    validation.addMessage("La imagen contiene un rostro humano.","success")
                }else{
                    validation.status = false
                    validation.addMessage("La imagen no coincide con un rostro humano.","error")
                }
            }
        }
    }else{
        validation.status = false
        validation.addMessage("No se pudo obtener información de la imagen.","error")
    }
    return validation
}

export const validateImageSize = (validation:ValidationClass, img:Image|undefined):ValidationClass=>{
    if (img && img.size < 1000) {
        validation.status = false
        validation.addMessage("No hay una imagen para procesar, por favor acérquese a la cámara.","error")
    }
    return validation
}
