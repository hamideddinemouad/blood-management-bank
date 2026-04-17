import dotenv from "dotenv";

dotenv.config();

const DEFAULT_CORS_ORIGINS = [
  "http://localhost",
  "http://localhost:5173",
  "http://localhost:5174",
];

const getOptionalEnv = (name, fallback = "") => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : fallback;
};

const getRequiredEnv = (name) => {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const getNodeEnv = () => getOptionalEnv("NODE_ENV", "development");

export const isProduction = () => getNodeEnv() === "production";

export const getPort = () => Number(getOptionalEnv("PORT", "5000"));

export const getMongoUri = () => getRequiredEnv("MONGO_URI");

export const getJwtSecret = () => getRequiredEnv("JWT_SECRET");

export const getCorsOrigins = () => {
  const configuredOrigins = getOptionalEnv("CORS_ORIGINS");
  const source = configuredOrigins || DEFAULT_CORS_ORIGINS.join(",");

  return source
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getCookieSameSite = () =>
  getOptionalEnv("COOKIE_SAME_SITE", "lax");

export const isSwaggerEnabled = () =>
  !isProduction() || getOptionalEnv("ENABLE_SWAGGER") === "true";
