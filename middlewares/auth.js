const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
//auth
exports.auth = async (req, res, next) => {
  try {
    //to check auth we use jsontoken
    //extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer", "");
    //if token missing return
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    //verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is ivalid",
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something went worng for validation",
    });
  }
};
//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected role for Students",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot verify",
    });
  }
};

//isInstructor
exports.isInstuctor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Insturctor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected role for Students",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot verify",
    });
  }
};
//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Insturctor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected role for Admins",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role cannot verify",
    });
  }
};
