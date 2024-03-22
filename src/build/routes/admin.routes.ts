const express = require('express');
const routerAdmin = express.Router();

import {
    getPanel,
    getPanelPersonal,
    getPanelRegistros,
    getCreatePersonal,
    getUpdatePersonal,
    postCreatePersonal,
    postUpdatePersonal,
    postDeletePersonal
} from "../controllers/admin.controller"

//GET
//muestra el panel
routerAdmin.get("/panel", getPanel) //OK
routerAdmin.get("/panel/personal", getPanelPersonal) //OK
routerAdmin.get("/panel/personal/create", getCreatePersonal)
routerAdmin.get("/panel/personal/update", getUpdatePersonal) 

routerAdmin.get("/panel/registros", getPanelRegistros)

//POST
routerAdmin.post("/panel/personal/create", postCreatePersonal)
routerAdmin.post("/panel/personal/update/:id", postUpdatePersonal)
routerAdmin.post("/panel/personal/delete/:id", postDeletePersonal)
module.exports = routerAdmin;