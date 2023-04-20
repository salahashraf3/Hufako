const User = require("../Model/user_model");
const Product = require("../Model/product_model");
const Banner = require("../Model/banner_model")
const Cart = require("../Model/cart_model");
const Order = require("../Model/order_model");
const Coupon = require("../Model/coupon_model");
const WishList = require("../Model/wishlist_model")
const { ObjectId } = require("mongodb")

// twilio config
const { client } = require("../Config");

//bcrypt config
const bcrypt = require("bcrypt");
const { securePassword } = require("../Config");

//Razorpay
const { instance } = require("../Config");

//get home page
const getHome = async (req, res) => {
  try {
    const bannerData = await Banner.find()
    const product = await Product.find();
    if (req.session.user) {
      res.render("user/home", { user: req.session.name, products: product, banner: bannerData });
    } else {
      req.session.user = false;
      res.render("user/home", { products: product, banner: bannerData });
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//get login page
const getLogin = (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//post login page
const postLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const bannerData = await Banner.find();
    const user = await User.findOne({ email: email });
    if (user) {
      if (user.isVerified === true) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          const data = await Product.find();
          req.session.user = true;
          req.session.name = user.name;
          res.render("user/home", { user: req.session.name, products: data, banner: bannerData});
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
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//get register page
const getRegister = (req, res) => {
  try {
    res.render("user/register");
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//post register
const postRegister = async (req, res) => {
  try {
    const phoneNumber = "+91" + req.body.number;
    const password = req.body.password;
    const repassword = req.body.repassword;
    if (password !== repassword) {
      res.render("user/register", {
        message: "Password and Re-Password are not same",
      });
    } else {
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
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
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
    res.redirect('/serverERR', {message: error.message})
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
    res.redirect('/serverERR', {message: error.message})
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
    res.redirect('/serverERR', {message: error.message})
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
    res.redirect('/serverERR', {message: error.message})
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
          } else {
            res.render("user/cart", { user: req.session.name, data2: "hi" });
          }
        } else {
          res.render("user/cart", { user: req.session.name, data2: "hi" });
        }
      } else {
        res.render("user/cart", {
          user: req.session.name,
          data2: "hi",
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
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
        const productExist =  userCart.product.findIndex(
          product => product.productId == productId
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
          //remove from wishlist 
          const wishlist = await WishList.findOneAndRemove({ "product.$.productId": productData._id });
          console.log(wishlist);
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
      res.json({ success: false });
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
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
      await Cart.updateOne(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $set: { "product.$.quantity": value },
        }
      );
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
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
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//get checkout
const checkout = async (req, res) => {
  try {
    if (req.session.user) {
      const userData = await User.findOne({ name: req.session.name });

      const cartData = await Cart.findOne({ user: userData._id }).populate(
        "product.productId"
      );

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

        const data = await User.findOne({
          name: req.session.name,
        });
        res.render("user/checkout", { address: data.address, total: Total ,wallet: data.wallet});
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//postAdrress
const postAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const { name, country, town, street, postcode, phone } = req.body;
      const userName = req.session.name;

      await User.updateOne(
        { name: userName },
        {
          $push: {
            address: {
              name: name,
              country: country,
              town: town,
              street: street,
              postcode: postcode,
              phone: phone,
            },
          },
        }
      );
      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//deleteAddress
const deleteAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const userName = req.session.name;
      const id = req.query.id;
      await User.updateOne(
        { name: userName },
        {
          $pull: {
            address: {
              _id: id,
            },
          },
        }
      );
      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//postPlaceOrder
const postPlaceOrder = async (req, res) => {
  try {
    if (req.session.user) {
      const { total, address, payment ,wallet , totalBefore } = req.body;
      const user = await User.findOne({
        name: req.session.name,
      });
      if (address === null) {
        res.json({ codFailed: true });
      }
      const cartData = await Cart.findOne({ user: user._id });
      const product = cartData.product;

      const status = payment == "cod" ? "placed" : "pending";

      const orderNew = new Order({
        deliveryDetails: address,
        totalAmount: total,
        status: status,
        user: user._id,
        paymentMethod: payment,
        product: product,
        wallet: wallet,
        totalBefore: totalBefore,
        discount: 0,
        Date: new Date(),
      });

      await orderNew.save();
      let orderId = orderNew._id;

      await User.findByIdAndUpdate(user._id, {
        wallet:0
      })
      
      
      if (status == "placed") {
        const couponData = await Coupon.findById(req.session.couponId);
        if (couponData) {
          let newLimit = couponData.limit - 1;
          await Coupon.findByIdAndUpdate(couponData._id, {
            limit: newLimit,
          });
        }
        await Cart.deleteOne({ user: user._id });
          for (i = 0; i < product.length; i++) {
            const productId = product[i].productId;
            const quantity = Number(product[i].quantity)
            await Product.findByIdAndUpdate(productId, {
              $inc: { stock: -quantity },
            });
          }
          res.json({ codSuccess: true });
        } else {
          var options = {
            amount: total * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: "" + orderId,
          };
          instance.orders.create(options, function (err, order) {
            if (err) {
              console.log(err);
            } else {
              res.json({ order });
            }
          });
        }
      
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//verify online payment
const verifyPayment = async (req, res) => {
  try {
    if (req.session.user) {
      let userData = await User.findOne({ name: req.session.name });
      const cartData = await Cart.findOne({ user:  userData._id });
      const product = cartData.product;
      
      const details = req.body;
      const crypto = require("crypto");
      let hmac1 = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET);
      console.log(hmac1);
      hmac1.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      hmac1 = hmac1.digest("hex");

      if (hmac1 == details.payment.razorpay_signature) {

        let orderReceipt = details.order.receipt
        let test1 = await Order.findByIdAndUpdate(
          {
            _id: new ObjectId(orderReceipt)
          },
          { $set: { paymentId: details.payment.razorpay_payment_id } }
        );
        let test2 = await Order.findByIdAndUpdate(
          orderReceipt ,
          { $set: { status: "placed" } }
        );
        await Cart.deleteOne({ user: userData._id });

        for (i = 0; i < product.length; i++) {
          const productId = product[i].productId;
          const quantity = Number(product[i].quantity);
          await Product.findByIdAndUpdate(productId, {
            $inc: { stock: -quantity },
          });
        }
        
        res.json({ success: true });
      } else {
        await Order.deleteOne({ _id: details.order.receipt });
        res.json({ onlineSuccess: true });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//getOrderPlaced
const getOrderPlaced = (req, res) => {
  try {
    res.render("user/order_placed");
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//apply coupon
const applycoupon = async (req, res) => {
  try {
    let code = req.body.code;
    let amount = req.body.amount;
    let userData = await User.find({ name: req.session.name });
    let userexist = await Coupon.findOne({
      couponcode: code,
      used: { $in: [userData._id] },
    });
    if (userexist) {
      res.json({ user: true });
    } else {
      const couponData = await Coupon.findOne({ couponcode: code });
      if (couponData) {
        if (couponData.expiredate >= new Date()) {
          if (couponData.limit != 0) {
            if (couponData.mincartamount <= amount) {
              let discountvalue = couponData.couponamount;
              console.log(discountvalue);

              let distotal = Math.round(amount - discountvalue);
              let couponId = couponData._id;
              req.session.couponId = couponId;
              

            

              return res.json({
                couponokey: true,

                distotal,
                discountvalue,
                code,
              });
            } else {
              res.json({ cartamount: true });
            }
          } else {
            res.json({ limit: true });
          }
        } else {
          res.json({ expire: true });
        }
      } else {
        res.json({ invalid: true });
      }
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

//getUserProfile
const getUserProfile = async (req, res) => {
  try {
    if (req.session.user) {
      let userData = await User.findOne({ name: req.session.name });
      res.render("user/user_profile", { data: userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
};

// getOrder
const getOrder = async (req,res) => {
  try {
    if(req.session.user){
      let userData = await User.findOne({ name: req.session.name });
      const orderData = await Order.find({user: userData._id})
      res.render("user/order" ,{user: req.session.name , data: orderData })
    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

//singleOrder 
const singleOrder = async (req, res) => {
  try {
    if(req.session.user){
      const id = req.query.id
      const orderData = await Order.findById(id).populate('product.productId')
      res.render("user/single_order", {data: orderData.product ,orderData})
    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

//cancel Order
const cancelOrder = async (req, res) => {
  try {
    if(req.session.user){
      const id = req.query.id
      const orderData = await Order.findById(id)
      if(orderData.paymentMethod == "cod"){
        await User.findOneAndUpdate({name: req.session.name},{
          wallet: orderData.wallet
        })
        
        const orderDataa= await Order.findByIdAndUpdate(id, {
          status: "cancelled",
          wallet: 0
        })
  
        if(orderDataa){
          res.redirect("/order")
        }
      }
      
      


    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

//rerturn order
const returnOrder = async (req, res) => {
  try {
    if(req.session.user){
      const id = req.query.id
      const orderData = await Order.findById(id)
      if(orderData.paymentMethod == "cod" || orderData.paymentMethod == "online"){
        await User.findOneAndUpdate({name: req.session.name},{
          wallet: orderData.totalBefore
        })
        
        const orderDataa= await Order.findByIdAndUpdate(id, {
          status: "returned",
          wallet: 0
        })
  
        if(orderDataa){
          res.redirect("/order")
        }
      }



    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

//getSales Report
const getSalesReport = async (req, res) => {
  try {
    const orderData = await Order.find({status:{$eq:"Delivered"}})
    let SubTotal = 0
    orderData.forEach(function(value){
      SubTotal = SubTotal+value.totalAmount;
    })
    res.render("admin/sales_report" ,{data: orderData, total: SubTotal})
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

//checkWallet 
const checkWallet = async (req, res) => {
  try {
    if(req.session.user){
      const userData = await User.findOne({name: req.session.name})
      const walleta = userData.wallet
      if(walleta>0){
        res.json({success: true ,walleta})
      }
    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

//getWishlist
const getWishlist = async (req, res) => {
  try {
    if(req.session.user){
      const user = req.session.name
        const userData = await User.findOne({name : req.session.name})
        const data = await WishList.findOne({user : userData._id}).populate("product.productId")

        if(data){
            if(data.product != 0){
                res.render('user/wishlist' , {user : user , data : data.product})
            }else {
                res.render('user/wishlist' , {user : user , data2 :'hi'})
            }
        }else {
            res.render('user/wishlist' , {user : user , data2 :'hi'})

        }

    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}

const addWishlist = async (req,res) => {
  try {
    if(req.session.user){

      const productId = req.body.id


        const productData = await Product.findById(productId)
        const userData = await User.findOne({name : req.session.name})
        const alreadyWishlist = await WishList.findOne({user : new ObjectId(userData._id) })
        if(alreadyWishlist){
            const productExist = await alreadyWishlist.product.findIndex( product => product.productId == productId)
            if(productExist != -1) {
                res.json({already : true})
            }else {
                await WishList.findOneAndUpdate({user : userData._id},{$push : 
                    {product:
                        {
                            productId : productId,
                            name : productData.name,
                            price : productData.price
                        }
                    }
                })
                res.json({success : true})
            }
        }else {
            const data = new WishList({
                user : userData._id,
                product : [{
                    productId : productId,
                    name : productData.productname,
                    price : productData.price
                }]
            })
            await data.save()
            res.json({success : true})
        }


    }else{
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
    console.log(error.message);
  }
}


//addtocartwishlist
const addToCartWishlist = async (req,res) => {
  try {
      if(req.session.user){
          const productId = req.body.id
          const userName = req.session.name
          const userData = await User.findOne({name : userName})
          const userId = userData._id
          const productData = await Product.findById(productId)
          const userCart = await Cart.findOne({user : userId})

          if(userCart) {
              const productExist = await userCart.product.findIndex( product => product.productId == productId)
              if(productExist != -1){
                  const cartData = await Cart.findOne(
                      {user : userId, "product.productId" : productId},
                      {"product.productId.$" : 1 , "product.quantity" : 1})
  
                  const [{quantity : quantity}] = cartData.product

                  if(productData.stock <= quantity ){
                      res.json({outofstock:true})
                  }else {
                      await Cart.findOneAndUpdate({user : userId, "product.productId" : productId},{$inc : {"product.$.quantity" : 1}})
                      await WishList.findOneAndUpdate({"product.productId" : productId},{$pull : {product :{productId : productId}}})
                      res.json({success : true})

                  }
              }else{
                  if(productData.stock <= 0 ){
                      res.json({outofstock:true})
                  }else {
                      await Cart.findOneAndUpdate({user : userId},{$push : {product:{productId : productId, price : productData.price}}})
                      await WishList.findOneAndUpdate({"product.productId" : productId},{$pull : {product :{productId : productId}}})
                      res.json({success : true})
                  }
              }
              
          }else{
              if(productData.stock <= 0){
                  res.json({outofstock:true})
              }else{
                  const data = new Cart({
                      user : userId,
                      product:[{productId : productId, price : productData.price}]
                  })
                  const result = await data.save()
                  await WishList.findOneAndUpdate({"product.productId" : productId},{$pull : {product :{productId : productId}}})
                  if(result){
                      res.json({success:true})
                  }
              }
          }
      }else{
          res.json({login : true})
      }
  } catch (error) {
    res.redirect('/serverERR', {message: error.message})
      console.log(error.message)
  }
}


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
  checkout,
  postAddress,
  deleteAddress,
  postPlaceOrder,
  getOrderPlaced,
  applycoupon,
  getUserProfile,
  verifyPayment,
  getOrder,
  singleOrder,
  getSalesReport,
  cancelOrder,
  returnOrder,
  checkWallet,
  getWishlist,
  addWishlist,
  addToCartWishlist,
};
