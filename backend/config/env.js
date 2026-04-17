import dotenv from "dotenv";

dotenv.config();

const DEFAULT_CORS_ORIGINS = [
  "http://localhost",
  "http://localhost:5173",
  "http://localhost:5174",
];

const escapeRegex = (value) =>
  value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

const wildcardToRegex = (pattern) => {
  if (!pattern) {
    return null;
  }

  const normalizedPattern = pattern.trim();

  if (!normalizedPattern) {
    return null;
  }

  return new RegExp(
    `^${escapeRegex(normalizedPattern).replaceAll("\\*", ".*")}$`,
    "i",
  );
};

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

export const getCorsOriginPatterns = () => {
  const configuredPatterns = getOptionalEnv("CORS_ORIGIN_PATTERNS");

  return configuredPatterns
    .split(",")
    .map((item) => wildcardToRegex(item))
    .filter(Boolean);
};

export const isAllowedCorsOrigin = (origin = "") => {
  if (!origin) {
    return true;
  }

  const exactMatches = getCorsOrigins();
  if (exactMatches.includes(origin)) {
    return true;
  }

  return getCorsOriginPatterns().some((pattern) => pattern.test(origin));
};

export const getCookieSameSite = () =>
  getOptionalEnv("COOKIE_SAME_SITE", isProduction() ? "none" : "lax");

export const isSwaggerEnabled = () =>
  getOptionalEnv("ENABLE_SWAGGER", "true") !== "false";
