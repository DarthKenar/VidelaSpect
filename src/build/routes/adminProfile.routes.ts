const express = require('express');
const routerProfile = express.Router();

import {
    getProfile,
    getProfileEmail,
    getProfilePassword,
    getProfileImage,
    postProfileEmail,
    postProfilePassword,
    postProfileImage,
    postDeleteAccount
} from "../controllers/adminProfile.controller"

//GET
routerProfile.get("", getProfile)
routerProfile.get("/email", getProfileEmail)
routerProfile.get("/password", getProfilePassword)
routerProfile.get("/image", getProfileImage)

//POST
routerProfile.post("/email/send", postProfileEmail)
routerProfile.post("/password/send", postProfilePassword)
routerProfile.post("/image/send", postProfileImage)
routerProfile.post("/delete/send", postDeleteAccount)

module.exports = routerProfile;