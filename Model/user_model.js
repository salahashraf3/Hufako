const mongoose  = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/Project1").then(()=>{
    console.log("Connected to MongoDB");
})

const usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {  
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    isVerified: {
        type:Boolean,
        required: true
    }


})

module.exports = mongoose.model("user",usersSchema)

