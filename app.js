const express = require("express")
const app = express()
const session  = require('express-session')
const day = 1 * 24 * 60 * 60 * 1000
const path = require('path')
require('dotenv').config({path: __dirname + '/.env'})
 


//use middelwares
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//session
app.use(session({secret:'salah',saveUninitialized:true,resave:false,cookie:({maxAge:day})}))

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



app.use((req,res) => {
    try {
        res.status(404).render('404')
    } catch (error) {
        res.status(500).render('500')
    }
})

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})