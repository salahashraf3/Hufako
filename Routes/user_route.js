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

// Check out
user_route.get('/checkout',user_controller.checkout)
//addAddress
user_route.post('/addAddress' , user_controller.postAddress)

//delete address
user_route.get('/delete-address',user_controller.deleteAddress)

//post placeOrder
user_route.post('/place-order',user_controller.postPlaceOrder)

//Order Placed
user_route.get('/order-placed',user_controller.getOrderPlaced)

//applycoupon
user_route.post('/applycoupon',user_controller.applycoupon)


///getUserProfile
user_route.get('/getUserProfile',user_controller.getUserProfile)


//razorpayVerifyPAyment
user_route.post('/verifyPayment',user_controller.verifyPayment)

//order history
user_route.get('/order',user_controller.getOrder)
user_route.get('/singleOrder',user_controller.singleOrder)


//sales Report \

user_route.get("/salesReport",user_controller.getSalesReport)

//cancel Order
user_route.get('/cancelOrder',user_controller.cancelOrder)

//return Order
user_route.get("/returnOrder",user_controller.returnOrder)

//check Wallet
user_route.post('/checkWallet',user_controller.checkWallet)


//logout
user_route.get('/logout',user_controller.getLogout)


//add to wishlist 
user_route.post('/add-to-cart-wishlist',user_controller.addToCartWishlist)
user_route.get('/wishlist',user_controller.getWishlist)

user_route.post('/addtoWishlist',user_controller.addWishlist)




module.exports = user_route
