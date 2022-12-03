require("dotenv").config();
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userPermission = require("./userPermission");
const permission = require("./addpermissions");

const UserSchema = mongoose.Schema({
  role_id: {
    type: mongoose.ObjectId,
  },
  emp_code: {
    type: String,
  },
  reporting_user_id: {
    type: mongoose.ObjectId,
  },

  firstname: {
    type: String,
  },
  user_name: {
    type: String,
  },
  password: {
    type: String,
  },
  middle_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  gender: {
    type: String,
  },
  dob: {
    type: String,
  },
  doj: {
    type: String,
  },
  personal_email: {
    type: String,
  },
  company_email: {
    type: String,
  },
  mo_number: {
    type: String,
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
    required: true,
  }

});

UserSchema.methods.genrateToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
    this.token = token
    await this.save();
    return token;
    console.log(token)
  } catch (e) {
    console.log(e)
  }
}


UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // const passsword\Hash=await bcrypt.hash(password,10);
    console.log(`the password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(`tha password is ${this.password}`);
    // this.cnf_password = undefined;
  }
  next();
});

// UserSchema.methods.hasPermission = async function(){
UserSchema.methods.hasPermission = function (permission_name) {
  try {
    // var permissionId = await permission.findOne({permission_name: permission_name});
    //  console.log("permissionId",permissionId);

    var permissionId = permission.findOne({ permission_name: permission_name }).then(async (res) => {
      if (permissionId == null) {
        console.log("flase")
        return false;
      } else {
        var permissionRecords = await userPermission.find({ user_id: this._id, permission_id: res._id })
        console.log("permissionRecords", permissionRecords)
        if (permissionRecords) {
          // console.log("flase")
          return true;
        } else {
          return false;
        }
      }

    })


    // if(permissionId){
    //   var permissionRecords = await userPermission.find({user_id: this._id, permission_id: permissionId._id});
    //   console.log("permissionRecords", permissionRecords)
    //   if(permissionRecords){
    //     return true;
    //   }else{
    //     return false;
    //   }
    // }else{
    //   return
    // }

  } catch (e) {
    console.log(e)
  }
};

/*

get loggedin user role
fetch assigned permission from DB
check given permission (View Holiday) is exist in DB
if yes return true
ekse return false



*/

// UserSchema.methods.data = async function() {
//   try {
    
//     axios({
//       method: "get",
//       url: process.env.BASE_URL/url,
//       headers: { 
//         'x-access-token': req.cookies.jwt, 
//       }
//     })
//       .then(function (response) {
//         sess = req.session;
//         res.render("holidayListing", {
//           holidayData: response.data.holidayData,
//           username: sess.username,
//           users: sess.userData,
//         });
//       })
//       .catch(function (response) {
//         console.log(response);
//       });
//   } catch (e) {
//     res.status(400).send(e);
//   }
// }
const Users = mongoose.model("Users", UserSchema);
module.exports = Users;
