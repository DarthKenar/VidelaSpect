require('dotenv').config();
const jwt = require("jsonwebtoken")
import { NextFunction, Request, Response } from "express";
import { ValidationClass } from "../interfaces/interfaces";


export function verifyToken(req:Request, res:Response, next:NextFunction){
    const token = req.cookies.token
    if(!token){
        let validation = new ValidationClass
        validation.addMessage("Usted no tiene permisos de administrador para acceder a esta sección.", "error")
        return res.render("error", {messages: validation.messages})
    }else{
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        next()
    }
}