const express = require('express');
const routerPersonal = express.Router();

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
routerPersonal.get("/dni/send", postRegistroDNI)
routerPersonal.get("/foto/send", postRegistroFoto)

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