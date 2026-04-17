import express from "express";
import cors from "cors";
import {
  getMaskedEnvDebugSnapshot,
  isAllowedCorsOrigin,
  isSwaggerEnabled,
} from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import bloodLabRoutes from "./routes/bloodLabRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import { applySecurityHeaders } from "./middlewares/securityMiddleware.js";
import { swaggerUi, swaggerSpec } from "./openapi/index.js";
export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(applySecurityHeaders);
  app.use((req, _res, next) => {
    console.log("Backend request env debug:", {
      method: req.method,
      path: req.originalUrl,
      env: getMaskedEnvDebugSnapshot(),
    });
    next();
  });
  app.use(express.json({
    limit: "100kb"
  }));
  app.use(cors({
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  }));
  if (isSwaggerEnabled()) {
    app.get("/", (_req, res) => {
      res.redirect("/api/doc");
    });
    app.get("/api/doc.json", (_req, res) => {
      res.json(swaggerSpec);
    });
    app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  } else {
    app.get("/", (_req, res) => {
      res.status(200).json({
        success: true,
        message: "BBMS API is running"
      });
    });
  }
  app.use("/api/auth", authRoutes);
  app.use("/api/donor", donorRoutes);
  app.use("/api/facility", facilityRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/blood-lab", bloodLabRoutes);
  app.use("/api/hospital", hospitalRoutes);
  return app;
};
export default createApp;
