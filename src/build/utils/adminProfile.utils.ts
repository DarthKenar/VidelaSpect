import DataBase from "../../database/data-source";
import { PersonalUi , Personal } from "../../database/entity/models";
const fs = require('fs');

export const getListFileNamesOnDir = (dirPath: string): string[] => {
    //https://www.geeksforgeeks.org/node-js-fs-readdirsync-method/
    try {
        let filenamesList = fs.readdirSync(dirPath);
        return filenamesList;
    } catch (err) {
        console.error(err);
        return [];
    }
}

export const getPersonalUiOrCreate = async (personal: Personal):Promise<PersonalUi> => {
    let personalUiRepository = DataBase.getRepository(PersonalUi)
    let personalUi = await personalUiRepository.findOneBy({personal: personal})
    if (!personalUi) {
        personalUi = new PersonalUi
        personalUi.profile_image_name = ""
        personalUi.personal = personal
        await DataBase.manager.save(personalUi)
    }
    return personalUi
}

