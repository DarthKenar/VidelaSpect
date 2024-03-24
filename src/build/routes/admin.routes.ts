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
    postDeletePersonal,
    getPanelRegistroFoto
} from "../controllers/admin.controller"

//GET
//muestra el panel
routerAdmin.get("/panel", getPanel) //OK
routerAdmin.get("/panel/personal", getPanelPersonal) //OK
routerAdmin.get("/panel/personal/create", getCreatePersonal) //OK
routerAdmin.get("/panel/personal/update/:id", getUpdatePersonal) 

routerAdmin.get("/panel/registros", getPanelRegistros)
routerAdmin.get("/panel/registros/foto/:id", getPanelRegistroFoto)


//POST
routerAdmin.post("/panel/personal/create", postCreatePersonal) //OK
routerAdmin.post("/panel/personal/update/:id", postUpdatePersonal)
routerAdmin.post("/panel/personal/delete/:id", postDeletePersonal) 
module.exports = routerAdmin;