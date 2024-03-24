import "reflect-metadata"
import express from 'express';
import { Request, Response, NextFunction } from 'express';
const exphbs  = require('express-handlebars');

const app = express()
const PATH = require("path")
const bodyParser = require('body-parser');
import { if_eq,  } from "./utils/helpers"
//Handlebars config
var hbs = exphbs.create({
    helpers: {if_eq}
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './dist/views');
//

//Middlewares
app.use(express.json());
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

const routerAdmin = require('./routes/admin.routes');
app.use('/admin', routerAdmin)
//...

app.use("/",(req:Request, res:Response)=>{
    console.log(req.method)
    console.log(req.body)
    console.log(req.path)
    res.redirect("/personal/dni")
})

export default app;