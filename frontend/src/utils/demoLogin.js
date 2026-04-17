import { toast } from "react-hot-toast";
import { demoAccounts } from "./demoAccounts";
import { cacheAuthSnapshot } from "./auth";
import { buildApiUrl } from "./api";

export async function loginWithDemoRole(roleKey, navigate) {
  const account = demoAccounts[roleKey];

  if (!account) {
    throw new Error("Unknown demo role");
  }

  const apiUrl = buildApiUrl("/api/auth/demo-access");
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roleKey,
    }),
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { message: `Server error: ${res.status}` };

  if (!res.ok) {
    throw new Error(data.message || "Demo login failed");
  }

  const role = data.user?.role || roleKey;
  cacheAuthSnapshot(data.user || null);
  window.dispatchEvent(new Event("bbms-auth-changed"));

  toast.success(`Signed in as demo ${account.label}`);
  navigate(data.redirect || account.redirect, { replace: true });
}
