const mongoose  = require('mongoose');


const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
      },
      image: {
        type: Array,
      },
      description: {
        type: String,
      },
      category: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      stock: {
        type: String,
        required: true,
      },
      deleted: {
        type: Boolean,
        default: true
      },
})

module.exports = mongoose.model("product",productSchema)