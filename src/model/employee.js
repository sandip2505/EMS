
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
  
  },
  password: {
    type: String,
    required: true,
  },

  DOB: {
    type: Date,
    required: true
},
number: {
    type: String,
    required: true
},
department: String,


designation: String,

dateAdded: {
    type: Date
},
role: {
  type: String,
  default: 'basic',
  enum: ["basic", "supervisor", "admin"]
},
accessToken: {
  type: String
}
});

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

// convert password in hashvalue
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // const passswordHash=await bcrypt.hash(password,10);
    console.log(`tha password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(`tha password is ${this.password}`);
    // this.cnf_password = undefined;
  }
  next();
});


// create a new  collection
const Employee =  mongoose.model("Employee", employeeSchema);
module.exports = Employee;
//  module.exports = Message;
