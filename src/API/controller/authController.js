const technology = require("../../model/technology");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Helper = require("../../utils/helper");
const helper = new Helper();
const technologyApi = require("../../project_api/technology");
const Users = require("../../model/user");
const emailtoken = require("../../model/token");
const sendEmail = require("../../utils/send_forget_mail");
const token = require("../../model/token");

const authController = {};
authController.employeelogin = async (req, res) => {
  try {
    console.log("gtetttt");
    const company_email = req.body.company_email;
    const password = req.body.password;
    const users = await Users.findOne({ company_email });
    if (!users) {
      res.status(400).json({ message: "Invalid email" });
    } else if (!(users.status == "Active")) {
      res.status(400).json({ message: "Please Active Your Account" });
    } else {
      // conole.log("gettttt")
      const isMatch = await bcrypt.compare(password, users.password);
      if (isMatch) {
        var token = jwt.sign(
          {
            _id: users._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '30d',
          }
        );
        console.log("token",token)
        await Users.findByIdAndUpdate(users._id, { token });

        const userData = await Users.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { company_email: company_email } },
          { $addFields: { roleId: { $toObjectId: "$role_id" } } },
          {
            $lookup: {
              from: "roles",
              localField: "roleId",
              foreignField: "_id",
              as: "roleData",
            },
          },
        ]);
        res.json({ userData });
      } else {
        res.status(400).json({ message: "Incorrect password" });
      }
    }
  } catch (error) {
    console.log("e", error);
  }
};
authController.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
    }
    res.clearCookie(options.name);
    // res.json("logout succuss");
  });
};
authController.change_password = async (req, res) => {
  sess = req.session;
  try {
    const _id = req.params.id;
    const userData = await Users.findById(_id);
    res.render("change_password", {
      userData: userData,
      loggeduserdata: req.user,
      users: sess.userData,
      role: sess.role,
      layout: false,
      alert: req.flash("alert"),
      success: req.flash("success"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
authController.save_password = async (req, res) => {
  sess = req.session;
  try {
    const _id = req.params.id;

    const password = req.body.oldpassword;
    const newpwd = req.body.newpassword;
    const cpassword = req.body.cpassword;
    const bcryptpass = await bcrypt.hash(newpwd, 10);
    const newpassword = {
      password: bcryptpass,
      updated_at: Date(),
    };
    const user_id = new BSON.ObjectId(req.params.id);
    const userData = await Users.find({ _id: user_id });
    const isMatch = await bcrypt.compare(password, userData[0].password);
    if (!isMatch) {
      res.status(400).json({
        changePassStatus: false,
        message: "incorrect current password",
      });
    } else if (!(newpwd == cpassword)) {
      res.status(400).json({
        changePassStatus: false,
        message: "confirm password not matched",
      });
    } else {
      const newsave = await Users.findByIdAndUpdate(_id, newpassword);
      res
        .status(201)
        .json({ changePassStatus: true, message: "Your Password is Updated" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
authController.activeuser = async (req, res) => {
  try {
    const _id = req.params.id;
    const userActive = {
      status: "Active",
      updated_at: Date(),
    };
    const updateEmployee = await Users.findByIdAndUpdate(_id, userActive);
    res.status(200).json({ message: "Your Account is Activated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
authController.checkLoginEmail = async (req, res) => {
  try {
    const company_email = req.body.company_email;
    const users = await Users.find({
      company_email: company_email,
      deleted_at: "null",
    }).select("company_email");
    if (users.length > 0) {
      res.staus(400).json({ message: "Invalid email" });
    } else {
      res.status(200).json({ emailStatus: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
authController.checkLoginPassword = async (req, res) => {
  try {
    const company_email = req.body.company_email;
    const password = req.body.password;
    const userData = await Users.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { company_email: company_email } },
      { $addFields: { roleId: { $toObjectId: "$role_id" } } },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleData",
        },
      },
    ]);
    if (userData.length > 0) {
      const isMatch = await bcrypt?.compare(password, userData[0]?.password);
      if (!isMatch) {
        res.staus(200).json({ passwordError: true });
      } else {
        res.status(200).json({ passwordStatus: true });
      }
    } else {
      res.status(200).json({ isUserExist: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
authController.change = async (req, res) => {
  console.log("getttt")
  const _id = req.params.id;
  const tokenid = req.params.token;
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  const users = await Users.findById(req.params.id);
  console.log(users,"users")
  const tokenData = await token.findOne({
    userId: users._id,
    token: req.params.token,
  });
  console.log("tokenData",tokenData)
  if (!tokenData)
    return res
      .status(400)
      .json({ tokenStatus: false, message: "invalid link or expired" });

  if (!(password == cpassword)) {
    res.status(400).json({ success: "please check confirm password" });
  } else {
    const passswords = await bcrypt.hash(req.body.password, 10);
    const updatepassword = {
      password: passswords,
    };
    const updatPssword = await Users.findByIdAndUpdate(_id, updatepassword);

    await tokenData.delete();
    res.status(201).json({ message: "Password Updated Successfully" });
  }
};
authController.checktoken = async (req, res) => {
  const _id = req.params.id;
  const tokenid = req.params.token;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

  const users = await Users.findById(req.params.id);
  if (!users)
    return res
      .status(400)
      .json({ tokenStatus: false, message: "invalid link or expired" });
  const token = await emailtoken.findOne({
    userId: users._id,
    token: tokenid,
  });
  if (!token)
    return res
      .status(400)
      .json({ tokenStatus: false, message: "invalid link or expired" });
};
authController.sendforget = async (req, res) => {
  try {
    const Email = req.body.company_email;
    const emailExists = await Users.findOne({ company_email: Email });
    if (emailExists) {
      let token = await emailtoken.findOne({ userId: emailExists._id });
      if (!token) {
        token = await new emailtoken({
          userId: emailExists._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
      }
      const link = `${process.env.BASE_URL}/change_pwd/${emailExists._id}/${token.token}`;
      await sendEmail(
        emailExists.company_email,
        emailExists.firstname,
        emailExists._id,
        link,
        token.token
      );
      res.status(200).json({ status: 1, message: "Email Sent Successfully" });
    } else {
      res.status(403).json({ status: 0, message: "User Not found" });
    }
  } catch (error) {
    console.log("error", error);
    res.send("noooo");
  }
};
authController.activeuserAccount = async (req, res) => {
  try {
    const userData = await Users.findById(req.params.id);
    if (!(userData.status == "Active")) {
      const _id = req.params.id;
      const password = req.body.password;
      const cpassword = req.body.cpassword;

      const users = await Users.findById(req.params.id);
      if (!(password == cpassword)) {
        res.staus(400).json({ message: "please check confirm password" });
      } else {
        const passswords = await bcrypt.hash(req.body.password, 10);
        const updatepassword = {
          password: passswords,
          status: "Active",
        };
        const updatPssword = await Users.findByIdAndUpdate(_id, updatepassword);
        res.status(200).json({
          message: "Account is activated",
        });
      }
    } else {
      res.status(400).json({
        message: "Your account is already activated",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = authController;
