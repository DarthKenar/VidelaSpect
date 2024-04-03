const express = require('express');
const routerProfile = express.Router();

import {
    getProfile,
} from "../controllers/adminProfile.controller"

routerProfile.get("", getProfile)

module.exports = routerProfile;