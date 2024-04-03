import { ValidationClass } from "../interfaces/interfaces";

const emailValidFormat = (validation: ValidationClass, email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        validation.status = false
        validation.addMessage("El email no tiene un formato válido", "warning")
    }
    console.log(validation.status)
    return validation
}

const emailMinLength = (validation: ValidationClass, email: string) => {
    const maxLength = 50;
    if (email.length > maxLength) {
        validation.status = false;
        validation.addMessage("El email es demasiado largo", "warning")
    }
    return validation;
};

const emailSameOldAndNew = (validation: ValidationClass, emailOld:string, emailNew: string) => {
    if (emailOld.toLowerCase() === emailNew.toLowerCase()) {
        validation.status = false;
        validation.addMessage("El nuevo correo electrónico es igual al anterior. No se realizaron cambios", "warning")
    }
    return validation;
};

export const emailValidations = (validation: ValidationClass, emailOld: string, emailNew:string): ValidationClass => {
    validation = emailSameOldAndNew(validation, emailOld, emailNew)
    validation = emailValidFormat(validation, emailNew)
    validation = emailMinLength(validation, emailNew)
    return validation
};


