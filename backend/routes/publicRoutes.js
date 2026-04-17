import express from "express";
import { getLandingStats } from "../controllers/publicController.js";
const router = express.Router();
router.get("/landing-stats", getLandingStats);
export default router;
