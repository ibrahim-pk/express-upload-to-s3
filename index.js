const express=require("express")
const cors=require("cors")
const dotenv=require("dotenv")
const fs=require("fs")
const AWS=require("aws-sdk")
const multer = require("multer")
dotenv.config()

const app=express()

app.use(cors())

const s3=new AWS.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION
})

const upload=multer({
    dest:"uploads/"
})

const createUpload=async(file)=>{
   const params={
     Bucket:process.env.S3_BACKET_NAME,
     Key:`${Date.now()}_${file.originalname}`,
     Body:fs.createReadStream(file.path),
     ContentType:file.mimetype
   }

  return await s3.upload(params).promise()
}

app.post('/upload', upload.single('file'),async(req,res)=>{
    const file=req.file
    if(!file){
        return res.status(200).json("File is empty!")
    }
    try{
        const data= await createUpload(file)
       fs.unlinkSync(file.path)
        res.send({
            message:"file uploaded successfully!",
            file:data?.Location
        })
    }catch(err){
        if(fs.existsSync(file.path)){
             fs.unlinkSync(file.path)
        }
        res.status(500).json(err?.message)
    }
  
})

app.get('/',(req,res)=>{
    res.send("Hi AWS devops")
})

app.listen(5000,()=>console.log("Server is running"))
