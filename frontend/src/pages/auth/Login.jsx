"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { buildApiUrl } from "../../config/app";
import DemoAccessPanel from "../../components/DemoAccessPanel";
import { cacheAuthSnapshot } from "../../utils/auth";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = buildApiUrl("/api/auth/login");
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      // Handle non-JSON responses (like 404 HTML pages)
      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else if (!res.ok) {
        // Server returned an error but not JSON
        data = { message: `Server error: ${res.status}` };
      }

      console.log("Login response:", data);

      if (!res.ok) {
        // 🔒 Handle facility waiting approval or rejected cases
        if (data.message?.includes("awaiting admin approval")) {
          setError(
            "Your account is awaiting admin approval. Please wait for confirmation.",
          );
          return;
        }
        if (data.message?.includes("rejected")) {
          setError("Your registration has been rejected by admin.");
          return;
        }

        throw new Error(data.message || "Login failed");
      }

      const role = data.user?.role || "unknown";
      cacheAuthSnapshot(data.user || null);
      window.dispatchEvent(new Event("bbms-auth-changed"));

      const targetPath =
        data.redirect ||
        (role === "donor"
          ? "/donor"
          : role === "hospital"
            ? "/hospital"
            : role === "blood-lab"
              ? "/lab"
              : role === "admin"
                ? "/admin"
                : "/");

      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),_transparent_30%),linear-gradient(180deg,#fff8f5_0%,#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_30px_90px_-45px_rgba(249,115,22,0.65)] backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
            <Sparkles className="h-4 w-4" />
            Recommended Path
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Try the live product before you type anything.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Fast Test is the quickest way to understand BBMS. Open a seeded
            workspace, inspect realistic data, and explore each role without
            creating or approving an account first.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700">
              No manual setup
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700">
              Realistic seeded flows
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700">
              Admin, donor, hospital, lab
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Most visitors should start with demo access
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Use manual login only if you already know which account you
                  need. Otherwise, the demo gets you to the interesting product
                  moments faster.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <DemoAccessPanel
              title="Open a demo workspace now"
              description="Choose a role and land directly inside a realistic BBMS flow. This is the fastest way to evaluate the product."
              variant="priority"
            />
          </div>

          <Link
            to="/fast-test"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 transition-colors hover:text-orange-800"
          >
            Open the dedicated Fast Test page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Manual Login
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Access your donor, hospital, or lab dashboard if you already have credentials.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <span className="mr-2">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register/donor"
              className="text-red-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
