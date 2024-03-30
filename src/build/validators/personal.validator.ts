import { existsSync } from "fs"
import {ValidationClass} from "../interfaces/interfaces"

export const areEmptyFieldsInPersonal = (validation:ValidationClass, name:string,dni:string,position:string):ValidationClass => {
    let value = !(name.length === 0 || dni.length === 0 || position.length === 0)
    if (value) {
        return validation
    }else{
        validation.status = false
        validation.messages.push({
            message: "Por favor completa los campos requeridos.",
            type: "warning"
        });
        return validation
    }
}

export const arePasswordsEqual = (validation:ValidationClass, password:string, password2:string):ValidationClass=>{
    if (password === "" || password2 === "") {
        validation.status = false
        validation.messages.push({
            message: "Las contraseñas no pueden estar vacías",
            type: "warning"
        })
    }
    if (password !== password2) {
        validation.status = false
        validation.messages.push({
            message: "Las contraseñas no coinciden.",
            type: "warning"
        })
    }
    return validation
}