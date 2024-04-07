import dotenv from "dotenv";
import express from "express";
import cors from 'cors'
import mongoConnect from './Db/conn.js';

const app = express();

dotenv.config({
    path: './env'
})

mongoConnect()
.then(() => {
    //listening error for event on the MongoDb
    app.on("error", (err) => {
        console.log("Error: ",err);
        throw error
    })

    app.listen(process.env.PORT || 8000 ,() => {
        console.log(`Express Server is Running At port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo DB connnectio failed !!!",err);
})


//............. link the router to make easy routing..........//
// app.use(require("./api",router));






// app.listen(3000,() => {
//     console.log("Express Server is Running");
// })