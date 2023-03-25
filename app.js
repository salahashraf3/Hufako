const express = require("express")
const app = express()
const nocache = require('nocache')
const session  = require('express-session')




//use middelwares
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//session
app.use(session({secret:'salah',saveUninitialized:true,resave:false,cookie:({maxAge:120000})}))

//cookies

app.use((req,res,next)=>{
    res.set('Cache-control','no-store,no-cache')
    next()
})

// app.use(nocache());




// set public folder
app.use(express.static(__dirname+'/public'))

// setting up view engine
app.set('view engine','ejs')


//user route
const user_route = require('./Routes/user_route')
app.use('/',user_route)


//admin routes
const admin_route = require('./Routes/admin_route');
app.use('/admin',admin_route)



app.listen(3000, ()=>{
    console.log("Server running on port 3000")
})