const express = require('express');
const routerOptions = express.Router();

import {
    getOptions,
    getIa,
    postAiOptions,
    getRegisterDelete
} from "../controllers/adminOptions.controller"

//GET
routerOptions.get("", getOptions)
routerOptions.get("/ai", getIa)
routerOptions.get("/records/del", getRegisterDelete)

//POST
routerOptions.post("/ai/send", postAiOptions)


module.exports = routerOptions;