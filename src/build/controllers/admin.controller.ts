import { Request, Response } from "express";
import { Personal, Registro } from "../../database/entity/models";
import DataBase from "../../database/data-source";

export const getPanel = async (req:Request, res:Response)=>{
    res.render("adminPanel")
}

export const getPanelPersonal = async (req:Request, res:Response)=>{
    let personalRepository = DataBase.getRepository(Personal)
    let personal:Personal[] = await personalRepository.find()
    console.log(personal)
    res.render("adminPanelPersonal", {personal})
}

export const getPanelRegistros = async (req:Request, res:Response)=>{
    let registroRepository = DataBase.getRepository(Registro)
    let registro:Registro[] = await registroRepository.find()
    console.log(registro)
    res.render("adminPanelRegistros",{registro})
}

export const getCreatePersonal = async (req:Request, res:Response)=>{
    res.render("adminPersonalCreate")
}

export const getUpdatePersonal = async (req:Request, res:Response)=>{
    let personalId = req.params.id
    let personalRepository = DataBase.getRepository(Personal)
    let personal = await personalRepository.findOneBy({id: Number(personalId)})
    res.render("adminPersonalUpdate",{personal})
}

export const postCreatePersonal = async (req:Request, res:Response)=>{
    try{
        let nombre:string = req.body.nombre
        let dni:string = req.body.dni
        let cargo:string = req.body.cargo
        let entradasDiarias:number = Number(req.body.entradasDiarias)
        let admin:boolean;
        if (nombre.length === 0 || dni.length === 0 || cargo.length === 0 || entradasDiarias === 1 ) {
            throw new Error("Alguno de los datos del personal están vacíos y no se guardará");
        }
        if(req.body.admin){
            admin = true
        }else{
            admin = false
        }
        let personal = new Personal
        personal.name = nombre
        personal.dni = dni
        personal.position = cargo
        personal.admin = admin
        personal.dailyEntries = entradasDiarias
        await DataBase.manager.save(personal)
        res.render("adminPersonalCreate",{message:"El personal fue guardado correctamente.", type:"success"})
    }catch(err){
        console.log("")
        res.render("adminPersonalCreate",{message:"Se deben completar todos los datos antes de intentar guardar un nuevo miembro del personal.", type: "warning"})
    }
}

export const postUpdatePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = Number(req.params.id)
        let personalRepository = DataBase.getRepository(Personal)
        let personalToUpdate = await personalRepository.findOneBy({id: personalId})
        if (personalToUpdate) {
            let nombre:string = req.body.nombre
            let dni:string = req.body.dni
            let cargo:string = req.body.cargo
            let entradasDiarias:number = Number(req.body.entradasDiarias)
            let admin:boolean;
            if (nombre.length === 0 || dni.length === 0 || cargo.length === 0 ) {
                throw new Error("Alguno de los datos del personal están vacíos y no se guardará");
            }
            if(req.body.admin){
                admin = true
            }else{
                admin = false
            }
            personalToUpdate.name = nombre
            personalToUpdate.dni = dni
            personalToUpdate.position = cargo
            personalToUpdate.admin = admin
            personalToUpdate.dailyEntries = entradasDiarias
            await DataBase.manager.save(personalToUpdate)
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal, message:`Se ha modificado correctamente a ${personalToUpdate.name}`, type:"info"})
        }
    }catch(err){
        console.log(err)
        res.render("adminPersonalUpdate",{message:`${err}`, type:"error"})
    }
}

export const postDeletePersonal = async (req:Request, res:Response)=>{
    try{
        let personalId = Number(req.params.id)
        let personalRepository = DataBase.getRepository(Personal)
        let personalToDelete = await personalRepository.findOneBy({id: personalId})
        if(personalToDelete){
            let personalToDeleteName = personalToDelete.name
            await personalRepository.delete(personalToDelete)
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal,message:`${personalToDeleteName} se ha eliminado correctamente del personal.`, type:"success"})
        }else{
            let personal = await personalRepository.find()
            res.render("adminPanelPersonal",{personal, message:`La eliminación del personal no se ha podido concretar.`, type:"error"})
        }
    }catch(err){
        console.log(err)
        return res.render("adminPanel")
    }
}
export const getPanelRegistroFoto = async (req:Request, res:Response)=>{
    let registroId = req.params.id
    
}