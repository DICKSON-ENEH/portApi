const mongoose = require("mongoose")

const postSchema= mongoose.Schema({
link:{
    type:String
},
project:{
    type:String
},
description:{
    type:String
},
role:{
    type:String
},
imageurl:{
    type:String
},
image:{
    type:String
},
imageid:{
    type:String
},
tools:{
    type:String
},
}, {timestamps:true})

module.exports= mongoose.model("projects", postSchema)