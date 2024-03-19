const express = require('express');
const routerRegistro = express.Router();

import {
  getIndex,
  postRegistro,
  getCamera
} from "../controllers/registro.controller"

routerRegistro.get("/", getIndex)
routerRegistro.post("/", postRegistro)
routerRegistro.get("/cam", getCamera)

module.exports = routerRegistro;