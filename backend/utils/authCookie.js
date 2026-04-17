const AUTH_COOKIE_NAME = "bbms_auth";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const parseCookies = (cookieHeader = "") => {
  return cookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((cookies, segment) => {
      const separatorIndex = segment.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = decodeURIComponent(segment.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(segment.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
};

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE_MS,
  path: "/",
});

export const getAuthCookieName = () => AUTH_COOKIE_NAME;

export const getTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const cookieToken = cookies[AUTH_COOKIE_NAME];

  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader = req.headers.authorization || "";
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1] || null;
};

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: undefined,
  });
};
