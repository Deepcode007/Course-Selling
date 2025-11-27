const express=require("express")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app=express()
require("dotenv").config({ path: './secrets/.env' })

const db=process.env.db
mongoose.connect(db)
const Schema = mongoose.Schema;

function server()
{
    app.use(express.json())
    
    app.listen(3030,()=>console.log("listening"))
}


module.exports={app, server,mongoose, jwt, Schema, bcrypt}