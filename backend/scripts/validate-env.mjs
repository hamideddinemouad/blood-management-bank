import dotenv from "dotenv";

dotenv.config();

const errors = [];

const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim() || "";

  if (!value) {
    errors.push(`${name} is required for backend builds.`);
  }

  return value;
};

const isValidHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

const validateUrlList = (name, value) => {
  for (const entry of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    if (!isValidHttpUrl(entry)) {
      errors.push(`${name} contains an invalid URL: ${entry}`);
    }
  }
};

const validateWildcardUrlPatterns = (name, value) => {
  for (const entry of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const normalized = entry.replace("*.", "subdomain.");

    if (!isValidHttpUrl(normalized)) {
      errors.push(`${name} contains an invalid wildcard URL pattern: ${entry}`);
    }
  }
};

const mongoUri = getRequiredEnv("MONGO_URI");
const jwtSecret = getRequiredEnv("JWT_SECRET");
const nodeEnv = getRequiredEnv("NODE_ENV");
const cookieSameSite = getRequiredEnv("COOKIE_SAME_SITE");
const corsOrigins = getRequiredEnv("CORS_ORIGINS");
const swaggerFlag = process.env.ENABLE_SWAGGER?.trim() || "";
const corsOriginPatterns = process.env.CORS_ORIGIN_PATTERNS?.trim() || "";

if (mongoUri && !/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
  errors.push("MONGO_URI must start with mongodb:// or mongodb+srv://");
}

if (jwtSecret) {
  if (jwtSecret.length < 24) {
    errors.push("JWT_SECRET must be at least 24 characters long.");
  }

  const weakSecrets = new Set([
    "secret",
    "changeme",
    "your_jwt_secret_key_here",
    "replace-this-with-a-long-random-secret",
  ]);

  if (weakSecrets.has(jwtSecret.toLowerCase())) {
    errors.push("JWT_SECRET is too weak. Use a long random secret.");
  }
}

if (nodeEnv && nodeEnv !== "production") {
  errors.push("NODE_ENV must be set to production for backend deployments.");
}

if (cookieSameSite && !["lax", "strict", "none"].includes(cookieSameSite.toLowerCase())) {
  errors.push("COOKIE_SAME_SITE must be one of: lax, strict, none.");
}

if (corsOrigins) {
  validateUrlList("CORS_ORIGINS", corsOrigins);
}

if (corsOriginPatterns) {
  validateWildcardUrlPatterns("CORS_ORIGIN_PATTERNS", corsOriginPatterns);
}

if (swaggerFlag && !["true", "false"].includes(swaggerFlag.toLowerCase())) {
  errors.push("ENABLE_SWAGGER must be either true or false when provided.");
}

if (errors.length > 0) {
  console.error("Backend environment validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Backend environment validation passed.");
