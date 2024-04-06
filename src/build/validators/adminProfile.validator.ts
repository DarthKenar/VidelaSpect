import DataBase from "../../database/data-source";
import { Personal } from "../../database/entity/models";
import { ValidationClass } from "../interfaces/interfaces";
import { getListFileNamesOnDir } from "../utils/adminProfile.utils";
import path from "path";

export const ValidateEmailFormat = (validation: ValidationClass, email: string):ValidationClass => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        validation.status = false
        validation.addMessage("El email no tiene un formato válido", "warning")
    }
    return validation
}

export const validateEmailMinLength = (validation: ValidationClass, email: string):ValidationClass => {
    const maxLength = 50;
    if (email.length > maxLength) {
        validation.status = false;
        validation.addMessage("El email es demasiado largo", "warning")
    }
    return validation;
};

export const validateEmailSameOldAndNew = (validation: ValidationClass, emailOld:string, emailNew: string):ValidationClass => {
    if (emailOld.toLowerCase() === emailNew.toLowerCase()) {
        validation.status = false;
        validation.addMessage("El nuevo correo electrónico es igual al anterior. No se realizaron cambios", "warning")
    }
    return validation;
};



export const validateEmailIsNotEmpty = (validation: ValidationClass, email: string|null):ValidationClass => {
    if (email === "" || email === null) {
        validation.status = false;
        validation.addMessage("Por favor agregue un correo electrónico.", "warning")
    }
    return validation;
}

export const validateListIsNotEmpty = (validation: ValidationClass, list: any[]) => {
    if (list.length === 0) {
        validation.status = false;
        validation.addMessage("No hay registros disponibles.", "warning")
    }
    return validation;
}

export const validateExistImageSelected = (validation: ValidationClass, imageName: string):ValidationClass => {
    if (!imageName) {
        validation.status = false
        validation.addMessage("Por favor seleccione una imagen.", "warning")
    }
    return validation
}

export const validateImageOnList = (validation: ValidationClass, imageName: string):ValidationClass => {
    let filenamesList = getListFileNamesOnDir(path.join(__dirname, "../../public/images"))
    if (!filenamesList.includes(imageName)) {
        validation.status = false
        validation.addMessage("La imagen seleccionada no se encuentra en la lista de imágenes.", "warning")
    }
    return validation
}

export const validateIsNotSingleAccount = async (validation: ValidationClass):Promise<ValidationClass> => {
    let personalRepository = DataBase.getRepository(Personal)
    let personalList = await personalRepository.find()
    if (personalList.length === 1) {
        validation.status = false
        validation.addMessage("No puede eliminar la única cuenta de administrador.", "warning")
    }
    return validation
}