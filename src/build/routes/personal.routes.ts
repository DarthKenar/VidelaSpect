const express = require('express');
const routerPersonal = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import {
  getRegistroDNI,
  postRegistroDNI,
  postRegistroFoto,
  postRegistroFotoOk,
  getErrorTemplate
} from "../controllers/personal.controller"

//GET
routerPersonal.get("/dni", getRegistroDNI)
//POST
routerPersonal.get("/foto/send/:id", postRegistroFotoOk)
routerPersonal.post("/dni/send", postRegistroDNI)
routerPersonal.post("/foto/send",upload.single('image'), postRegistroFoto)

//ERRORES
routerPersonal.get("/error", getErrorTemplate)

module.exports = routerPersonal;

/*
Admin
Personal
Personal/DNI/send
Personal/Foto/send
Personal/confirmar
Personal/
*/