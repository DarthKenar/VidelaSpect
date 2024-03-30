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

export const arePasswordsMinLength = (validation:ValidationClass, password:string, password2:string, length:number):ValidationClass=>{
    if (password.length < length || password2.length < length) {
        validation.status = false
        validation.addMessage("Las contraseñas no pueden estar vacías","warning")
    }
    return validation
}

export const passwordValidations = (validation:ValidationClass,password:string, password2:string):ValidationClass=>{
    validation = arePasswordsEqual(validation, password, password2)
    validation = arePasswordsEmpty(validation, password, password2)
    validation = arePasswordsMinLength(validation, password, password2, 8)
    return validation
}