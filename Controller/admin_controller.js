const User = require("../Model/user_model");
const bcrypt =  require("bcrypt");

//password Hash
const securePassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  };



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

//get add user
const getAddUser = (req,res) =>{
    res.render('admin/addUser')
}

//post adduser
const postAddUser = async (req,res) => {
    const password  = req.body.password
    const data = await new User({
        name: req.body.name,
        email: req.body.email,
        password: await securePassword(password),
        number: req.body.number,
        isVerified: true
    })
    const result  = await data.save()
    if(result){
        res.redirect('/admin/user_management')
    }
    else{
        res.render('admin/addUser',{message: 'Error during upload to database'})
    }

}

//edit user get
const getEditUser = async (req,res) => {
    const id = req.query.id
    const data = await User.findOne({_id: id})
    if(data){
        res.render('admin/edit_user' ,{user: data})
    }
}

//post edit user

const postEditUser = async (req,res) => {
    const id = req.query.id
    const data = await User.findByIdAndUpdate(id,{
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
    })
    if(data){
        res.redirect('/admin/user_management')
    }
}

//get delete user
const getDeleteUser = async (req,res) => {
    const id = req.query.id
    const data = await User.findByIdAndRemove(id)
    if(data){
        res.redirect('/admin/user_management')
    }
}


module.exports = {
    getAdmin,
    getAdminLogin,
    postAdminLogin,
    adminLogout,
    getUserManagement,
    blockUnblockUser,
    getAddUser,
    postAddUser,
    getEditUser,
    postEditUser,
    getDeleteUser,
}