const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your mail is not present",
      });
    }
    //generate token
    const token = crypto.randomUUID();

    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containinf the url
    await mailSender(
      email,
      "PasswordResetLink",
      `Password reset link : ${url}`
    );
    //return response
    return res.statu(200).json({
      success: true,
      message: "Email sent sucess",
    });
  } catch (err) {
    console.log(err);
    return res.statu(500).json({
      success: false,
      message: "Email not sent sucess",
    });
  }
};

//resetPassword
exports.resetPasswordToken = async (req, res) => {
  try {
    //data fetck
    const { password, confirmPassword, token } = res.body;
    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });
    }
    //get userdetails from db using token
    const userDetails = await user.findOne({ token });
    if (!userDeatils) {
      return res.status(401).json({
        success: false,
        message: "token invalid",
      });
    }
    //token
    if (userDetails.resetPasswordExpires > Date.now()) {
      return res.status(401).json({
        success: false,
        message: "token expired",
      });
    }
    //Hash pwd
    const hashedPassword = await bcrypt.hash(password, 10);

    //Pass update
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Reset Success",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Reset unSuccess",
    });
  }
};
