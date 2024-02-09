const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//send Otp
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req body
    const { email } = req.body;
    //check if user already exists
    const checkUserPresent = await User.findOne({ email });
    //if user exist returns a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registerd",
      });
    }
    //generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP GENERATED", otp);
    //check unq otp
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    //create an entry in db for otp
    const otpBody = await OTP.create(otpPayload);
    //return response sucess
    res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
      otp,
    });
  } catch (err) {
    console.log(err);
    res.status(401);
  }
};

//signUp
exports.signUp = async (req, res) => {
  //datafetch from req body
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //Validate the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(401).json({
        success: false,
        message: "All fields requied",
      });
    }
    //match password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password does not match pls try again",
      });
    }
    //If user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    //Find most recent otp
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    //Validate OTP
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP NOT FOUND",
      });
    } else if (otp !== recentOtp) {
      return res.status(400).json({
        success: false,
        message: "INVALID OTP",
      });
    }
    //Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    //Profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
      image: null,
    });
    //Entry into DB
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashPassword,
      accountType,
      addtionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/intials/svg?seed=${firstName}${lastName}`,
    });
    //retunr res
    return res.status(200).json({
      success: true,
      message: "User is registered",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registed pls try again",
    });
  }
};
//Login
exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;

    //Validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are requried please try again",
      });
    }
    //user check exist or not
    const user = await User.findOne({ email }.populate("additionalDetails"));
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered please signup",
      });
    }
    //generate JWT,after password match
    if (await bcrypt.compare(password, user.password)) {
      const payLoad = {
        email: user.email,
        id: user.id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;
      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "LoggedIn SucessFully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Password mismatch",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

//changePassword
exports.changePassword = async (req, res) => {
  //get data from req body
  try {
    const { email, oldpassword, newpassword, confirmPassword } = req.body;
    password = await User.findOne({ email });
    if (oldpassword === password && newpassword === confirmPassword) {
      User.create();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Try Once more",
    });
  }
  //get oldPassword,newPass,confirmPass

  //validation

  //update pwd in DB

  //return response
};
