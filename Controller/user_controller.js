const User = require("../Model/user_model");

const bcrypt = require("bcrypt");


const accountSid = 'ACdb3d03d7770bc380de78255a648ea7e6'; 
const authToken = '9c3722aadbbc39600ed1172a0b35db59'; 
const client = require('twilio')(accountSid, authToken ,{
  lazyLoading: true
});

//password Hash
const securePassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

//get home page
const getHome = (req, res) => {
  try {
    if (req.session.user) {
      res.render("user/home", { user: req.session.name });
    } else {
      req.session.user = false;
      res.render("user/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//get login page
const getLogin = (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

//post login page
const postLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user) {
      if (user.isVerified === true) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          req.session.user = true;
          req.session.name = user.name;
          res.render("user/home", { user: req.session.name });
        } else {
          res.render("user/login", {
            message: "Entered password is incorrect",
          });
        }
      }else{
        res.render("user/login", { message: "User Not verified" });
      }
    } else {
      res.render("user/login", { message: "Entered email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//get register page
const getRegister = (req, res) => {
  try {
    res.render("user/register");
  } catch (error) {
    console.log(error.message);
  }
};

//post register
const postRegister = async (req, res) => {
  try {
    const phoneNumber = "+91" + req.body.number;
    const password = req.body.password;
    const sPassword = await securePassword(password);
    const name =  req.body.name;
    const email = req.body.email;

    const user = await User.findOne({ email: email });
    if (user) {
      res.render("user/register", { message: "Email already exists" });
    }else{
      
      
      const otpresponse = await client.verify.v2.services('VAf57025ceb2869fb170d396ec5c902ca6').verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });
      req.session.email = email;
      req.session.name = name;
      req.session.password = sPassword;
      req.session.number = phoneNumber;

      res.render('user/otp');
    }
    
  } catch (error) {
    console.log(error.message);
  }
}

//getOtp
const postOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const phoneNumber = req.session.number;
    console.log(phoneNumber);
    const result = await client.verify.v2.services('VAf57025ceb2869fb170d396ec5c902ca6').verificationChecks.create({
      to: phoneNumber,
      code: otp,
    });
    if (result.valid === true) {
      const data =await new User({
        name: req.session.name,
        email: req.session.email,
        password: req.session.password,
        number: req.session.number,
        isVerified: true
      })
      const saveData = await data.save()
      if(saveData){
        res.redirect('/login');
      }
    }else{
      res.render('user/otp',{message: "Otp validation failed"})
    }
    
  } catch (error) {
    console.log(error.messsage);
  }
}



//logout
const getLogout = (req, res) => {
  req.session.user = false;
  res.redirect("/");
};

module.exports = {
  getHome,
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  getLogout,
  postOtp,
};
