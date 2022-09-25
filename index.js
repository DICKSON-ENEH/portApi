const express = require("express")
require("dotenv").config()
const port =process.env.PORT || 1233
const app = express()
const cors= require("cors")
const morgan = require("morgan")
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/portfolio").then(()=>{
    console.log("connected")
}).catch((err)=>{
    console.log(err)
})

app.use(express.json())
app.use(cors())
app.use(morgan("dev"))
app.get("/portfolio", (req, res)=>{
    res.status(200).json({
        message:"welcome"
    })
})
app.use("/api/dee", require("./Router/router"))
app.listen(port,()=>{
    console.log("connected to", port)
})