import "reflect-metadata"
import { DataSource } from "typeorm"
import { Personal, Registro, Auth } from "./entity/models"
import { saveAuth, savePersonal } from "../build/utils/admin.utils";

const PATH = require("path")

async function createBasicPersonal(){
    let personal = new Personal;
    await savePersonal(personal,"administrador","00000000","admin",true,0)
    await saveAuth(personal,"ejemplovidelaspect@yopmail.com","1234")
}

function getDataSource(): DataSource {
    switch (process.env.NODE_ENV) {
        case "production":
            console.log("Base de datos establecida para el entorno de producción")
            let dataProd = new DataSource({
                type: "sqlite",
                database: PATH.join(__dirname, "../database/productiondatabase.sqlite"),
                synchronize: false,
                logging: false,
                entities: [Personal, Registro, Auth],
                migrations: [],
                subscribers: [], 
            });
            dataProd.initialize()
            return dataProd
        case "dev":
            console.log("Base de datos establecida para el entorno de desarrollo")
            let dataDev = new DataSource({
                type: "sqlite",
                database: PATH.join(__dirname, "../database/devdatabase.sqlite"),
                synchronize: true,
                logging: false,
                entities: [Personal, Registro, Auth],
                migrations: [],
                subscribers: [], 
            });
            dataDev.initialize()
                .then(async ()=>{
                    await createBasicPersonal()
                })
            return dataDev
        case "test":
            console.log("Base de datos establecida para el entorno de testing")
            let dataTest = new DataSource({
                type: "sqlite",
                database: PATH.join(__dirname, "../database/testdatabase.sqlite"),
                synchronize: true,
                logging: false,
                entities: [Personal, Registro, Auth],
                migrations: [],
                subscribers: [], 
            });
            return dataTest
        default:
            throw new Error("La base de datos no se exportará, no hay un entorno de desarrollo establecido.");
    }
}

const DataBase = getDataSource();
export default DataBase;
