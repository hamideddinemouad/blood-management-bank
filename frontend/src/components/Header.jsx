import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { buildApiUrl, websiteName } from "../config/app";
import { clearCachedAuthSnapshot, fetchCurrentUser, getCachedAuthSnapshot } from "../utils/auth";

const WEBSITE_NAME = websiteName;
const AUTH_CHANGE_EVENT = "bbms-auth-changed";

const roleConfig = {
  donor: {
    dashboardPath: "/donor",
    profilePath: "/donor/profile",
    label: "Donor",
  },
  hospital: {
    dashboardPath: "/hospital",
    profilePath: null,
    label: "Hospital",
  },
  "blood-lab": {
    dashboardPath: "/lab",
    profilePath: "/lab/profile",
    label: "Blood Lab",
  },
  admin: {
    dashboardPath: "/admin",
    profilePath: null,
    label: "Admin",
  },
  superadmin: {
    dashboardPath: "/admin",
    profilePath: null,
    label: "Admin",
  },
};

const getStoredRoleConfig = (role) => roleConfig[role] || null;
const getUserDisplayName = (user) =>
  user?.name || user?.fullName || user?.email?.split("@")[0] || "Account";

export default function Header({ currentUser }) {
  const cachedSnapshot = getCachedAuthSnapshot();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(currentUser || cachedSnapshot || null);
  const [authRole, setAuthRole] = useState(currentUser?.role || cachedSnapshot?.role || null);
  const [isAuthResolved, setIsAuthResolved] = useState(Boolean(currentUser || cachedSnapshot));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const clearAuthState = () => {
      if (cancelled) return;
      clearCachedAuthSnapshot();
      setAuthUser(currentUser || null);
      setAuthRole(currentUser?.role || null);
      setIsAuthResolved(true);
    };

    const syncAuthState = async () => {
      if (currentUser) {
        if (!cancelled) {
          setAuthUser(currentUser);
          setAuthRole(currentUser.role || null);
          setIsAuthResolved(true);
        }
        return;
      }

      if (!cancelled && !getCachedAuthSnapshot()) {
        setIsAuthResolved(false);
      }

      try {
        const user = await fetchCurrentUser();

        if (!user) {
          clearAuthState();
          return;
        }

        if (!cancelled) {
          setAuthUser(user);
          setAuthRole(user?.role || null);
          setIsAuthResolved(true);
        }
      } catch (error) {
        if (!cancelled) {
          clearAuthState();
        }
      }
    };

    syncAuthState();

    const handleAuthChange = () => {
      syncAuthState();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("focus", handleAuthChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("focus", handleAuthChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [currentUser, location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Fast Test", path: "/fast-test" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const resolvedRole = currentUser?.role || authRole;
  const resolvedUser = currentUser || authUser;
  const resolvedRoleConfig = getStoredRoleConfig(resolvedRole);
  const isAuthenticated = Boolean(resolvedRoleConfig && resolvedUser);
  const authLinks = !isAuthResolved
    ? []
    : isAuthenticated
    ? [
        {
          name: "Dashboard",
          path: resolvedRoleConfig.dashboardPath,
        },
        ...(resolvedRoleConfig.profilePath
          ? [{ name: "Profile", path: resolvedRoleConfig.profilePath }]
          : []),
      ]
    : [
        { name: "Login", path: "/login" },
        { name: "Register as Donor", path: "/register/donor" },
        { name: "Register as Facility", path: "/register/facility" },
      ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await fetch(buildApiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearCachedAuthSnapshot();
      setAuthUser(null);
      setAuthRole(null);
      setIsAuthResolved(true);
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      setMobileOpen(false);
      navigate("/login");
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo + Title */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-white"
              >
                <path d="M12 2C12 2 6 8 6 12a6 6 0 0012 0c0-4-6-10-6-10z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                {WEBSITE_NAME}
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5 font-medium">
                Blood Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "text-red-700 bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
                
              </Link>
            ))}
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {!isAuthResolved ? (
              <div className="hidden lg:flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 mr-1">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                <div className="space-y-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-2 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ) : isAuthenticated && (
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 mr-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                  {getUserDisplayName(resolvedUser).charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-gray-900">
                    {getUserDisplayName(resolvedUser)}
                  </p>
                  <p className="text-xs text-red-700">
                    {resolvedRoleConfig?.label || "Member"}
                  </p>
                </div>
              </div>
            )}
            
            {/* Auth Links */}
            {!isAuthResolved ? (
              <div className="flex items-center gap-2">
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            ) : (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      link.name.includes("Register")
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 hover:scale-105"
                        : isActiveLink(link.path)
                        ? "text-red-700 bg-red-50"
                        : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
              mobileOpen 
                ? "bg-red-50 text-red-600" 
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                mobileOpen ? "rotate-45" : "-translate-y-1.5"
              }`}></span>
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}></span>
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                mobileOpen ? "-rotate-45" : "translate-y-1.5"
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="border-t border-gray-200 pt-4 pb-6 px-3 bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-lg">
            {/* Main Navigation Links */}
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Auth Links */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {isAuthenticated && (
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                    {getUserDisplayName(resolvedUser).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {getUserDisplayName(resolvedUser)}
                    </p>
                    <p className="text-xs text-red-700">
                      {resolvedRoleConfig?.label || "Member"}
                    </p>
                  </div>
                </div>
              )}

              {authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    link.name.includes("Register")
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg text-center hover:shadow-xl"
                      : isActiveLink(link.path)
                      ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600 text-center"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-base font-medium text-red-700 transition-all duration-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
