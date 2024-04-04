import DataBase from "../../database/data-source";
import { Personal } from "../../database/entity/models";
import { ValidationClass } from "../interfaces/interfaces";
import { getListFileNamesOnDir } from "../utils/adminProfile.utils";
import path from "path";

const emailValidFormat = (validation: ValidationClass, email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        validation.status = false
        validation.addMessage("El email no tiene un formato válido", "warning")
    }
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

export const emailIsNotEmpty = (validation: ValidationClass, email: string|null) => {
    if (email === "" || email === null) {
        validation.status = false;
        validation.addMessage("Antes de intentar enviar un archivo por favor agregue un correo electrónico a su cuenta.", "warning")
    }
    return validation;
}

export const listIsNotEmpty = (validation: ValidationClass, list: any[]) => {
    if (list.length === 0) {
        validation.status = false;
        validation.addMessage("No hay registros disponibles.", "warning")
    }
    return validation;
}

export const existImageSelected = (validation: ValidationClass, imageName: string):ValidationClass => {
    if (!imageName) {
        validation.status = false
        validation.addMessage("Por favor seleccione una imagen.", "warning")
    }
    return validation
}

export const imageOnList = (validation: ValidationClass, imageName: string):ValidationClass => {
    let filenamesList = getListFileNamesOnDir(path.join(__dirname, "../../public/images"))
    if (!filenamesList.includes(imageName)) {
        validation.status = false
        validation.addMessage("La imagen seleccionada no se encuentra en la lista de imágenes.", "warning")
    }
    return validation
}

export const isNotSingleAccount = async (validation: ValidationClass):Promise<ValidationClass> => {
    let personalRepository = DataBase.getRepository(Personal)
    let personalList = await personalRepository.find()
    if (personalList.length === 1) {
        validation.status = false
        validation.addMessage("No puede eliminar la única cuenta de administrador.", "warning")
    }
    return validation
}