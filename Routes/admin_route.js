const express = require('express');
const admin_route = express()
const adminController = require('../Controller/admin_controller')
const session  = require('../middleware/adminsession')

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



//admin logout
admin_route.get('/logout',adminController.adminLogout)



module.exports = admin_route