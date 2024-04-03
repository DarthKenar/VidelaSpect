import DataBase from "../../database/data-source";
import { Personal } from "../../database/entity/models";
import { getAuthOrCreate } from "../utils/adminPanel.utils";

export const getEmailWhitUserId = async (userId:number):Promise<string|null>=>{
    let personalRepository = DataBase.getRepository(Personal)
    let user = await personalRepository.findOneBy({id:userId})
    if (user) {
        let auth = await getAuthOrCreate(user)
        return auth.email
    }else{
        return null
    }
}