import { ValidationClass } from "../interfaces/interfaces";
import { validateUpdateAiAccuracy, validateUpdateAiStatus } from "./adminOptions.validator";
import { validateEmailMinLength, validateEmailSameOldAndNew, ValidateEmailFormat } from "./adminProfile.validator";
import { validateArePasswordsEmpty, validateArePasswordsEqual, validateArePasswordsMinLength } from "./personal.validator";

export const emailValidations = (validation: ValidationClass, emailOld: string, emailNew:string): ValidationClass => {
    validation = validateEmailSameOldAndNew(validation, emailOld, emailNew)
    validation = ValidateEmailFormat(validation, emailNew)
    validation = validateEmailMinLength(validation, emailNew)
    return validation
};

export const aiValidations = async (validation: ValidationClass, status: boolean, accuracy: number): Promise<ValidationClass> => {
    validation = await validateUpdateAiStatus(validation, status)
    validation = await validateUpdateAiAccuracy(validation, accuracy)
    return validation
}

export const validatePassword = (validation:ValidationClass,password:string, password2:string):ValidationClass=>{
    validation = validateArePasswordsEmpty(validation, password, password2)
    validation = validateArePasswordsEqual(validation, password, password2)
    validation = validateArePasswordsMinLength(validation, password, password2, 8)
    return validation
}
