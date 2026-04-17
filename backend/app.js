import express from "express";
import cors from "cors";
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
  app.use(express.json({
    limit: "100kb"
  }));
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost,http://localhost:5173,http://localhost:5174").split(",").map(item => item.trim()).filter(Boolean);
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  }));
  if (process.env.NODE_ENV !== "production" || process.env.ENABLE_SWAGGER === "true") {
    app.get("/api/doc.json", (_req, res) => {
      res.json(swaggerSpec);
    });
    app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
