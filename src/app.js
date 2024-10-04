import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// config for the cross origin to allow the access of frontend to backend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// to accept the data in json with a limit of 16kb
app.use(express.json({
    limit: "16kb"
}))

// to accept the data from the url which is send in the form of ? query
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

// config to store the files such as photo pdfs and anyone can access this from the public folder
app.use(express.static("public"))

// using cookieParese to perform CRUD operation on the cookies
app.use(cookieParser());



export { app }