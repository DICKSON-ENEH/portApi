const mongoose = require("mongoose")

const User = mongoose.Schema({
    fullname:{
        type:String
    }, 
    password:{
        type:String
    }
}, {timestamps:true})

module.exports= mongoose.model("user", User)