import "reflect-metadata"
import { DataSource } from "typeorm"
import { Personal, Registro, Auth, PersonalUi} from "./entity/models"
import { saveAuth, savePersonal } from "../build/utils/adminPanel.utils";

const PATH = require("path")

async function createBasicPersonal(){
    let existsPersonal:boolean = await DataBase.getRepository(Personal).existsBy({dni:"00000000"})
    if(!existsPersonal){
        let personal = new Personal;
        await savePersonal(personal,"administrador","00000000","admin",true,0)
        let auth = new Auth
        await saveAuth(personal,auth,"ejemplovidelaspect@yopmail.com","1234","")
    }
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
                entities: [Personal, Registro, Auth, PersonalUi],
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
                entities: [Personal, Registro, Auth, PersonalUi],
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
                entities: [Personal, Registro, Auth, PersonalUi],
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
