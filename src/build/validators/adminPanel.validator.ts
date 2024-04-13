import DataBase from "../../database/data-source"
import { Personal, UserInOutRecords } from "../../database/entity/models"
import { ValidationClass } from "../interfaces/interfaces"
import { exportExcel, getEmailWhitUserId, sendExcel } from "../utils/adminPanel.utils"
import { validateEmailIsNotEmpty, validateListIsNotEmpty } from "./adminProfile.validator"
import * as fs from 'fs';

export const validateAndHandleExcelExport = async(validation:ValidationClass, list:any[], emailOption:boolean, userId:any, input:string, select:string):Promise<ValidationClass>=>{
    validation = validateListIsNotEmpty(validation, list)
    if (emailOption) {
        console.log(userId)
        let email = await getEmailWhitUserId(userId)
        validation = validateEmailIsNotEmpty(validation, email)
        if (validation.status && email) {
            let excelPath = await exportExcel(list,input,select)
            validation = await sendExcel(validation, excelPath, email)
        }
    }else{
        if (validation.status) {
            await exportExcel(list,input,select)
            validation.addMessage("El archivo excel se ha descargado correctamente.","success")
        }
    }
    return validation
}

export const validatePersonWithDniDoesNotExist = async (validation:ValidationClass, dni:string, personalToUpdate?:Personal)=>{
    let personalRepository = await DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({dni})
    if (personal && personalToUpdate === undefined) {
        validation.status = false
        validation.addMessage(`Ya existe un usuario con un dni ${dni} registrado en el sistema.`,"warning")
    }
    if(personalToUpdate && personal){
        if (!(personalToUpdate.dni === personal.dni)) {
            validation.status = false
            validation.addMessage(`Ya existe un usuario con un dni ${dni} registrado en el sistema.`,"warning")
        }
    }
    return validation
}

export const validateDniFormat = (validation:ValidationClass, dni:string): ValidationClass => {
    const dniRegex = /^[0-9]{8}$/;
    if(!dniRegex.test(dni)){
        validation.status = false
        validation.addMessage(`El dni no tiene un formato válido, por favor revise la información y vuelva a intentarlo.`,"warning")
    }
    return validation
}

export const validatePhotoExist = async (validation:ValidationClass, photoPath:string):Promise<ValidationClass>=>{
    if (!photoPath|| !fs.existsSync(photoPath)) {
        validation.status = false
        validation.addMessage(`La foto buscada de no se encuentra.`,"error")
    }
    return validation
}
