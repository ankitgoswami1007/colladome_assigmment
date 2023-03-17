const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/auth");
const {
  createUser, 
  loginUser, 
  logoutUser
 
} = require("../controllers/userController");



// FEATURE I - User APIs


router.post("/register", createUser);
router.post('/login', loginUser)
router.post('/logout', authentication, logoutUser)

router.all("/*", function (req, res) {
    res
      .status(404)
      .send({ status: false, msg: "The api you requested is not available" });
  });
  
  module.exports = router;