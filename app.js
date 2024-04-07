import expess from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = expess();

app.use(cors({
    origin:process.env.CORS_ORIGIN,  //from where we are accepting the requests
    credentials:true //mean what credentials are required
}))

app.use(expess.json({limit:"20kb"}))  //setting the limit that we can receive
app.use(expess.urlencoded({extended:true,  limit:"20kb"}))  // to tell server that will also received by URL ---extended mean we can create objects inside objects
app.use(expess.static("public"))  //this is used to static data like images or pdf 
app.use(cookieParser())   //this is used perform CRUD opration on the user cookies


export { app }