import "reflect-metadata"
import app from "./app"
import DataBase from "../database/data-source"
require('dotenv').config();


const PORT = process.env.PORT
let server = app.listen(PORT);
console.log(`Escuchando en puerto http://localhost:${PORT}...`)
export default server;
