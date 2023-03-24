const User = require("../Model/user_model");
// const otpStore = require("../Model/otp")
const bcrypt = require("bcrypt");

var otpStore;
let id;

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

    const data = await new User({
      name: req.body.name,
      email: req.body.email,
      password: await securePassword(password),
      number: phoneNumber,
      isVerified: false,
    });
    const result = await data.save();
    if (result) {
      const userEmail = await User.findOne({ email: req.body.email });
      id = userEmail;
      console.log(userEmail);
    }

    const accountSid = "AC518ebe266156b7915c2bac7cf4daffac";
    const authToken = "12e6a58e93f7099a7893b3519dc84738";
    const client = require("twilio")(accountSid, authToken);
    const random = Math.floor(Math.random() * 1000000 + 1);

    client.messages
      .create({
        body: random,
        messagingServiceSid: "MG903ed6e2eb785ea61fb63e2e0cd47d5d",
        to: phoneNumber,
      })
      .then(() => {
        otpStore = random;
        res.render("user/otp");
      });

    // res.redirect("/otp")
  } catch (error) {
    console.log(error.message);
  }
};

//getOtp
const postOtp = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const confirmOtp = otpStore;
    if (otp == confirmOtp) {
      

      if (id !== "undefined") {
        const userData = await User.findOneAndUpdate(
          { email: id.email },
          { isVerified: true }
        );
        if (userData) {
          res.redirect("/login");
        }
      }
    } else {
      console.log("otp not verified");
    }
  } catch (error) {
    console.log(error.messsage);
  }
};



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
