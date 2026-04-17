import express from "express";
import cors from "cors";
import { isAllowedCorsOrigin, isSwaggerEnabled } from "./config/env.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import bloodLabRoutes from "./routes/bloodLabRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import { applySecurityHeaders } from "./middlewares/securityMiddleware.js";
import { swaggerSpec } from "./openapi/index.js";

const app = express();

const swaggerDocsHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BBMS API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/api/doc.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
        });
      };
    </script>
  </body>
</html>`;

app.disable("x-powered-by");
app.use(applySecurityHeaders);
app.use(async (req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
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
  app.get("/api/doc", (_req, res) => {
    res.type("html").send(swaggerDocsHtml);
  });
  app.get("/api/doc/", (_req, res) => {
    res.redirect(301, "/api/doc");
  });
  app.get("/api/doc.json", (_req, res) => {
    res.json(swaggerSpec);
  });
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

app.use((error, _req, res, _next) => {
  console.error("Backend request error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

export const createApp = () => app;
export default app;
