const jwt = require('jsonwebtoken');

const authentication = async function (req, res, next) {
  try {
    let token = req.headers.authorization

    // if no token found
    if (!token) {
      return res.status(400).send({ status: false, message: "Token required! Please login to generate token" });
    }
    token = token.split(" ")[1];

    jwt.verify(token, "colladome", { ignoreExpiration: true }, function (error, decodedToken) {
      // if token is invalid
      if (error) {
        return res.status(401).send({ status: false, message: "Token is invalid" });
      }
      // if token is valid
      else {
        // if token expired
        if (Date.now() > decodedToken.exp * 1000) {
          return res.status(401).send({ status: false, message: "Session Expired, please login again" });
        }
        req.userId = decodedToken.userId;
        next();
      }
    }
    );
  } catch (err) {
    res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
  }
};



module.exports = { authentication };
