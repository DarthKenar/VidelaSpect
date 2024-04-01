require('dotenv').config();
const jwt = require("jsonwebtoken")
import { NextFunction, Request, Response } from "express";
import { ValidationClass } from "../interfaces/interfaces";

interface RequestId extends Request {
    userId?: string;
  }

export function verifyToken(req:RequestId, res:Response, next:NextFunction){
    const token = req.headers['x-access-token']
    if(!token){
        let validation = new ValidationClass
        validation.addMessage("El token de autenticación no existe.", "error")
        return res.render("error", {messages: validation.messages})
    }else{
        const decoded = jwt.verify(token, process.env.secret)
        req.userId = decoded.id
        next()
    }
}