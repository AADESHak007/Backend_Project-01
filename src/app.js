import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser' ;


const app = express();
//Setting up the middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true
}))
//configuration for a better recieving of data form the BODY.
app.use(express.json({limit:"16kb"})) //handles the JSON response
app.use(express.urlencoded({extended: true ,limit:"16kb"})) // handles the data from the URL or encoded API
app.use(express.static("public")) //to store images or logos that are public
app.use(express(cookieParser())) //handles the cookies in the user's BROWSER

export {app} ;