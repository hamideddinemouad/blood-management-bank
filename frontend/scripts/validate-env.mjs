import dotenv from "dotenv";

dotenv.config();

const errors = [];

const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim() || "";

  if (!value) {
    errors.push(`${name} is required for frontend builds.`);
  }

  return value;
};

const apiUrl = getRequiredEnv("VITE_API_URL");
const websiteName = getRequiredEnv("VITE_WEBSITE_NAME");

if (apiUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    errors.push("VITE_API_URL must be a valid absolute URL.");
  }

  if (parsedUrl) {
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      errors.push("VITE_API_URL must use http or https.");
    }

    if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
      errors.push(
        "VITE_API_URL must be an origin only, with no path, query string, or hash.",
      );
    }

    if (
      parsedUrl.hostname.includes("-front.") ||
      parsedUrl.hostname.includes("frontend")
    ) {
      errors.push(
        "VITE_API_URL appears to point to a frontend deployment. It must point to the backend API deployment.",
      );
    }
  }
}

if (websiteName && !websiteName.trim()) {
  errors.push("VITE_WEBSITE_NAME must not be empty.");
}

if (errors.length > 0) {
  console.error("Frontend environment validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Frontend environment validation passed.");
