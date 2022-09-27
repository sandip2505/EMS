
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const employeeSchema =  mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    // unique: [true, "email already exist"],
    // validate(value){
    //     if(!validator.isEmail(value)){
    //         throw new Error("Invali Email")
    //     }
    // }
  },
  password: {
    type: String,
    required: true,
  },
//   cnf_password: {
//     type: String,
//     required: true,
//   },
//   role:{
//     type: Number,
//     default:0,
//   }
  // tokens: [
  //   {
  //     token: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ]
});


// genrating token
// studentSchema.methods.genrateToken = async function () {
//   try {
//     const token = jwt.sign({ _id: this._id.toString() }, process.env.KEY);
//     this.tokens = this.tokens.concat({ token: token });
//     await this.save();
//     return token;
//     console.log(token);
//   } catch (e) {
//     console.log(e);
//   }
// };

//convert password in hashvalue
// studentSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     // const passswordHash=await bcrypt.hash(password,10);
//     console.log(`tha password is ${this.password}`);
//     this.password = await bcrypt.hash(this.password, 10);
//     this.cnf_password = await bcrypt.hash(this.password, 10);
//     console.log(`tha password is ${this.password}`);
//     // this.cnf_password = undefined;
//   }
//   next();
// });
// create a new  collection
const Employee =  mongoose.model("Employee", employeeSchema);
module.exports = Employee;
//  module.exports = Message;
