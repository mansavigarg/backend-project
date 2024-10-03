// require('dotenv').config({path: './env'}) // This is a correct way but it reduces the consistency of the code as we are using require method 

import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
});

connectDB();



/*
    // First approch to so everything in one file

import express from "express";
const app = express();

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: Application not able to talk to database", error);
            throw error  
             
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port http://localhost:${process.env.PORT}`);
            
        })
    }   catch(error){
        console.log("ERROR",error);
        throw error
        
    }
})()


*/