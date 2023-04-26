const User = require("../Model/user_model");
const bcrypt = require("bcrypt");
const Category = require("../Model/category_model");
const Product = require("../Model/product_model");
const Coupon = require("../Model/coupon_model");
const Banner = require("../Model/banner_model");
const Order = require("../Model/order_model");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const imgurUploader = require("imgur-uploader");
const puppeteer = require("puppeteer");

//password Hash
const { securePassword } = require("../Config");
const { log } = require("console");

//admin dashboard
const getAdmin = async (req, res) => {
  const orderData = await Order.find({ status: { $ne: "cancelled" } });
  let SubTotal = 0;
  orderData.forEach(function (value) {
    SubTotal = SubTotal + value.totalAmount;
  });

  const cod = await Order.find({ paymentMethod: "cod" }).count();
  const online = await Order.find({ paymentMethod: "online" }).count();
  const totalOrder = await Order.find({ status: { $ne: "cancelled" } }).count();
  const totalUser = await User.find().count();
  const totalProducts = await Product.find().count();

  const date = new Date();
  const year = date.getFullYear();
  const currentYear = new Date(year, 0, 1);

  const salesByYear = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: currentYear },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%m", date: "$createdAt" } },
        total: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  let sales = [];
  for (i = 1; i < 13; i++) {
    let result = true;
    for (j = 0; j < salesByYear.length; j++) {
      result = false;
      if (salesByYear[j]._id == i) {
        sales.push(salesByYear[j]);
        break;
      } else {
        result = true;
      }
    }
    if (result) {
      sales.push({ _id: i, total: 0, count: 0 });
    }
  }

  let yearChart = [];
  for (i = 0; i < sales.length; i++) {
    yearChart.push(sales[i].total);
  }

  res.render("admin/admin_home", {
    data: orderData,
    total: SubTotal,
    cod,
    online,
    totalOrder,
    totalUser,
    totalProducts,
    yearChart,
  });
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
  const idLength = id.length;
  if (idLength != 24) {
    res.redirect("/IdMismatch");
  } else {
    const data = await User.findOne({ _id: id });
    if (data == null) {
      res.redirect("/IdMismatch");
    } else {
      res.render("admin/edit_user", { user: data });
    }
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
      name: { $regex: Name, $options: "i" },
    });
    if (data) {
      res.render("admin/add_category", {
        message: "category is already defined",
      });
    } else {
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
    if (image.length === 0) {
      const category = await Category.find();
      res.render("admin/add_product", {
        category: category,
        message: "Please upload an image",
      });
    }
    let newImgArr = [];
    image.forEach(function async(image, index) {
      const imagePath = path.join(
        __dirname,
        `../public/product_images/${image}`
      );
      const img = fs.readFileSync(imagePath);

      imgurUploader(img, { title: "Hello!" }).then((data) => {
        fs.unlinkSync(imagePath);
        newImgArr.push(data.link);
      });
    });

    setTimeout(async () => {
      const product = new Product({
        productname: name,
        image: newImgArr,
        description: description,
        category: category,
        price: price,
        stock: stock,
        deleted: false,
      });
      await product.save();

      res.redirect("/admin/products");
    }, 3000);
  } catch (error) {
    console.log(error.message);
  }
};

//edit product
const getEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const idLength = id.length;
    if (idLength != 24) {
      res.redirect("/IdMismatch");
    } else {
      const product = await Product.findById(id);
      const category = await Category.find();
      if (product == null) {
        res.redirect("/IdMismatch");
      }else{
        res.render("admin/edit_product", {
          product: product,
          category: category,
        });
      }
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

    let newImgArr1 = [];
    if (image.length === 0) {
      const data = await Product.findById(id);
      const category = await Category.find();
      res.render("admin/edit_product", {
        message: "please upload an image",
        product: data,
        category: category,
      });
    }

    image.forEach(function (image, index) {
      const imagePath = path.join(
        __dirname,
        `../public/product_images/${image}`
      );
      const img = fs.readFileSync(imagePath);
      //upload to cdn
      imgurUploader(img, { title: "Hello!" }).then((data) => {
        newImgArr1.push(data.link);
        fs.unlinkSync(imagePath);
      });
    });

    setTimeout(async () => {
      await Product.findByIdAndUpdate(id, {
        productname: name,
        image: newImgArr1,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        deleted: false,
      });
      res.redirect("/admin/products");
    }, 3000);
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

//getCoupon
const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    res.render("admin/coupon", { data: coupon });
  } catch (error) {
    console.log(error.message);
  }
};
//getAddCoupon
const getAddCoupon = async (req, res) => {
  try {
    res.render("admin/add_coupon");
  } catch (error) {
    console.log(error.message);
  }
};
//postAddCoupon
const postAddCoupon = async (req, res) => {
  try {
    let coupons = new Coupon({
      couponcode: req.body.name,
      couponamounttype: req.body.coupontype,
      couponamount: req.body.amount,
      mincartamount: req.body.mincart,
      maxredeemamount: req.body.maxredeem,
      expiredate: req.body.date,
      limit: req.body.limit,
    });
    await coupons.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

//delete coupon
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete({ couponcode: req.query.code });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

// getBanner
const getBanner = async (req, res) => {
  try {
    const bannerData = await Banner.find();
    res.render("admin/banner", { data: bannerData });
  } catch (error) {
    console.log(error.message);
  }
};

//addBanner
const getAddBanner = async (req, res) => {
  try {
    res.render("admin/add_banner");
  } catch (error) {
    console.log(error.message);
  }
};

//postAddBanner
const postAddBanner = async (req, res) => {
  try {
    const heading = req.body.heading;
    const discription = req.body.discription;
    const image = req.file.filename;

    const data = new Banner({
      heading: heading,
      discription: discription,
      image: image,
    });

    const result = await data.save();
    if (result) {
      res.redirect("/admin/banner");
    }
  } catch (error) {
    console.log(error);
  }
};

//unlist banner
const unlistBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Banner.findById(id);
    if (data.status == true) {
      await Banner.findByIdAndUpdate(id, { status: false });
    } else {
      await Banner.findByIdAndUpdate(id, { status: true });
    }
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

//getOrder
const getOrder = async (req, res) => {
  try {
    const orderData = await Order.find();
    let SubTotal = 0;
    orderData.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });
    res.render("admin/order", { data: orderData, total: SubTotal });
  } catch (error) {
    console.log(error.message);
  }
};
//report download
const report = async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://arc018.com/", {
      waitUntil: "networkidle2",
    });
    await page.setViewport({ width: 1680, height: 1050 });
    const todayDate = new Date();
    const pdfn = await page.pdf({
      path: `${path.join(
        __dirname,
        "../public/files",
        todayDate.getTime() + ".pdf"
      )}`,
      format: "A4",
    });

    await browser.close();

    const pdfUrl = path.join(
      __dirname,
      "../public/files",
      todayDate.getTime() + ".pdf"
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfn.length,
    });
    res.sendFile(pdfUrl);
  } catch (error) {
    console.log(error.message);
  }
};

//viewSingleOrder
const viewOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const idLength = orderId.length
      if(idLength != 24){
        res.redirect("/IdMismatch")
      }else{
        const orderData = await Order.findById(orderId).populate(
          "product.productId"
        );
        if(orderData == null ){
          res.redirect("/IdMismatch")
        }else{
          const userId = orderData.user;
        const userData = await User.findById(userId);
    
        res.render("admin/single_order", { orderData, userData });
        }
        
      }
    
  } catch (error) {
    console.log(error.message);
  }
};

//updateStatus
const updateStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const orderId = req.body.orderId;
    await Order.findByIdAndUpdate(orderId, { status: status });
    res.redirect("/admin/order");
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
  getCoupon,
  getAddCoupon,
  postAddCoupon,
  deleteCoupon,
  getBanner,
  getAddBanner,
  postAddBanner,
  unlistBanner,
  getOrder,
  viewOrder,
  updateStatus,
  report,
};
