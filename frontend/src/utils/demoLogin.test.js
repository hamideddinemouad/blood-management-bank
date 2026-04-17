import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginWithDemoRole } from "./demoLogin";

const { cacheAuthSnapshot, toast } = vi.hoisted(() => ({
  cacheAuthSnapshot: vi.fn(),
  toast: {
    success: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast,
}));

vi.mock("./auth", () => ({
  cacheAuthSnapshot,
}));

describe("loginWithDemoRole", () => {
  beforeEach(() => {
    cacheAuthSnapshot.mockReset();
    toast.success.mockReset();
  });

  it("posts the selected role to hosted demo access and navigates", async () => {
    const navigate = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: vi.fn().mockResolvedValue({
        user: {
          id: "admin-1",
          role: "admin",
          email: "demo.admin@bbmsmaroc.com",
        },
        redirect: "/admin",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await loginWithDemoRole("admin", navigate);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://blood-management-bank-api.vercel.app/api/auth/demo-access",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ roleKey: "admin" }),
      }),
    );
    expect(cacheAuthSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" }),
    );
    expect(toast.success).toHaveBeenCalledWith("Signed in as demo Admin");
    expect(navigate).toHaveBeenCalledWith("/admin", { replace: true });
  });

  it("rejects unknown demo roles before calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginWithDemoRole("manager", vi.fn())).rejects.toThrow(
      "Unknown demo role",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
