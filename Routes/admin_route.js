const express = require('express');
const admin_route = express()
const adminController = require('../Controller/admin_controller')
const session  = require('../middleware/adminsession')
const { upload } = require('../Config')
const path = require('path')



//get admin dashboard
admin_route.get('/dashboard',session.logged,adminController.getAdmin)

//get admin login
admin_route.get('/',session.notLogged,adminController.getAdminLogin)
//post admin login
admin_route.post('/',adminController.postAdminLogin)




//get user mangemnet
admin_route.get('/user_management', session.logged,adminController.getUserManagement)




//block and unblock user
admin_route.get('/blockUnblock',session.logged,adminController.blockUnblockUser)




//add user 
admin_route.get('/addUser',session.logged,adminController.getAddUser)
admin_route.post('/addUser',session.logged,adminController.postAddUser)

//edit user
admin_route.get('/editUser',session.logged,adminController.getEditUser)
admin_route.post('/editUser',session.logged,adminController.postEditUser)


//delete user
admin_route.get('/deleteUser',session.logged,adminController.getDeleteUser)


//category
admin_route.get('/category',session.logged,adminController.getCategory)

//add category
admin_route.get('/addCategory',session.logged,adminController.getAddCategory)
admin_route.post('/addCategory',session.logged,adminController.postAddCategory)

//delete category
admin_route.get('/deleteCategory',session.logged,adminController.deleteCategory)




//products
admin_route.get('/products',session.logged,adminController.getProduct)

//add products 
admin_route.get('/addProduct',session.logged,adminController.getAddProducts)
admin_route.post('/addProduct',session.logged,upload.array('images',4),adminController.addProduct)

//edit products
admin_route.get('/edit_product',session.logged,adminController.getEditProduct)
admin_route.post('/edit_product',session.logged,upload.array('images',4),adminController.postEditProduct)

//delete product 
admin_route.get('/delete_product',session.logged,adminController.deleteProduct)









//admin logout
admin_route.get('/logout',adminController.adminLogout)




module.exports = admin_route
