import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";
import Donor from "../models/donorModel.js";
import { getTokenFromRequest } from "../utils/authCookie.js";
export const protectDonor = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({
      message: "No token provided"
    });
    return;
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.donor = await Donor.findById(decoded.id).select("-password");
    if (!req.donor) return res.status(401).json({
      message: "Unauthorized"
    });
    if (req.donor.role !== "donor") {
      return res.status(403).json({
        message: "Donor access only"
      });
    }
    if (req.donor.isActive === false) {
      return res.status(403).json({
        message: "Donor account is disabled"
      });
    }
    next();
  } catch (error) {
    console.error("Donor auth error:", error);
    res.status(401).json({
      message: "Token invalid or expired"
    });
  }
};
