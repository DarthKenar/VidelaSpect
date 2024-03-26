const express = require('express');
const routerAdmin = express.Router();

import {
    getPanel,
    getPanelPersonal,
    getPanelRegisters,
    getCreatePersonal,
    getUpdatePersonal,
    postCreatePersonal,
    postUpdatePersonal,
    postDeletePersonal,
    getPanelRegisterPhoto,
    getPanelPersonalFiltered,
    getPanelRegistersFiltered,
    getPanelPersonalExcel,
    getPanelRegisterExcel
} from "../controllers/admin.controller"

//GET
//muestra el panel
//personal
routerAdmin.get("/panel", getPanel) //OK
routerAdmin.get("/panel/personal", getPanelPersonal) //OK
routerAdmin.get("/panel/personal/create", getCreatePersonal) //OK
routerAdmin.get("/panel/personal/update/:id", getUpdatePersonal) 
routerAdmin.get("/panel/personal/search/", getPanelPersonalFiltered) 
routerAdmin.get("/panel/personal/excel", getPanelPersonalExcel)
//registros
routerAdmin.get("/panel/registros/search/", getPanelRegistersFiltered) 
routerAdmin.get("/panel/registros", getPanelRegisters)
routerAdmin.get("/panel/registros/foto/:id", getPanelRegisterPhoto)
routerAdmin.get("/panel/registros/excel", getPanelRegisterExcel)
//POST
routerAdmin.post("/panel/personal/create", postCreatePersonal) //OK
routerAdmin.post("/panel/personal/update/:id", postUpdatePersonal)
routerAdmin.post("/panel/personal/delete/:id", postDeletePersonal) 
module.exports = routerAdmin;