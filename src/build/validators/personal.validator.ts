import { comparePass } from "../helpers/password.helpers"
import {ValidationClass} from "../interfaces/interfaces"

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
        console.log("entro")
        validation.status = false
        validation.addMessage("La contraseña actual es incorrecta.","warning")
    }
    console.log(validation.status)
    return validation
}