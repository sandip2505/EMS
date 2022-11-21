const jwt = require("jsonwebtoken");
const Register = require("../model/user");
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        const Verify = jwt.verify(token,process.env.JWT_SECRET)
        const user = await Register.findOne({ _id: Verify._id })
        req.user = await Register.findById(Verify._id);
        //  console.log("saas", req.user)
        //    res.send({user}) //  console.log(user)
        next();

    } catch (e) {
        res.status(401).send(e)
    }
}
module.exports = auth;