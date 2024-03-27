import DataBase from "../../database/data-source"
import { Personal, Registro } from "../../database/entity/models"
import {Like} from 'typeorm';

var xl = require('excel4node');

export const buildPersonal = async (personal:Personal, nombre:string, dni:string, position:string, admin:boolean, dailyEntries:number)=>{
    personal.name = nombre
    personal.dni = dni
    personal.position = position
    personal.admin = admin
    personal.dailyEntries = dailyEntries
    await DataBase.manager.save(personal)
}

export const exportExcel = async(objectList:Personal[]|Registro[],input:string, select:string)=>{
    
    console.log(objectList)
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet(`${typeof objectList}`);
    let attributes = Object.keys(objectList[0])
    var styleHeader = wb.createStyle({
        font: {
            color: '#cc0000',
            size: 16,
        },
    });
    var styleBody = wb.createStyle({
        font: {
            color: '#000000',
            size: 12,
        },
    });
    //Header de la tabla
    for(let index = 0; index < attributes.length; index++){
        ws.cell(1, index+1)
        .string(attributes[index])
        .style(styleHeader);
    }
    //Cuerpo de la tabla
    for(let i = 0; i < objectList.length; i++){
        for (let j = 0; j < attributes.length; j++) {
            if (typeof objectList[i][attributes[j]] === "string") {
                ws.cell(i+2, j+1)
                .string(objectList[i][attributes[j]])
                .style(styleBody);
            }else if(typeof objectList[i][attributes[j]] === "number"){
                ws.cell(i+2, j+1)
                .number(objectList[i][attributes[j]])
                .style(styleBody);
            }else if(typeof objectList[i][attributes[j]] === "boolean"){
                ws.cell(i+2, j+1)
                .bool(objectList[i][attributes[j]])
                .style(styleBody);
            }else{
                console.log("El tipo de dato a insertar en la tabla, no está definido en el utils")
            }
        }
    }
    if (objectList[0] instanceof Personal) {
        wb.write(`Personal.xlsx`);
    }else if(objectList[0] instanceof Registro){
        wb.write(`Registro.xlsx`);
    }
    
}

export const registersFiltered = async(input:string, select:string)=>{
    let registros:Registro[];
    let registroRepository = DataBase.getRepository(Registro)
    if(select === "personal_name"){
        registros = await registroRepository.findBy({personal_name: Like(`%${input}%`)});
    }else if(select === "fecha"){
        registros = await registroRepository.findBy({date: Like(`%${input}%`)});
    }else if(select === "hora"){
        registros = await registroRepository.findBy({time: Like(`%${input}%`)});
    }else{
        registros = await registroRepository.find()
    }
    return registros
}

export const personalFiltered = async(input:string, select:string)=>{
    let personal:Personal[];
    let personalRepository = DataBase.getRepository(Personal)
    if(select === "dni"){
        personal = await personalRepository.findBy({dni: Like(`%${input}%`)});
    }else if(select === "name"){
        console.log("name")
        personal = await personalRepository.findBy({name: Like(`%${input}%`)});
        
    }else{
        personal = await personalRepository.find()
    }
    return personal
}