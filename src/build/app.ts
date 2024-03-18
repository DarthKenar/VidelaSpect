import "reflect-metadata"
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { engine } from 'express-handlebars';
const app = express()
const PATH = require("path")

//Handlebars config
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './dist/views');
//


//Middlewares

app.use(express.static(PATH.join(__dirname, '../public')));
//

app.use((req:Request, res:Response, next:NextFunction)=>{
    if(req.method !== "GET" && req.method !== "DELETE" && req.method !== "POST"){
        res.status(501).json({error:"El método solicitado no está soportado por el servidor y no puede ser manejado."})
    }else{
        next()
    }
})

//Routers
const routerRegistro = require('./routes/registro.routes');
app.use('/registro', routerRegistro)
//...


app.use((req:Request, res:Response)=>{
    console.log(req.method)
    console.log(req.body)
    console.log(req.path)
    res.status(404).json(console.log(PATH.join(__dirname, '../public')))
})

export default app;