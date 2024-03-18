const express = require('express');
const routerRegistro = express.Router();

import {
  getIndex,
  postRegistro
} from "../controllers/registro.controller"

routerRegistro.get("/", getIndex)
routerRegistro.post("/", postRegistro)

module.exports = routerRegistro;