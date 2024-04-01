require('dotenv').config();
const jwt = require("jsonwebtoken")
import { NextFunction, Request, Response } from "express";
import { ValidationClass } from "../interfaces/interfaces";

interface RequestId extends Request {
    userId?: string;
  }

  export function verifyToken(req:RequestId, res:Response, next:NextFunction){
    console.log("verify token")
    const token = req.cookies.token
    if(!token){
        let validation = new ValidationClass
        validation.addMessage("Usted no tiene permisos de administrador para acceder a esta sección.", "error")
        return res.render("error", {messages: validation.messages})
    }else{
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        console.log(decoded)
        req.userId = decoded.id
        next()
    }
}