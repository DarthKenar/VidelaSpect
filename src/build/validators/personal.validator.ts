import DataBase from "../../database/data-source"
import { AiOptions, Personal, Registro } from "../../database/entity/models"
import { comparePass } from "../helpers/bcrypt.helpers"
import {ValidationClass} from "../interfaces/interfaces"
import { getDate, getTime, makeRegistrationMessageRefuse } from "../utils/personal.utils"

export const areEmptyFieldsInPersonal = (validation:ValidationClass, name:string, dni:string, position:string):ValidationClass => {
    if (name.length === 0 || dni.length === 0 || position.length === 0) {
        validation.status = false
        validation.addMessage("Por favor completa los campos requeridos.","warning")
    }
    return validation
}

export const arePasswordsEqual = (validation:ValidationClass, password:string, password2:string):ValidationClass=>{
    if (password !== password2) {
        validation.status = false
        validation.addMessage("Las contraseñas no coinciden.","warning")
    }
    return validation
}

export const arePasswordsEmpty = (validation:ValidationClass, password:string, password2:string):ValidationClass=>{
    if (password === "" || password2 === "") {
        validation.status = false
        validation.addMessage("Las contraseñas no pueden estar vacías","warning")
    }
    return validation
}

export const arePasswordsMinLength = (validation:ValidationClass, password:string, password2:string, len:number):ValidationClass=>{
    if (password.length < len || password2.length < len) {
        validation.status = false
        validation.addMessage(`Las contraseñas debe tener al menos ${len} caracteres.`,"warning")
    }
    return validation
}

export const passwordValidations = (validation:ValidationClass,password:string, password2:string):ValidationClass=>{
    validation = arePasswordsEmpty(validation, password, password2)
    validation = arePasswordsEqual(validation, password, password2)
    validation = arePasswordsMinLength(validation, password, password2, 8)
    return validation
}

export const comparePassValidation = async (validation:ValidationClass, passwordOld:string, passwordInDb:string):Promise<ValidationClass>=>{
    if(!await comparePass(passwordOld, passwordInDb)) {
        validation.status = false
        validation.addMessage("La contraseña actual es incorrecta.","warning")
    }
    return validation
}

export const validateDailyStaffRegistration = async(validation: ValidationClass, personal:Personal):Promise<ValidationClass>=>{
    let dateTime = new Date
    let date = getDate(dateTime)
    let registroRepository = await DataBase.getRepository(Registro)
    let registers = await registroRepository.findBy({personal_id:personal.id,date:date})
    if(registers.length === personal.dailyEntries){
      validation.status = false
      validation = await makeRegistrationMessageRefuse(validation, personal)
    }
    return validation
  }

export const existDniValidation = (validation:ValidationClass, dni:string):ValidationClass=>{
    if (!dni) {
        validation.status = false
        validation.addMessage("Por favor ingrese un número de DNI.","warning")
    }
    return validation
}

export const existPersonalWhitDni = async (validation:ValidationClass, dni:string):Promise<ValidationClass>=>{
    let personalRepository = await DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({dni})
    if (!personal) {
        validation.status = false
        validation.addMessage(`El número de DNI - ${dni} no está registrado en el sistema. Contacte al administrador.`,"error")
    }
    return validation
}

export const aiValidation = async (validation:ValidationClass, data:any, aiOptions:AiOptions):Promise<ValidationClass>=>{
    if (data) {
        console.log(data)
        for (let index = 0; index < data.length; index++) {
            let score = data[index].score;
            let label = data[index].label;
            if (label === "Human Face") {
                if (score*100 < aiOptions.accuracy) {
                    validation.status = false
                    validation.addMessage("La imagen no contiene un rostro humano.","error")
                }else{
                    validation.addMessage("La imagen contiene un rostro humano.","success")
                }
            }
        }
    }else{
        validation.status = false
        validation.addMessage("No se pudo obtener información de la imagen.","error")
    }
    return validation
}