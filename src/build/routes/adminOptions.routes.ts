const express = require('express');
const routerOptions = express.Router();

import {
    getOptions,
    getIa,
    postAiOptions,
    getRegisterDelete,
    postRegisterDelete,

} from "../controllers/adminOptions.controller"

//GET
routerOptions.get("", getOptions)
routerOptions.get("/ai", getIa)
routerOptions.get("/records/del", getRegisterDelete)

//POST
routerOptions.post("/ai/send", postAiOptions)

routerOptions.post("/records/del/send", postRegisterDelete)


module.exports = routerOptions;