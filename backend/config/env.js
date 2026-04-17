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

export const getMongoUri = () => getRequiredEnv("MONGODB_URI");

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

const maskValue = (value = "", { visibleStart = 4, visibleEnd = 4 } = {}) => {
  if (!value) {
    return "(missing)";
  }

  if (value.length <= visibleStart + visibleEnd) {
    return `${value.slice(0, visibleStart)}***`;
  }

  return `${value.slice(0, visibleStart)}***${value.slice(-visibleEnd)}`;
};

const maskMongoUri = (value = "") => {
  if (!value) {
    return "(missing)";
  }

  try {
    const parsedUrl = new URL(value);
    const username = parsedUrl.username ? `${parsedUrl.username.slice(0, 3)}***` : "(missing)";
    const databaseName = parsedUrl.pathname.replace(/^\//, "") || "(default)";

    return `${parsedUrl.protocol}//${username}:***@${parsedUrl.host}/${databaseName}`;
  } catch {
    return maskValue(value, { visibleStart: 12, visibleEnd: 12 });
  }
};

export const getMaskedEnvDebugSnapshot = () => ({
  NODE_ENV: getNodeEnv(),
  PORT: String(getPort()),
  MONGODB_URI: maskMongoUri(getOptionalEnv("MONGODB_URI")),
  JWT_SECRET: maskValue(getOptionalEnv("JWT_SECRET"), {
    visibleStart: 3,
    visibleEnd: 3,
  }),
  COOKIE_SAME_SITE: getOptionalEnv("COOKIE_SAME_SITE", "(missing)"),
  CORS_ORIGINS: getOptionalEnv("CORS_ORIGINS", "(missing)"),
  CORS_ORIGIN_PATTERNS: getOptionalEnv("CORS_ORIGIN_PATTERNS", "(missing)"),
  ENABLE_SWAGGER: getOptionalEnv("ENABLE_SWAGGER", "(default:true)"),
  VERCEL: getOptionalEnv("VERCEL", "(missing)"),
});
