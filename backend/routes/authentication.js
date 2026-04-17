import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import dotenv from "dotenv";
import { isValidMoroccanPhone, normalizeMoroccanPhone } from "../utils/moroccanPhone.js";
dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ROLES = ["donor", "hospital", "admin"];
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not configured in environment variables");
  process.exit(1);
}
const validateRegistration = (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    bloodType,
    hospitalInfo,
    phone
  } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password and role are required"
    });
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }
  if (role === "donor" && !bloodType) {
    return res.status(400).json({
      success: false,
      message: "Blood type is required for donors"
    });
  }
  if (role === "hospital" && (!hospitalInfo || !hospitalInfo.licenseNumber)) {
    return res.status(400).json({
      success: false,
      message: "License number is required for hospitals"
    });
  }
  if (role !== "admin" && !isValidMoroccanPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid Moroccan phone number, for example 0612345678 or +212612345678"
    });
  }
  if (hospitalInfo?.emergencyContact && !isValidMoroccanPhone(hospitalInfo.emergencyContact)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid Moroccan emergency contact number, for example 0612345678 or +212612345678"
    });
  }
  next();
};
const createToken = user => {
  return jwt.sign({
    id: user._id,
    role: user.role,
    email: user.email
  }, JWT_SECRET, {
    expiresIn: "7d"
  });
};
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      bloodType,
      healthInfo,
      hospitalInfo,
      emergencyContact
    } = req.body;
    const existingUser = await User.findOne({
      $or: [{
        email
      }, {
        "hospitalInfo.licenseNumber": hospitalInfo?.licenseNumber
      }]
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      } else {
        return res.status(409).json({
          success: false,
          message: "License number already registered"
        });
      }
    }
    const userData = {
      name,
      email,
      password,
      role,
      phone: normalizeMoroccanPhone(phone),
      address,
      isActive: true
    };
    if (role === "donor") {
      userData.bloodType = bloodType;
      userData.healthInfo = healthInfo || {};
    }
    if (role === "hospital") {
      userData.hospitalInfo = {
        ...hospitalInfo,
        emergencyContact: normalizeMoroccanPhone(hospitalInfo?.emergencyContact || emergencyContact)
      };
    }
    const user = new User(userData);
    await user.save();
    const userWithoutPassword = await User.findById(user._id).select("-password");
    const token = createToken(userWithoutPassword);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already registered`
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail
    }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    const userWithoutPassword = await User.findById(user._id).select("-password");
    const token = createToken(userWithoutPassword);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});
export default router;
