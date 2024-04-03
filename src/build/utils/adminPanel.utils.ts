import { config } from "dotenv";
import DataBase from "../../database/data-source"
import { Auth, Personal, Registro } from "../../database/entity/models"
import {Like} from 'typeorm';
import {encryptPass} from "../helpers/password.helpers"
import { Validation, ValidationClass } from "../interfaces/interfaces"
const nodemailer = require("nodemailer");
const PATH = require("path")
var xl = require('excel4node');
import fs from "fs"
import { emailIsNotEmpty, listIsNotEmpty } from "../validators/adminProfile.validator";
import { getEmailWhitUserId } from "../helpers/email.helpers";

const formalizeTitle = (title:string)=>{
    switch (title) {
        case "id":
            return "ID"
        case "name":
            return "NOMBRE"
        case "dni":
            return "DNI"
        case "position":
            return "CARGO"
        case "dailyEntries":
            return "ENTRADAS/SALIDAS"
        case "admin":
            return "ADMINISTRADOR"
        case "personal_id":
            return "ID PERSONAL"
        case "personal_name":
            return "NOMBRE"
        case "date":
            return "FECHA"
        case "time":
            return "HORA"
        default:
            return title
    }
}

export const savePersonal = async (personal:Personal, name:string, dni:string, position:string, admin:boolean, dailyEntries:number)=>{
    personal.name = name
    personal.dni = dni
    personal.position = position
    personal.admin = admin
    personal.dailyEntries = dailyEntries
    await DataBase.manager.save(personal)
}

export const saveAuth = async (personal:Personal, auth:Auth ,email:string, password:string, phone:string)=>{
    auth.personal = personal
    auth.email = email
    auth.phone = phone
    auth.password = await encryptPass(password)
    await DataBase.manager.save(auth)
}

export const deleteAuth = async (personal:Personal)=>{
    let authRepository = DataBase.getRepository(Auth)
    let authToDelete = await authRepository.findOneBy({personal: personal})
    if (authToDelete) {
        authRepository.delete(authToDelete) 
    }
}

export const getAuthOrCreate = async (personal:Personal):Promise<Auth> => {
    let authRepository = DataBase.getRepository(Auth)
    let auth = await authRepository.findOneBy({personal})
    if (auth === null) {
        auth = new Auth
    }
    return auth
}
export const getAuthOrNull = async (personal:Personal):Promise<Auth|null> => {
    let authRepository = DataBase.getRepository(Auth)
    let auth = await authRepository.findOneBy({personal})
    return auth
}

export const exportExcel = async(objectList:Personal[]|Registro[],input:string, select:string):Promise<string>=>{
    
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
        .string(formalizeTitle(attributes[index]))
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
                throw new Error("El tipo de dato a insertar en la tabla, no está definido en el admin.utils.ts");
            }
        }
    }

    let excelPath:string;

    if (objectList[0] instanceof Personal) {
        excelPath = PATH.join(__dirname, `../../database/excel/personal.xlsx`)
    }else{
        excelPath = PATH.join(__dirname, `../../database/excel/registro.xlsx`)
    }
    fs.mkdirSync(`./dist/database/excel/`,{recursive:true});
    wb.write(excelPath);
    return excelPath;
}

export const registersFiltered = async(input:string, select:string)=>{
    let registrations:Registro[];
    let registroRepository = DataBase.getRepository(Registro)
    if(select === "personal_name"){
        registrations = await registroRepository.findBy({personal_name: Like(`%${input}%`)});
    }else if(select === "fecha"){
        registrations = await registroRepository.findBy({date: Like(`%${input}%`)});
    }else if(select === "hora"){
        registrations = await registroRepository.findBy({time: Like(`%${input}%`)});
    }else{
        registrations = await registroRepository.find()
    }
    return registrations
}

export const personalFiltered = async(input:string, select:string)=>{
    let personal:Personal[];
    let personalRepository = DataBase.getRepository(Personal)
    if(select === "dni"){
        personal = await personalRepository.findBy({dni: Like(`%${input}%`)});
    }else if(select === "name"){
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
        user: process.env.EMAIL_SYSTEM,
        pass: process.env.EMAIL_PASS,
    },
    });

    // async..await is not allowed in global scope, must use a wrapper
    async function main(excelPath:string, emailAdmin:string) {
        const fileName = excelPath.split("\\").pop()
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"VidelaSpect 👁‍🗨" <${process.env.EMAIL_SYSTEM}>`, // sender address
            to: `${emailAdmin}`, // list of receivers
            subject: "Hola Administrador, su registro está listo ✔", // Subject line
            text: "👁‍🗨", // plain text body
            html: "<b>Gracias por usar VidelaSpect.<br>Recuerda cerrar su sesión en el servidor para proteger su privacidad.<br><br> Que tenga un buen día.<br><br>VidelaSpect 👁‍🗨 ", // html body
            attachments:[
                {   
                    filename: `VidelaSpect-${fileName}.xlsx`,
                    path: excelPath 
                },
            ]
        });
        
        console.log("Message sent: %s", info.messageId);
    }

    main(excelPath, emailAdmin).catch(console.error);
}

export const getPersonalWhitId = async(id:number):Promise<Personal|null>=>{
    let userId = id
    let personalRepository = DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({id: userId})
    return personal
}

export const validateAndHandleExcelExport = async(validation:ValidationClass, list:any[], emailOption:boolean, userId:any, input:string, select:string):Promise<ValidationClass>=>{
    validation = listIsNotEmpty(validation, list)
    if (emailOption) {
        let email = await getEmailWhitUserId(userId)
        validation = emailIsNotEmpty(validation, email)
        if (validation.status && email) {
            let excelPath = await exportExcel(list,input,select)
            await sendExcel(excelPath, email)
            validation.addMessage("El archivo excel se ha enviado correctamente. Por favor revise su casilla de correo no deseado.","success")
        }
    }else{
        if (validation.status) {
            await exportExcel(list,input,select)
            validation.addMessage("El archivo excel se ha descargado correctamente.","success")
        }
    }
    return validation
}