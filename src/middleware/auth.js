const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

// var app = require("../../app")
const Register = require("../model/user");

const auth = async (req, res, next) => {
//  console.log("header", req.query);
  const token = req.headers["x-access-token"] || req.cookies.jwt;
  try {
  if (!token) {
    req.session.destroy()
    // return res.status(403).json("A token is required for authentication");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const pipeline = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(decoded._id)
      }
    },
    { $addFields: { roleId: { $toObjectId: "$role_id" } } },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role"
      }
    },
    {
      $addFields: {
        roleName: "$role.role_name"
      }
    }
  ];
 
    const user = await Register.aggregate(pipeline);
    req.user = user[0]; // Assuming the pipeline will only return one user
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  
 
 
  return next();
};

// Middleware function to handle ReferenceError


// Add the middleware function to the app

module.exports = auth;


