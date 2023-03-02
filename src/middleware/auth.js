const jwt = require("jsonwebtoken");
// var app = require("../../app")
const Register = require("../model/user");
const auth = async (req, res, next) => {
  // console.log("header", req.headers);
  const token = req.headers["x-access-token"] || req.cookies.jwt;

  if (!token) {
    req.session.destroy()
    // return res.status(403).json("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Register.findById(decoded._id);
  } catch (err) {
    
    
    
    
    
    
    
      return res.status(401).send("Invalid Token");
  }
  return next();
};

// Middleware function to handle ReferenceError


// Add the middleware function to the app

module.exports = auth;


