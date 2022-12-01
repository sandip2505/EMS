const jwt = require("jsonwebtoken");
const Register = require("../model/user");
const auth = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"]|| req.cookies.jwt;
//   const token = req.headers["x-access-token"]|| req.cookies.jwt;

    // console.log("token",token)

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = auth;