import DataBase from "../../database/data-source"
import { Personal } from "../../database/entity/models"

export const buildPersonal = async (personal:Personal, nombre:string, dni:string, position:string, admin:boolean, dailyEntries:number)=>{
    personal.name = nombre
    personal.dni = dni
    personal.position = position
    personal.admin = admin
    personal.dailyEntries = dailyEntries
    await DataBase.manager.save(personal)
}