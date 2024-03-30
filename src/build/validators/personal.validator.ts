import { existsSync } from "fs"
import {Validation} from "../interfaces/interfaces"

export const areEmptyFieldsInPersonal = (validation:Validation, name:string,dni:string,position:string):Validation => {
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

export const arePasswordsEqual = (validation:Validation, password:string, password2:string):Validation=>{
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