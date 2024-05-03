import DataBase from "../../database/data-source"
import { AiOptions } from "../../database/entity/models";

/**
 * Obtiene las opciones establecidas para la inteligencia artificial (ej: estado, sensibilidad, etc) y en caso de no estar guardadas en la base de datos, las crea.
 * @return {object} - Diccionario de opciones.
 */
export const getAiOptionsOrCreate = async ():Promise<AiOptions> => {
    const generalOptionsRepository = DataBase.getRepository(AiOptions);
    let aiOptions = await generalOptionsRepository.findOneBy({id: 1});
    if (!aiOptions) {
        aiOptions = generalOptionsRepository.create({id:1, status: true, accuracy: 0.8});
        await generalOptionsRepository.save(aiOptions);
    }
    return aiOptions
}