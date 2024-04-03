const express = require('express');
const routerProfile = express.Router();

import {
    getProfile,
    getProfileEmail,
    getProfilePassword,
    postProfileEmail,
    postProfilePassword
} from "../controllers/adminProfile.controller"

//GET
routerProfile.get("", getProfile)
routerProfile.get("/email", getProfileEmail)
routerProfile.get("/password", getProfilePassword)

//POST
routerProfile.post("/email/send", postProfileEmail)
routerProfile.post("/password/send", postProfilePassword)

module.exports = routerProfile;