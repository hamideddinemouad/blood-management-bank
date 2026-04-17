import jwt from "jsonwebtoken";
import Facility from "../models/facilityModel.js";
import { getTokenFromRequest } from "../utils/authCookie.js";
export const protectFacility = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token"
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const facility = await Facility.findById(decoded.id).select("-password");
    if (!facility) {
      return res.status(404).json({
        message: "Facility not found"
      });
    }
    if (!["hospital", "blood-lab"].includes(facility.role)) {
      return res.status(403).json({
        message: "Facility access only"
      });
    }
    if (facility.isActive === false) {
      return res.status(403).json({
        message: "Facility account is disabled"
      });
    }
    if (facility.status !== "approved") {
      return res.status(403).json({
        message: "Facility account must be approved before accessing this resource"
      });
    }
    req.user = facility;
    next();
  } catch (error) {
    console.error("Facility Auth Error:", error);
    res.status(401).json({
      message: "Not authorized, token failed"
    });
  }
};
