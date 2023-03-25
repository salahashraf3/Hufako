const User = require("../Model/user_model");

//admin dashboard
const getAdmin = (req,res) => {
    
    res.render('admin/admin_home');
    
}

//get admin login
const getAdminLogin =  (req,res) =>{
    res.render('admin/signin')
}

const postAdminLogin = (req,res) => {
    let email = req.body.email;
    let password = req.body.password
    if(email === "admin@gmail.com" && password === "12345"){
        req.session.login = true;
        res.redirect('/admin/dashboard');
    }
}

const adminLogout = (req,res) => {
    req.session.login = false;
    res.redirect('/admin')
    
}

// get user management
const getUserManagement = async (req,res) => {

    const userData = await User.find()

    res.render('admin/user_management' ,{user: userData})
}


//block or unblock user
const blockUnblockUser = async (req,res) => {
    const id = req.query.id
    const userData = await User.findOne({_id: id})
    if(userData.isVerified){
        await User.findByIdAndUpdate(id,{isVerified: false})
    }else{
        await User.findByIdAndUpdate(id,{isVerified: true})
    }
    res.redirect('/admin/user_management')
}


module.exports = {
    getAdmin,
    getAdminLogin,
    postAdminLogin,
    adminLogout,
    getUserManagement,
    blockUnblockUser,
}