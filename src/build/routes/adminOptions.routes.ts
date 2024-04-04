const express = require('express');
const routerOptions = express.Router();

import {
    getOptions,
    getIa,
    postAiOptions
} from "../controllers/adminOptions.controller"

//GET
routerOptions.get("", getOptions)
routerOptions.get("/ai", getIa)
routerOptions.post("/ai/send", postAiOptions)

module.exports = routerOptions;