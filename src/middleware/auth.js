const jwt = require("jsonwebtoken");
const Register = require("../model/user");
const auth = (req, res, next) => {
  // console.log("header", req.headers);
  const token = req.body.token || req.headers["x-access-token"] || req.query.token || req.cookies.jwt;
  // console.log("token", token);

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("token",req.user);
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = auth;

// const jwt = require("jsonwebtoken");
// const Register = require("../model/user");
// const auth = async (req, res, next) => {
//  console.log(req.headers["x-access-token"]);
//     try {;
//         const token = req.body.token || req.query.token || req.headers["x-access-token"]|| req.cookies.jwt;
//         // const Verify = jwt.verify(token, process.env.JWT_SECRET)
//         const Verify = jwt.verify(token, process.env.JWT_SECRET)
//         const user = await Register.findOne({ _id: Verify._id })
//         req.user = await Register.findById(Verify._id);
//            console.log("saas", req.user)
//         //    res.send({user}) //  console.log(user)
//         next();

//     } catch (e) {
//         res.status(401).send(e)
//     }
// }
// module.exports = auth;