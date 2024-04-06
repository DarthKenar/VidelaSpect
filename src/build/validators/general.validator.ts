import { ValidationClass } from "../interfaces/interfaces";
import { validateUpdateAiAccuracy, validateUpdateAiStatus } from "./adminOptions.validator";
import { validateEmailMinLength, validateEmailSameOldAndNew, ValidateEmailFormat } from "./adminProfile.validator";

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