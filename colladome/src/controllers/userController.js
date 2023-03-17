const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require('./awsUpload')
const validator = require('../validators/validator');
const jwt = require('jsonwebtoken');







// ========================================= create User profile =======================================

const createUser = async function (req, res) {
  try {

    

    const data = req.body

    // first Check request body is coming or not 
    if (!validator.isValidRequestBody(data)) {
      res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide User details' })
      return
    }

    // Object Destructing
    let { fname, lname, email, phone, password} = data


    // Check Name is coming or not
    if (!validator.isValid(fname)) {
      res.status(400).send({ status: false, message: 'FirstName is mandatory' })
      return
    }

    // Check Name is valid or not 
    if (!validator.isValid2(fname)) {
      res.status(400).send({ status: false, message: 'FirstName is not a valid name' })
      return
    }

    let validString = /\d/;
    if (validString.test(fname))
      return res.status(400).send({ status: false, msg: "FirstName must be valid it should not contains numbers" });

    // Check Name is coming or not
    if (!validator.isValid(lname)) {
      res.status(400).send({ status: false, message: 'LastName is mandatory' })
      return
    }

    // Check Name is valid or not 
    if (!validator.isValid2(lname)) {
      res.status(400).send({ status: false, message: 'LastName is not a valid name' })
      return
    }


    if (validString.test(lname))
      return res.status(400).send({ status: false, msg: "LastName must be valid it should not contains numbers" });

    

    // Check Phone Number is coming or not
    if (!validator.isValid(phone)) {
      res.status(400).send({ status: false, message: 'Phone number is mandatory' })
      return

    }

    // Validate the Phone Number
    if (!validator.isValidPhone(phone)) {
      res.status(400).send({ status: false, message: 'Phone number is not a valid' })
      return

    }

    // Check Duplicate Phone Number
    const isExistPhone = await userModel.findOne({ phone: phone })
    if (isExistPhone) {
      res.status(400).send({ status: false, message: 'This phone number belong to other user' })
      return
    }

    // Check Email is Coming or not 
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: 'Email is required' })
      return
    }

    // Validate Email
    if (!validator.isValidEmail(email)) {
      res.status(400).send({ status: false, message: 'Email is invalid' })
      return
    }

    // Check Duplicate Email 
    const isExistEmail = await userModel.findOne({ email: email })
    if (isExistEmail) {
      res.status(400).send({ status: false, message: 'This Email belong to other user' })
      return
    }

    // Check Password is Coming Or not 
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: 'password is required' })
      return
    }

    // Validate Password
    if (!validator.isValidPassword(password)) {
      res.status(400).send({ status: false, message: 'Password must be 8-15 characters long consisting of atleast one number, uppercase letter, lowercase letter and special character' })
      return
    }

    const hashPass = await validator.hashPassword(password)
    data.password = hashPass

    


    // const data1 =  { fname, lname, email, phone, address }
    // data1.profileImage = data.profileImage
    // data1.password = hashPass
    let finalData = {
      fname,
      lname,
      email,
      phone,
      password: hashPass,
      
    }


    // Finally Create The User Details After Validation
    let userData = await userModel.create(finalData)
    res.status(201).send({ status: true, message: 'User created successfully', data: userData })

  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

//============================================Login user=================================

const loginUser = async (req, res) => {

  try {

    // Extract data from RequestBody
    let data = req.body

    // first Check request body is coming or not 
    if (!validator.isValidRequestBody(data)) {
      res.status(400).send({ status: false, Message: 'Invalid request parameters. Please provide User details' })
      return
    }

    // Extract Email And Password
    const { email, password } = data

    // Check Email is Coming Or not 
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: 'Email is required' })
      return
    }

    // Validate Email
    if (!validator.isValidEmail(email)) {
      res.status(400).send({ status: false, message: 'Email is invalid' })
      return
    }

    // Check password is Coming Or not 
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: 'password is required' })
      return
    }

    // Validate password
    if (!validator.isValidPassword(password)) {
      res.status(400).send({ status: false, message: 'It is not valid password' })
      return
    }



    // Check Email and password is Present in DB  
    let user = await userModel.findOne({ email: email })

    if (!user || ! await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ status: false, msg: "Email or password does not match, Invalid login Credentials" })
    }
    // const hashPass = await validator.hashPassword(password)

    // Generate Token 
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        iat: new Date().getTime() / 1000,
      },
      "colladome", { expiresIn: "1d" }
    )


    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter(t => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
        if (timeDiff < 86400) {
          return t;
        }
      });
    }
  
    await userModel.findByIdAndUpdate(user._id, {
      tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    });
  
    const userInfo = {
      userId: user._id,
      email: user.email,
    };
  
    // Send the token to Response Header
    //res.header("x-api-key" , token)


    // send response to  user that Author is successfully logged in
    res.status(200).send({ status: true, message: "User login successfull", data: { userInfo, token: token } })

  }
  catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }

}



//------------------------------------------------------------------------------------------------------------------------------------------------------

const logoutUser = async (req, res) => {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: 'Authorization fail!' });
      }
  
      const tokens = req.user.tokens;
  
      const newTokens = tokens.filter(t => t.token !== token);
  
      await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
      res.json({ success: true, message: 'Logout successfully!' });
    }
  };

//------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { createUser, loginUser, logoutUser };
