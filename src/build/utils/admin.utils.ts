import { config } from "dotenv";
import DataBase from "../../database/data-source"
import { User, Registro } from "../../database/entity/models"
import {Like} from 'typeorm';
const nodemailer = require("nodemailer");
const PATH = require("path")
var xl = require('excel4node');

export const buildPersonal = async (personal:User, nombre:string, dni:string, position:string, admin:boolean, dailyEntries:number)=>{
    personal.name = nombre
    personal.dni = dni
    personal.position = position
    personal.admin = admin
    personal.dailyEntries = dailyEntries
    await DataBase.manager.save(personal)
}

export const exportExcel = async(objectList:User[]|Registro[],input:string, select:string, sendEmail:boolean):Promise<string>=>{
    
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

    let excelPath:string;

    if (objectList[0] instanceof User) {
        excelPath = PATH.join(__dirname, `../../database/excel/personal.xlsx`)
    }else{
        excelPath = PATH.join(__dirname, `../../database/excel/registro.xlsx`)
    }

    wb.write(excelPath);
    return excelPath;
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
    let personal:User[];
    let personalRepository = DataBase.getRepository(User)
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

export const sendExcel = async(excelPath:string, emailAdmin:string)=>{

    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });

    // async..await is not allowed in global scope, must use a wrapper
    async function main(excelPath:string, emailAdmin:string) {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"VidelaSpect 👁‍🗨" <${process.env.EMAIL_USER}>`, // sender address
            to: `${emailAdmin}`, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
            attachments:[
                {   
                    filename: 'registros.xlsx',
                    path: excelPath 
                },
            ]
        });

        console.log("Message sent: %s", info.messageId);
    }

    main(excelPath, emailAdmin).catch(console.error);
}