const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 

    fname: {
        type: String,
        required: true,
        trim: true 
      },

    lname: {
        type: String,
        required: true,
        trim: true 
      },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
       
    }, 

    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        
      },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8, 
        
    },

    tokens: [{ type: Object ,default: []}],

     


}, { timestamps: true })

module.exports = mongoose.model("User", userSchema);

/* 
{ 
  fname: {string, mandatory},
  lname: {string, mandatory},
  email: {string, mandatory, valid email, unique},
 
  phone: {string, mandatory, unique, valid Indian mobile number}, 
  password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
  repeatpassword: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
  createdAt: {timestamp},
  updatedAt: {timestamp}
}
*/