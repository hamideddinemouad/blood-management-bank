const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const isBrowser = typeof window !== "undefined";

const isLocalHostname = (hostname = "") => {
  if (LOCAL_HOSTS.has(hostname)) {
    return true;
  }

  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
};

export const getApiBaseUrl = () => {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL || "").trim();

  if (!configuredBaseUrl || !isBrowser) {
    return configuredBaseUrl;
  }

  try {
    const currentOrigin = new URL(window.location.origin);
    const configuredOrigin = new URL(configuredBaseUrl, window.location.origin);

    if (configuredOrigin.origin === currentOrigin.origin) {
      return "";
    }

    if (
      !isLocalHostname(currentOrigin.hostname) &&
      isLocalHostname(configuredOrigin.hostname)
    ) {
      return "";
    }
  } catch {
    return configuredBaseUrl;
  }

  return configuredBaseUrl;
};

export const buildApiUrl = (path) => `${getApiBaseUrl()}${path}`;

export const websiteName = (import.meta.env.VITE_WEBSITE_NAME || "BBMS").trim();
