import DataBase from "../../database/data-source"
import { Auth, Personal, UserInOutRecords } from "../../database/entity/models"
import {Like} from 'typeorm';
import { Between } from 'typeorm';
import {encryptPass} from "../helpers/bcrypt.helpers"
import { ValidationClass } from "../interfaces/interfaces"
import { format } from "@formkit/tempo"
const nodemailer = require("nodemailer");
const PATH = require("path")
var xl = require('excel4node');
import fs from "fs"


export const formalizeTitle = (title:string)=>{
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
        case "dateTime":
            return "FECHA Y HORA"
        default:
            return title
    }
}

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

export const exportExcel = async(objectList:Personal[]|UserInOutRecords[],input:string, select:string):Promise<string>=>{
    
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

async function getRecordsBetweenDates(fromDate: string, toDate: string):Promise<UserInOutRecords[]> {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    let userInOutRecords = DataBase.getRepository(UserInOutRecords)
    const records = await userInOutRecords.find({
        where: {
            dateTime: Between(from, to)
        }
    });
    console.log(records)
    return records;
}

async function getRecordsBetweenTimes(fromTime: string, toTime: string): Promise<UserInOutRecords[]> {
    let userInOutRecords = DataBase.getRepository(UserInOutRecords)
    console.log(`fromTime -- ${fromTime}, toTime ${toTime}`)
    // Crear el query builder
    const qb = userInOutRecords.createQueryBuilder("record");

    // Obtener los registros entre las horas
    const records = await qb
        .where(`strftime('%H:%M:%S', record.dateTime) BETWEEN :from AND :to`, { from: fromTime, to: toTime })
        .getMany();

    console.log(records, "<-- Records")
    return records;
}

export const registersFiltered = async(name:string, select:string, fromTime:string, toTime:string, fromDate:string, toDate:string):Promise<UserInOutRecords[]>=>{
    let userInOutRecords:UserInOutRecords[];
    let userInOutRecordsRepository = DataBase.getRepository(UserInOutRecords)
    let variables = [name, fromTime, toTime, fromDate, toDate];
    console.log(variables)
    if (variables.every(variable => variable === undefined || variable === null || variable === '' || variable === 'undefined')) {
        userInOutRecords = await userInOutRecordsRepository.find();
    }else{
        if(select === "personal_name"){
            userInOutRecords = await userInOutRecordsRepository.findBy({personal_name: Like(`%${name}%`)});
        }else if(select === "date"){
            userInOutRecords = await getRecordsBetweenDates(fromDate,toDate)
        }else if(select === "time"){
            console.log("TIME")
            userInOutRecords = await getRecordsBetweenTimes(fromTime,toTime)
        }else{
            userInOutRecords = await userInOutRecordsRepository.find()
        }
    }
    console.log(userInOutRecords)
    return userInOutRecords
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

export const sendExcel = async(validation:ValidationClass ,excelPath:string, emailAdmin:string)=>{
    try {
        const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.EMAIL_PASS,
        },
        });
        const fileName = excelPath.split("\\").pop()
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"VidelaSpect 👁‍🗨" <${process.env.EMAIL_ADMIN}>`, // sender address
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
        validation.addMessage("El archivo excel se ha enviado correctamente. Por favor revise su casilla de correo no deseado.","success")
        return validation
    } catch (err) {
        console.log(err)
        validation.addMessage("No se pudo enviar el archivo excel, por favor compruebe su conexión a internet.","warning")
        return validation
    }
}

export const getPersonalWhitId = async(id:number):Promise<Personal|null>=>{
    let userId = id
    let personalRepository = DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({id: userId})
    return personal
}

export const getPhotoPath = async (recordId:number):Promise<string>=>{
    let recordRepository = DataBase.getRepository(UserInOutRecords)
    let record = await recordRepository.findOneBy({id: recordId})
    if (record) {
        return PATH.join(__dirname, `../../database/fotos//${record.dateTime.getFullYear()}/${record.dateTime.getMonth()}/${recordId}.png`)
    }else{
        return ""
    }
}

