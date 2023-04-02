//Twilio Config
const accountSid = process.env.Acc_sid;
const authToken = process.env.Auth_token;
const client = require("twilio")(accountSid, authToken, {
  lazyLoading: true,
});


//Bcrypt Config
const bcrypt = require('bcrypt');
//password Hash
const securePassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  };









module.exports ={
    client,
    securePassword,

}