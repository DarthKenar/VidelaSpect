const express = require('express');
const routerAdmin = express.Router();

import {
    getPanel,
    getPanelPersonal,
    getPanelRegistros,
} from "../controllers/admin.controller"

//GET
//muestra el panel
routerAdmin.get("/panel", getPanel)
routerAdmin.get("/panel/personal", getPanelPersonal)
routerAdmin.get("/panel/registros", getPanelRegistros)
//POST

module.exports = routerAdmin;