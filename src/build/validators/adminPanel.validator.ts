import { ValidationClass } from "../interfaces/interfaces"
import { exportExcel, getEmailWhitUserId, sendExcel } from "../utils/adminPanel.utils"
import { validateEmailIsNotEmpty, validateListIsNotEmpty } from "./adminProfile.validator"

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