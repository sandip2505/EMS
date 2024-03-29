require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userPermission = require("./userPermission");
const permission = require("./addpermissions");

const UserSchema = mongoose.Schema({
  role_id: {
    ref:"Role",
    type: mongoose.ObjectId,
  },
  emp_code: {
    type: String,
    required: [true, "Employee Code is required"],
  },
  reporting_user_id: {
    type: mongoose.ObjectId,
  },

  firstname: {
    type: String,
    required: [true, "Firstname is required"],
  },
  user_name: {
    type: String,
    required: [true, "Username is required"],
  },
  password: {
    type: String,
    default:""
  },
  middle_name: {
    type: String,
  },
  last_name: {
    type: String,
    required: [true, "Last Name is required"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
  },
  dob: {
    type: Date,
    required: [true, "Date Of Birth is required"],
  },
  doj: {
    type: Date,
    required: [true, "Date Of joining is required"],
  },
  personal_email: {
    type: String,
    required: [true, "Personal Email is required"],
  },
  company_email: {
    type: String,
    required: [true, "Company Email is required"]
  },
  mo_number: {
    type: String,
    required: [true, "Mo Number is required"]
  },
  pan_number: {
    type: String,
  },
  aadhar_number: {
    type: String,
  },
  add_1: {
    type: String,
  },
  add_2: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
  },
  country: {
    type: String,
  },
  photo: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "Pending",
  },
  bank_account_no: {
    type: String,
  },
  bank_name: {
    type: String,
  },
  ifsc_code: {
    type: String,
  },
  created_at: {
    type: String,
    default: new Date(),
  },
  updated_at: {
    type: String,
    default: "null",
  },
  deleted_at: {
    type: String,
    default: "null",
  },
  token: {
    type: String,
    // required: true,
  },
});

UserSchema.methods.genrateToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.JWT_SECRET
    );
    this.token = token;
    await this.save();
    return token;
    // //console.log(token);
  } catch (e) {
    //console.log(e);
  }
};

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // const passsword\Hash=await bcrypt.hash(password,10);
    //console.log(`the password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    //console.log(`tha password is ${this.password}`);
    // this.cnf_password = undefined;
  }
  next();
});

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;
