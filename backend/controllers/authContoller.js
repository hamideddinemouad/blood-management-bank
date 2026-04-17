import bcrypt from "bcryptjs";
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import Admin from "../models/adminModel.js";
import DemoSeedState from "../models/demoSeedStateModel.js";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";
import { DEMO_LOGIN_ACCOUNTS, seedDemoData } from "../seedDemo.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
const DEMO_SEED_STATE_KEY = "demo-seed";
const DEMO_SEED_TTL_MS = 1 * 1000;
const DEMO_SEED_LOCK_MS = 5 * 60 * 1000;
const DEMO_SEED_WAIT_TIMEOUT_MS = 30 * 1000;
const DEMO_SEED_WAIT_INTERVAL_MS = 1000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const findUserByEmail = async (email, includePassword = false) => {
  const selectClause = includePassword ? "+password" : "";
  return (await Donor.findOne({
    email
  }).select(selectClause)) || (await Admin.findOne({
    email
  }).select(selectClause)) || (await Facility.findOne({
    email
  }).select(selectClause));
};
const validateFacilityAccess = user => {
  if (!(user instanceof Facility)) {
    return null;
  }
  if (user.status === "pending") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Your account is awaiting admin approval. Please wait before logging in."
      }
    };
  }
  if (user.status === "rejected") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Your registration has been rejected by admin. Contact support for details."
      }
    };
  }
  return null;
};
const getRedirectForRole = role => {
  if (role === "donor") return "/donor";
  if (role === "hospital") return "/hospital";
  if (role === "blood-lab") return "/lab";
  if (role === "admin") return "/admin";
  return "/";
};
const generateAuthToken = user => jwt.sign({
  id: user._id,
  role: user.role
}, getJwtSecret(), {
  expiresIn: "7d"
});
const completeSuccessfulLogin = async (user, message = "Login successful") => {
  user.lastLogin = new Date();
  if (user instanceof Facility) {
    user.history.push({
      eventType: "Login",
      description: "Facility logged in successfully",
      date: new Date()
    });
    if (user.history.length > 50) {
      user.history = user.history.slice(-50);
    }
  }
  await user.save();
  return {
    success: true,
    message,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    },
    redirect: getRedirectForRole(user.role)
  };
};
const isSeedFresh = state => Boolean(state?.lastSeededAt && Date.now() - state.lastSeededAt.getTime() < DEMO_SEED_TTL_MS);
const hasActiveSeedLock = state => Boolean(state?.seeding && state.seedLockExpiresAt && state.seedLockExpiresAt.getTime() > Date.now());
const waitForDemoSeedToFinish = async () => {
  const deadline = Date.now() + DEMO_SEED_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await DemoSeedState.findOne({
      key: DEMO_SEED_STATE_KEY
    });
    if (!hasActiveSeedLock(state)) {
      return state;
    }
    await sleep(DEMO_SEED_WAIT_INTERVAL_MS);
  }
  throw new Error("Demo data refresh is taking longer than expected");
};
const tryAcquireDemoSeedLock = async () => {
  const now = new Date();
  try {
    return await DemoSeedState.findOneAndUpdate({
      key: DEMO_SEED_STATE_KEY,
      $or: [{
        seeding: {
          $ne: true
        }
      }, {
        seedLockExpiresAt: {
          $exists: false
        }
      }, {
        seedLockExpiresAt: null
      }, {
        seedLockExpiresAt: {
          $lte: now
        }
      }]
    }, {
      $setOnInsert: {
        key: DEMO_SEED_STATE_KEY,
        seedVersion: "v1"
      },
      $set: {
        seeding: true,
        seedLockExpiresAt: new Date(now.getTime() + DEMO_SEED_LOCK_MS)
      }
    }, {
      upsert: true,
      new: true
    });
  } catch (error) {
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};
const releaseDemoSeedLock = async ({
  successful
}) => {
  const update = successful ? {
    $set: {
      seeding: false,
      lastSeededAt: new Date(),
      seedVersion: "v1"
    },
    $unset: {
      seedLockExpiresAt: 1
    }
  } : {
    $set: {
      seeding: false
    },
    $unset: {
      seedLockExpiresAt: 1
    }
  };
  await DemoSeedState.findOneAndUpdate({
    key: DEMO_SEED_STATE_KEY
  }, update, {
    new: true
  });
};
const ensureFreshDemoData = async () => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let state = await DemoSeedState.findOne({
      key: DEMO_SEED_STATE_KEY
    });
    if (hasActiveSeedLock(state)) {
      state = await waitForDemoSeedToFinish();
    }
    if (isSeedFresh(state)) {
      return;
    }
    const lock = await tryAcquireDemoSeedLock();
    if (!lock) {
      await waitForDemoSeedToFinish();
      continue;
    }
    try {
      await seedDemoData();
      await releaseDemoSeedLock({
        successful: true
      });
      return;
    } catch (error) {
      await releaseDemoSeedLock({
        successful: false
      });
      throw error;
    }
  }
  throw new Error("Unable to prepare fresh demo data right now");
};
export const register = async (req, res) => {
  try {
    const role = req.body.role?.trim();
    if (!role) {
      return res.status(400).json({
        message: "Role is required"
      });
    }
    let user;
    if (role === "donor") {
      user = await Donor.create(req.body);
    } else if (role === "hospital" || role === "blood-lab") {
      user = await Facility.create(req.body);
    } else {
      return res.status(400).json({
        message: "Invalid role"
      });
    }
    const redirect = role === "donor" ? "/donor/dashboard" : "/";
    res.status(201).json({
      success: true,
      message: role === "donor" ? "Donor registered successfully! Redirecting to dashboard..." : "Facility registered successfully! Please wait for admin approval.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      redirect
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with that email already exists"
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid registration details provided"
      });
    }
    res.status(500).json({
      message: "Registration failed"
    });
  }
};
export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({
      message: "Email and password are required"
    });
    const user = await findUserByEmail(email, true);
    if (!user) {
      console.log(`❌ Invalid login attempt for email: ${email}`);
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
    console.log(`✅ User found: ${email}, Role: ${user.role}`);
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled. Please contact support."
      });
    }
    const facilityAccessError = validateFacilityAccess(user);
    if (facilityAccessError) {
      return res.status(facilityAccessError.status).json(facilityAccessError.body);
    }
    const token = generateAuthToken(user);
    const responsePayload = await completeSuccessfulLogin(user);
    setAuthCookie(res, token);
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("🚨 Login Error:", error);
    res.status(500).json({
      message: "Login failed"
    });
  }
};
export const demoAccess = async (req, res) => {
  try {
    const roleKey = req.body.roleKey?.trim();
    const demoAccount = roleKey ? DEMO_LOGIN_ACCOUNTS[roleKey] : null;
    if (!demoAccount) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo role selected"
      });
    }
    await ensureFreshDemoData();
    const user = await findUserByEmail(demoAccount.email, false);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Demo account is unavailable after refresh"
      });
    }
    const facilityAccessError = validateFacilityAccess(user);
    if (facilityAccessError) {
      return res.status(facilityAccessError.status).json(facilityAccessError.body);
    }
    const token = generateAuthToken(user);
    const responsePayload = await completeSuccessfulLogin(user, "Demo login successful");
    setAuthCookie(res, token);
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("🚨 Demo Access Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to prepare fresh demo data right now"
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    let user;
    if (req.user.role === "donor") {
      user = await Donor.findById(req.user.id).select("-password");
    } else if (req.user.role === "admin") {
      user = await Admin.findById(req.user.id).select("-password");
    } else {
      user = await Facility.findById(req.user.id).select("-password");
    }
    if (!user) return res.status(404).json({
      message: "User not found"
    });
    res.status(200).json({
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile"
    });
  }
};
export const logout = async (_req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};
