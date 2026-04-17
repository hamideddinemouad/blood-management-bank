import { toast } from "react-hot-toast";
import { buildApiUrl } from "../config/app";

const AUTH_CHANGE_EVENT = "bbms-auth-changed";
const AUTH_SNAPSHOT_KEY = "bbms-auth-snapshot";
const DEMO_EMAIL_DOMAINS = ["@bbmsmaroc.com", "@bbmsdemo.com"];

const isBrowser = () => typeof window !== "undefined";

export const isDemoEmail = (email = "") => {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_EMAIL_DOMAINS.some((domain) =>
    normalizedEmail.endsWith(domain),
  );
};

export const getCachedAuthSnapshot = () => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawSnapshot = window.sessionStorage.getItem(AUTH_SNAPSHOT_KEY);
    return rawSnapshot ? JSON.parse(rawSnapshot) : null;
  } catch (error) {
    console.error("Failed to read auth snapshot:", error);
    return null;
  }
};

export const cacheAuthSnapshot = (user) => {
  if (!isBrowser()) {
    return;
  }

  if (!user) {
    window.sessionStorage.removeItem(AUTH_SNAPSHOT_KEY);
    return;
  }

  const snapshot = {
    id: user.id || user._id || null,
    role: user.role || null,
    name: user.name || null,
    fullName: user.fullName || null,
    email: user.email || null,
  };

  window.sessionStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(snapshot));
};

export const clearCachedAuthSnapshot = () => {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_SNAPSHOT_KEY);
};

export const handleAuthError = (navigate) => {
  clearCachedAuthSnapshot();
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  toast.error("Authentication error: Session expired. Please login again.");
  navigate("/login");
};

export const makeAuthenticatedRequest = async (url, options = {}, navigate) => {
  const defaultHeaders = {
    Accept: "application/json",
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const requestOptions = {
    ...options,
    credentials: options.credentials ?? "include",
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.log('Authentication failed, clearing token');
        handleAuthError(navigate);
        const authError = new Error("Authentication failed");
        authError.authHandled = true;
        throw authError;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (
      !error.authHandled &&
      (error.message.includes("401") ||
        error.message.includes("unauthorized") ||
        error.message.includes("Authentication"))
    ) {
      handleAuthError(navigate);
    }
    throw error;
  }
};

export const isTokenValid = () => {
  return true;
};

export const fetchCurrentUser = async () => {
  const response = await fetch(buildApiUrl("/api/auth/profile"), {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearCachedAuthSnapshot();
      return null;
    }

    throw new Error(`Profile request failed with status ${response.status}`);
  }

  const data = await response.json();
  const user = data.user || null;
  cacheAuthSnapshot(user);
  return user;
};
