const express = require("express")
require("dotenv").config()
const router = express.Router()
const {google} = require("googleapis")
const nodemailer = require("nodemailer")
const hogan = require("hogan.js")
const fs =require("fs")
const userModel = require("../model/sign")
const userTemplate = fs.readFileSync("./Response/user-response-mail.html", "utf-8")
const compileTemplate = hogan.compile(userTemplate)
const OAuth2 = google.auth.OAuth2
const contactTemplate =fs.readFileSync("./Response/Contactus.html", "utf-8")
const compileContact = hogan.compile(contactTemplate)
const CLIENT_SCRET = process.env.CLIENTSECRET
const postModel = require("../model/model")

const upload = require("./multer") 
const  cloudinary = require("../cloudinary")

const CLIENT_ID = process.env.CLIENTID
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const refrehToken = process.env.REFRESHTOKEN
const REDIRECT_URL=
"https://developers.google.com/oauthplayground"

const OAuth2_client = new OAuth2(
    CLIENT_ID, CLIENT_SCRET,
    REDIRECT_URL
)

OAuth2_client.setCredentials({
    refresh_token:refrehToken
})

 
router.post("/sendmail", async(req, res)=>{
    try {
      

  const {firstname,lastname, email, phone, message} = req.body
  const accessToken = await OAuth2_client.getAccessToken()
  const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
type:"OAuth2",
user:"dickseneh99@gmail.com",
clientId:CLIENT_ID,
clientSecret:CLIENT_SCRET,
refresh_token:refrehToken,
accessToken:accessToken.token
    }
  })

  mailOptions={
    from:"DeeTech <dickseneh99@gmail.com>",
    to:email,
    subject:"Contact",
   
    html:compileTemplate.render({firstname:firstname, lastname:lastname})
  }

  transporter.sendMail(mailOptions,(err, info)=>{
    if(err){
        console.log("error", err)
    }else{
        console.log("success", info)
    }

  })
if(mailOptions){
    mailOptions={
        from:"DeeTech <dickseneh99@gmail.com>",
        to: "dickseneh99@gmail.com",
        subject:"Contact",
        html:compileContact.render({firstname:firstname, lastname:lastname, phone:phone, email:email, message:message})
      }
      transporter.sendMail(mailOptions,(err, info)=>{
        if(err){
            console.log("error", err)
        }else{
            console.log("success", info)
        }
    transporter.close()
      })
}else{
    return
}

  
res.status(200).json({
    message:"email sent"
  })
    } catch (error) {
        console.log(error)
    }
})

router.post("/createProject", upload, async(req, res)=>{
  try {
    const {link, project, description, role, tools}= req.body
const cloudy = await cloudinary.uploader.upload(req.file.path)
    const post = await postModel.create({
link, project, description,image:req.file.path, role,tools, imageid:cloudy.public_id, imageurl:cloudy.secure_url 
    })

    res.status(201).json({
      message:"created",
      data:post
    })
  } catch (error) {
    console.log(error)
  }
})
router.post("/signin", async(req, res)=>{
  try {
    const {fullname, password} = req.body
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)

    const user = await userModel.create({
      fullname, password:hashed
    })
    if(user){
      const token = jwt.sign({
        _id:user._id
      }, "stockdata", {expiresIn:"20d"})

      const {password ,  ...info }= user._doc

      res.status(200).json({
        message:"user",
        data:{
          token, ...info
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
})
router.get("/viewProjects", async(req, res)=>{
  try {
    const post = await postModel.find()
    res.status(200).json({
      message:"all projects",
      data:post
    })
  } catch (error) {
    console.log(error)
  }
})

router.patch("/editProject/:id", upload, async(req, res)=>{
  try {
    const {link, project, description, role, tools}= req.body

   const id = req.params.id 
const projectt = await postModel.findById(id)
await cloudinary.uploader.destroy(projectt.imageid)
   const cloudy= await cloudinary.uploader.upload(req.file.path)
   const post = await postModel.findByIdAndUpdate(id,{
    link, project, description, role,tools, image:req.file.path, imageid:cloudy.public_id, imageurl:cloudy.secure_url
   } , {new:true})

   res.status(201).json({
    message:"edited",
    data:post
   })
  } catch (error) {
    console.log(error)
  }
})

router.delete("/clear/:id",async(req, res)=>{
  try {
    const id = req.params.id
    const project = await postModel.findById(id)
    await cloudinary.uploader.destroy(project.imageid)
    const post = await postModel.findByIdAndDelete(id)

    res.status(204).json({
      message:"deleted"
    })
  } catch (error) {
    console.log(error)
  }
})
module.exports= router