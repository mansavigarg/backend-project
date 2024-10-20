// require('dotenv').config({path: './env'}) // This is a correct way but it reduces the consistency of the code as we are using require method 

import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js"

dotenv.config({
    path: './env'
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port http://localhost:${process.env.PORT}`);     
    })
    app.on("error", (error) => {
        console.log("ERROR: Server Running error", error);
        throw error  
    })
})
.catch((err) => {
    console.log("MongoDB connection failed !!!", err);
})



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