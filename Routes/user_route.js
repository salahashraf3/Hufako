const express = require('express');
const user_route = express()
const user_controller = require("../Controller/user_controller")




//home
user_route.get('/',user_controller.getHome)
//home post
user_route.post('/',user_controller.postLogin)


//login page
user_route.get('/login',user_controller.getLogin)
//post login page


//register page
user_route.get('/register',user_controller.getRegister)
//post register 
user_route.post('/registerUser',user_controller.postRegister)

//otp
user_route.post('/otp',user_controller.postOtp)

//forget password
user_route.get('/forget',user_controller.getForget)
user_route.post('/forget',user_controller.postForget)

//forget otp
user_route.post('/forget_otp',user_controller.postForgetOTP)

//single product page
user_route.get('/product',user_controller.getProduct)


//cart get
user_route.get('/cart',user_controller.getCart)
user_route.post('/addtoCart',user_controller.addToCart)
user_route.post('/changeQty',user_controller.changeQty)
user_route.post('/deleteCart',user_controller.deleteCart)

//logout
user_route.get('/logout',user_controller.getLogout)






module.exports = user_route
