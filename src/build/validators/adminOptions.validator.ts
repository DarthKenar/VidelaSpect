import DataBase from "../../database/data-source";
import { ValidationClass } from "../interfaces/interfaces";
import { AiOptions } from "../../database/entity/models";

export const validateUpdateAiStatus = async (validation: ValidationClass ,status:boolean):Promise<ValidationClass> => {
    const generalOptionsRepository = DataBase.getRepository(AiOptions);
    const generalOptions = await generalOptionsRepository.findOneBy({id: 1});
    if (generalOptions) {
        generalOptions.status = status;
        await generalOptionsRepository.save(generalOptions);
        validation.addMessage("Estado de la inteligencia artificial actualizado correctamente.", "success")
    }
    return validation
}

export const validateUpdateAiAccuracy = async (validation: ValidationClass ,accuracy:number):Promise<ValidationClass> => {
    const generalOptionsRepository = DataBase.getRepository(AiOptions);
    const generalOptions = await generalOptionsRepository.findOneBy({id: 1});
    if (generalOptions) {
        generalOptions.accuracy = accuracy;
        await generalOptionsRepository.save(generalOptions);
        validation.addMessage("Precisión de la inteligencia artificial actualizada correctamente.", "success")
    }
    return validation
}