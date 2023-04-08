//Twilio Config
const accountSid = process.env.Acc_sid;
const authToken = process.env.Auth_token;
const client = require("twilio")(accountSid, authToken, {
  lazyLoading: true,
});


//Bcrypt Config
const bcrypt = require('bcrypt');
//password Hash
const securePassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  };


  //Multer Config
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,path.join(__dirname, '/public/product_images'))
    },
    filename : (req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})


const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
          file.mimetype == "image/png" ||
          file.mimetype == "image/jpg" ||
          file.mimetype == "image/jpeg" ||
          file.mimetype == "image/webp" 
          
        ) {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
        }
      }
})


//mongoose config
const mongoose = require('mongoose')
mongoose.connect(process.env.URL).then(()=>{
    console.log("Connected to MongoDB");
})


//RazorPay
const Razorpay = require('razorpay')
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});







module.exports ={
    client,
    securePassword,
   upload,
   instance,
}