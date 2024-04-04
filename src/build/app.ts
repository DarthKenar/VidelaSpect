import "reflect-metadata"
import express from 'express';
import { Request, Response, NextFunction } from 'express';

const exphbs  = require('express-handlebars');
const app = express()
const PATH = require("path")
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
import { verifyToken } from "./middlewares/verifyToken.middleware"
import { if_eq, capitalizeFirstLetter } from "./helpers/handlebars.helpers"

//Handlebars config
    var hbs = exphbs.create({
        helpers: {if_eq, capitalizeFirstLetter}
    });
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.set('views', './dist/views');
//

//Middlewares
app.use(express.json());
app.use(cookieParser())
app.use(express.static(PATH.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
//

app.use((req:Request, res:Response, next:NextFunction)=>{
    if(req.method !== "GET" && req.method !== "DELETE" && req.method !== "POST"){
        res.status(501).json({error:"El método solicitado no está soportado por el servidor y no puede ser manejado."})
    }else{
        next()
    }
})

//Routers
const routerPersonal = require('./routes/personal.routes');
app.use('/personal', routerPersonal)

const routerAdminPanel = require('./routes/adminPanel.routes');
app.use('/admin/panel', verifyToken, routerAdminPanel)

const routerAdminProfile = require('./routes/adminProfile.routes');
app.use('/admin/profile', verifyToken, routerAdminProfile)

const routerAdminOptions = require('./routes/adminOptions.routes');
app.use('/admin/options', verifyToken, routerAdminOptions)
//...

app.use("/",(req:Request, res:Response)=>{
    console.log(req.method)
    console.log(req.body)
    console.log(req.path)
    res.redirect("/personal/dni")
})

export default app;