import DataBase from "../../database/data-source"
import { AiOptions } from "../../database/entity/models";
import { ValidationClass } from "../interfaces/interfaces";

export const updateAiStatus = async (validation: ValidationClass ,status:boolean):Promise<ValidationClass> => {
    const generalOptionsRepository = DataBase.getRepository(AiOptions);
    const generalOptions = await generalOptionsRepository.findOneBy({id: 1});
    if (generalOptions) {
        generalOptions.status = status;
        await generalOptionsRepository.save(generalOptions);
        validation.addMessage("Estado de la inteligencia artificial actualizado correctamente.", "success")
    }
    return validation
}

export const updateAiAccuracy = async (validation: ValidationClass ,accuracy:number):Promise<ValidationClass> => {
    const generalOptionsRepository = DataBase.getRepository(AiOptions);
    const generalOptions = await generalOptionsRepository.findOneBy({id: 1});
    if (generalOptions) {
        generalOptions.accuracy = accuracy;
        await generalOptionsRepository.save(generalOptions);
        validation.addMessage("Precisión de la inteligencia artificial actualizada correctamente.", "success")
    }
    return validation
}

export const getAiOptionsOrCreate = async ():Promise<AiOptions> => {
    const generalOptionsRepository = DataBase.getRepository(AiOptions);
    let aiOptions = await generalOptionsRepository.findOneBy({id: 1});
    if (!aiOptions) {
        aiOptions = generalOptionsRepository.create({id:1, status: true, accuracy: 0.8});
        await generalOptionsRepository.save(aiOptions);
    }
    return aiOptions
}