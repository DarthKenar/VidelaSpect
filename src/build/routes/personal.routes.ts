const express = require('express');
const routerPersonal = express.Router();

import {
  getRegistroDNI,
  getRegistroFoto
} from "../controllers/personal.controller"

routerPersonal.get("/dni", getRegistroDNI)
routerPersonal.get("/foto", getRegistroFoto)

module.exports = routerPersonal;

/*
Admin
Personal
Personal/DNI/send
Personal/Foto/send
Personal/confirmar
Personal/
*/