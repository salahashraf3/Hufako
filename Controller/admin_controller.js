const User = require("../Model/user_model");
const bcrypt = require("bcrypt");
const Category = require("../Model/category_model");
const Product = require("../Model/product_model");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const imgurUploader = require("imgur-uploader");

//password Hash
const {securePassword} = require('../Config')

//admin dashboard
const getAdmin = (req, res) => {
  res.render("admin/admin_home");
};

//get admin login
const getAdminLogin = (req, res) => {
  res.render("admin/signin");
};

const postAdminLogin = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === "admin@gmail.com" && password === "12345") {
    req.session.login = true;
    res.redirect("/admin/dashboard");
  }
};

const adminLogout = (req, res) => {
  req.session.login = false;
  res.redirect("/admin");
};

// get user management
const getUserManagement = async (req, res) => {
  const userData = await User.find();

  res.render("admin/user_management", { user: userData });
};

//block or unblock user
const blockUnblockUser = async (req, res) => {
  const id = req.query.id;
  const userData = await User.findOne({ _id: id });
  if (userData.isVerified) {
    await User.findByIdAndUpdate(id, { isVerified: false });
  } else {
    await User.findByIdAndUpdate(id, { isVerified: true });
  }
  res.redirect("/admin/user_management");
};

//get add user
const getAddUser = (req, res) => {
  res.render("admin/addUser");
};

//post adduser
const postAddUser = async (req, res) => {
  const password = req.body.password;
  const data = await new User({
    name: req.body.name,
    email: req.body.email,
    password: await securePassword(password),
    number: req.body.number,
    isVerified: true,
  });
  const result = await data.save();
  if (result) {
    res.redirect("/admin/user_management");
  } else {
    res.render("admin/addUser", { message: "Error during upload to database" });
  }
};

//edit user get
const getEditUser = async (req, res) => {
  const id = req.query.id;
  const data = await User.findOne({ _id: id });
  if (data) {
    res.render("admin/edit_user", { user: data });
  }
};

//post edit user

const postEditUser = async (req, res) => {
  const id = req.query.id;
  const data = await User.findByIdAndUpdate(id, {
    name: req.body.name,
    email: req.body.email,
    number: req.body.number,
  });
  if (data) {
    res.redirect("/admin/user_management");
  }
};

//get delete user
const getDeleteUser = async (req, res) => {
  const id = req.query.id;
  const data = await User.findByIdAndRemove(id);
  if (data) {
    res.redirect("/admin/user_management");
  }
};

//get category page
const getCategory = async (req, res) => {
  const data = await Category.find();
  if (data) {
    res.render("admin/category", { data: data });
  }
  // res.render('admin/category',{user: [{tes:"a"},{est: "sh"}]})
};

//get add category
const getAddCategory = async (req, res) => {
  res.render("admin/add_category");
};
//post add category
const postAddCategory = async (req, res) => {
  try {
    

    const Name = req.body.name;
    const data = await Category.findOne({
      name: Name
    })
    if(data !== null){
      res.render("admin/add_category" , {message: "category is already defined"});
    }else{
      const data1 = await new Category({
        name: Name,
      });
      const result = await data1.save();
      if (result) {
        res.redirect("/admin/category");
      } else {
        res.render("admin/add_category", {
          message: "ERror while adding to then database",
        });
      }
    }


  } catch (error) {
    console.log(error.message);
  }
 
  
};

//delete category
const deleteCategory = async (req, res) => {
  const id = req.query.id;
  const data = await Category.findByIdAndRemove(id);
  if (data) {
    res.redirect("/admin/category");
  }
};

//get products
const getProduct = async (req, res) => {
  const data = await Product.find();
  res.render("admin/products", { products: data });
};

//ad products
const getAddProducts = async (req, res) => {
  const data = await Category.find();
  res.render("admin/add_product", { category: data });
};

// Insert Product
const addProduct = async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const category = req.body.category;
    const price = req.body.price;
    const stock = req.body.stock;
    const image = [];
    for (i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
    }
   if(image.length === 0){
    const category = await Category.find()
    res.render('admin/add_product' , {category: category , message: "Please upload an image"})
   }

    image.forEach(function (image, index) {
      const imagePath = path.join(
        __dirname,
        `../public/product_images/${image}`
      );
      const img = fs.readFileSync(imagePath);
      //resize the image
      sharp(img)
        .resize({ width: 350, height: 350, fit: sharp.fit.contain })
        .toFormat("jpeg")
        .flatten({ background: "#ffffff" })
        .toFile(`output${index}.jpeg`)
        .then(() => {
          fs.unlinkSync(`${imagePath}`);
          const newImagePath = path.join(__dirname, `../output${index}.jpeg`);
          const newImage = fs.readFileSync(newImagePath);
          //upload to cdn
          imgurUploader(newImage, { title: "Hello!" }).then((data) => {
            fs.unlinkSync(newImagePath)
            const product =  new  Product({
                productname: name,
                image: data.link,
                description: description,
                category: category,
                price: price,
                stock: stock,
                deleted: false,
            })
            const result  =  product.save()
            if(result){
                res.redirect('/admin/products');
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });

   
  } catch (error) {
    console.log(error.message);
  }
};

//edit product
const getEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);
    const category = await Category.find();
    if (product) {
      res.render("admin/edit_product", {
        product: product,
        category: category,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const postEditProduct = async (req, res) => {
  try {
    const name = req.body.name;
    const id = req.body.id;
   
    const image = [];
    for (i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
    }


    if(image.length === 0){
        console.log("no files");
        const data =await Product.findById(id)
        const category =await Category.find()
        res.render('admin/edit_product', {message: "please upload an image" ,product: data , category: category})
    }
    // const product = await Product.findByIdAndUpdate(id, {
    //   productname: name,
    //   image: image,
    //   description: req.body.description,
    //   category: req.body.category,
    //   price: req.body.price,
    //   stock: req.body.stock,
    //   deleted: false,
    // });

    // const result = await product.save();
    // if (result) {
    //   res.redirect("/admin/products");
    // }
    console.log("files exist");
    image.forEach(function (image, index) {
        const imagePath = path.join(
          __dirname,
          `../public/product_images/${image}`
        );
        const img = fs.readFileSync(imagePath);
        //resize the image
        sharp(img)
          .resize({ width: 350, height: 350, fit: sharp.fit.contain })
          .toFormat("jpeg")
          .flatten({ background: "#ffffff" })
          .toFile(`output${index}.jpeg`)
          .then(() => {
            fs.unlinkSync(`${imagePath}`);
            const newImagePath = path.join(__dirname, `../output${index}.jpeg`);
            const newImage = fs.readFileSync(newImagePath);
            //upload to cdn
            imgurUploader(newImage, { title: "Hello!" }).then((data) => {
              fs.unlinkSync(newImagePath)
             Product.findByIdAndUpdate(id,{
                productname: name,
                  image: data.link,
                  description: req.body.description,
                  category: req.body.category,
                  price: req.body.price,
                  stock: req.body.stock,
                  deleted: false,
              }).then(()=> res.redirect('/admin/products'))
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    

  } catch (error) {
    console.log(error.messsage);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id });
    if (productData.deleted === true) {
      const data = await Product.findByIdAndUpdate(id, { deleted: false });
      if (data) {
        res.redirect("/admin/products");
      }
    } else {
      const data = await Product.findByIdAndUpdate(id, { deleted: true });
      if (data) {
        res.redirect("/admin/products");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

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
  getCategory,
  getAddCategory,
  postAddCategory,
  deleteCategory,
  getProduct,
  getAddProducts,
  addProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
};
