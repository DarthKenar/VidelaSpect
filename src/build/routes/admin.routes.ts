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
routerAdmin.get("", getPanel) //OK
routerAdmin.get("/personal", getPanelPersonal) //OK
routerAdmin.get("/personal/create", getCreatePersonal) //OK
routerAdmin.get("/personal/update/:id", getUpdatePersonal) 
routerAdmin.get("/personal/search/", getPanelPersonalFiltered) 
routerAdmin.get("/personal/excel", getPanelPersonalExcel)
//registros
routerAdmin.get("/registros/search/", getPanelRegistersFiltered) 
routerAdmin.get("/registros", getPanelRegisters)
routerAdmin.get("/registros/foto/:id", getPanelRegisterPhoto)
routerAdmin.get("/registros/excel", getPanelRegisterExcel)
//POST
routerAdmin.post("/personal/create", postCreatePersonal) //OK
routerAdmin.post("/personal/update/:id", postUpdatePersonal)
routerAdmin.post("/personal/delete/:id", postDeletePersonal) 
module.exports = routerAdmin;