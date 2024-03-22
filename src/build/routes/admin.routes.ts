const express = require('express');
const routerAdmin = express.Router();

import {
    getPanel,
    getPanelPersonal,
    getPanelRegistros,
    getCreatePersonal,
    postDeletePersonal
} from "../controllers/admin.controller"

//GET
//muestra el panel
routerAdmin.get("/panel", getPanel)
routerAdmin.get("/panel/personal", getPanelPersonal)
routerAdmin.get("/panel/personal/create", getCreatePersonal)
routerAdmin.get("/panel/personal/update", getCreatePersonal)

routerAdmin.get("/panel/registros", getPanelRegistros)

//POST
routerAdmin.post("/panel/personal/create", postDeletePersonal)
routerAdmin.post("/panel/personal/update/:id", postDeletePersonal)
routerAdmin.post("/panel/personal/delete/:id", postDeletePersonal)
module.exports = routerAdmin;