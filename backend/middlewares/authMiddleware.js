import jwt from "jsonwebtoken";
import Donor from "../models/donorModel.js";
import Admin from "../models/adminModel.js";
import Facility from "../models/facilityModel.js";
import { getTokenFromRequest } from "../utils/authCookie.js";
export const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = (await Donor.findById(decoded.id).select("-password")) || (await Admin.findById(decoded.id).select("-password")) || (await Facility.findById(decoded.id).select("-password"));
    if (!user) {
      return res.status(401).json({
        message: "User not found or unauthorized"
      });
    }
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Account is disabled"
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      message: "Token invalid or expired"
    });
  }
};
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }
    next();
  };
};
