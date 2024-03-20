const express = require('express');
const routerPersonal = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import {
  getRegistroDNI,
  getRegistroFoto,
  postRegistroDNI,
  postRegistroFoto,
  get500
} from "../controllers/personal.controller"

//GET
routerPersonal.get("/dni", getRegistroDNI)
routerPersonal.get("/foto", getRegistroFoto)
//POST
routerPersonal.post("/dni/send", postRegistroDNI)
routerPersonal.post("/foto/send",upload.single('image'), postRegistroFoto)

//ERRORES
routerPersonal.get("/500", get500)

module.exports = routerPersonal;

/*
Admin
Personal
Personal/DNI/send
Personal/Foto/send
Personal/confirmar
Personal/
*/