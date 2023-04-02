const User = require("../Model/user_model");
const Product = require("../Model/product_model");
const Cart = require("../Model/cart_model");

// twilio config
const { client } = require("../Config")

//bcrypt config
const bcrypt = require('bcrypt')
const {securePassword} = require('../Config')



//get home page
const getHome = async (req, res) => {
  try {
    const product = await Product.find();
    if (req.session.user) {
      console.log(product);
      res.render("user/home", { user: req.session.name, products: product });
    } else {
      req.session.user = false;
      res.render("user/home", { products: product });
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
          const data = await Product.find();
          req.session.user = true;
          req.session.name = user.name;
          res.render("user/home", { user: req.session.name, products: data });
        } else {
          res.render("user/login", {
            message: "Entered password is incorrect",
          });
        }
      } else {
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
    const name = req.body.name;
    const email = req.body.email;
    req.session.email = email;
    req.session.name = name;
    req.session.password = sPassword;
    req.session.number = phoneNumber;

    const user = await User.findOne({ email: email });
    if (user) {
      res.render("user/register", { message: "Email already exists" });
    } else {
      await client.verify.v2
        .services("VAf57025ceb2869fb170d396ec5c902ca6")
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });
      res.render("user/otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//getOtp
const postOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const phoneNumber = req.session.number;
    const result = await client.verify.v2
      .services("VAf57025ceb2869fb170d396ec5c902ca6")
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
    if (result.valid === true) {
      const data = await new User({
        name: req.session.name,
        email: req.session.email,
        password: req.session.password,
        number: req.session.number,
        isVerified: true,
      });
      const saveData = await data.save();
      if (saveData) {
        res.redirect("/login");
      }
    } else {
      res.render("user/otp", { message: "Otp validation failed" });
    }
  } catch (error) {
    console.log(error.messsage);
  }
};

//get forget password page
const getForget = (req, res) => {
  res.render("user/forget_password");
};

//post forget password
const postForget = async (req, res) => {
  try {
    req.session.email = req.body.email;
    const password = req.body.password;
    req.session.password = await securePassword(password);
    const checkEmail = await User.findOne({ email: req.session.email });
    if (checkEmail) {
      const number = checkEmail.number;
      req.session.number = number;

      await client.verify.v2
        .services("VAf57025ceb2869fb170d396ec5c902ca6")
        .verifications.create({
          to: number,
          channel: "sms",
        });
      res.render("user/forget_otp");
    } else {
      res.render("user/forget_password", {
        message: "Entered email does not exist",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//forget otp
const postForgetOTP = async (req, res) => {
  try {
    const otp = req.body.otp;
    const phoneNumber = req.session.number;
    const password = req.session.password;

    const result = await client.verify.v2
      .services("VAf57025ceb2869fb170d396ec5c902ca6")
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
    if (result.valid === true) {
      const data = await User.findOneAndUpdate(
        { number: phoneNumber },
        { password: password }
      );
      if (data) {
        req.session = null;

        res.redirect("/login");
      } else {
        res.render("user/forget_otp", { message: "database error" });
      }
    } else {
      res.render("user/forget_otp", { message: "otp invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//logout
const getLogout = (req, res) => {
  req.session.user = false;
  res.redirect("/");
};

//single product page
const getProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const data = await Product.findOne({ _id: productId });
    if (data) {
      res.render("user/single_product", { product: data });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getCart = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.findOne({ name: req.session.name });
      const id = user._id;
      const cart = await Cart.findOne({ user: id });
      if (cart) {
        const userData = await User.findOne({ name: req.session.name });

        const cartData = await Cart.findOne({ user: userData._id }).populate(
          "product.productId"
        );
        if (cartData) {
          let Total;
          if (cartData.product != 0) {
            const total = await Cart.aggregate([
              {
                $match: { user: userData._id },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  price: "$product.price",
                  quantity: "$product.quantity",
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ["$quantity", "$price"],
                    },
                  },
                },
              },
            ]).exec();
            Total = total[0].total;

            //pass the data to front
            res.render("user/cart", {
              user: req.session.name,
              data: cartData.product,
              userId: userData._id,
              total: Total,
            });
          }else{
            res.render('user/cart', {user : req.session.name, data2 : 'hi'})
          }
        }else{
          res.render('user/cart', {user : req.session.name, data2 : 'hi'})
        }
      }
       else {
        res.render("user/cart", {
          user: req.session.name,
          data2: 'hi'
        });
      }
    } else {
      res.redirect("/");
      // console.log("error with session at get cart");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//add to cart
const addToCart = async (req, res) => {
  try {
    if (req.session.user) {
      const productId = req.body.id;
      const userName = req.session.name;
      const userdata = await User.findOne({ name: userName });
      const userId = userdata._id;
      const productData = await Product.findById(productId);
      const userCart = await Cart.findOne({ user: userId });
      if (userCart) {
        const productExist = await userCart.product.findIndex(
          (product) => product.productId == productId
        );
        if (productExist != -1) {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );
        } else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: { productId: productId, price: productData.price },
              },
            }
          );
        }
      } else {
        const data = new Cart({
          user: userId,
          product: [{ productId: productId, price: productData.price }],
        });
        await data.save();
      }
      res.json({ success: true });
    } else {
      console.log("no user found new");
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//change quantity
const changeQty = async (req, res) => {
  try {
    const userId = req.body.user;
    const productId = req.body.product;
    const value = Number(req.body.value);

    const stockAvailable = await Product.findById(productId);
    if (stockAvailable.stock >= value) {
      console.log("good");
      await Cart.updateOne(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $set: { "product.$.quantity": value },
        }
      );
      res.json({ success: true});
    } else {
      console.log(" stock over");
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};


//delete from cart
const deleteCart = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Cart.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    if (data) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getHome,
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  getLogout,
  postOtp,
  getForget,
  postForget,
  postForgetOTP,
  getProduct,
  getCart,
  addToCart,
  changeQty,
  deleteCart,
};
