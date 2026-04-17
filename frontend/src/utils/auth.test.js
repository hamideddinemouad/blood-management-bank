import { beforeEach, describe, expect, it, vi } from "vitest";

const toast = {
  error: vi.fn(),
};

vi.mock("react-hot-toast", () => ({
  toast,
}));

describe("auth utils", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("recognizes demo email domains", async () => {
    const { isDemoEmail } = await import("./auth");

    expect(isDemoEmail("demo.admin@bbmsmaroc.com")).toBe(true);
    expect(isDemoEmail("person@example.com")).toBe(false);
  });

  it("caches and clears auth snapshots", async () => {
    const {
      cacheAuthSnapshot,
      clearCachedAuthSnapshot,
      getCachedAuthSnapshot,
    } = await import("./auth");

    cacheAuthSnapshot({
      _id: "abc123",
      role: "donor",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(getCachedAuthSnapshot()).toEqual({
      id: "abc123",
      role: "donor",
      name: null,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    });

    clearCachedAuthSnapshot();
    expect(getCachedAuthSnapshot()).toBeNull();
  });

  it("handles 401 responses once and redirects to login", async () => {
    const navigate = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: "Unauthorized" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { makeAuthenticatedRequest } = await import("./auth");

    await expect(
      makeAuthenticatedRequest("https://frontend.example.com/api/protected", {}, navigate),
    ).rejects.toThrow("Authentication failed");

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/login");
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("omits json content type for form data requests", async () => {
    const formData = new FormData();
    formData.append("avatar", "file");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { makeAuthenticatedRequest } = await import("./auth");

    await makeAuthenticatedRequest(
      "https://frontend.example.com/api/upload",
      {
        method: "POST",
        body: formData,
      },
      vi.fn(),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://frontend.example.com/api/upload",
      expect.objectContaining({
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }),
    );
  });

  it("fetches the current user from the hosted api profile endpoint", async () => {
    vi.stubEnv("VITE_API_URL", "https://blood-management-bank-api.vercel.app");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        user: {
          id: "u1",
          role: "donor",
          fullName: "Demo Donor",
          email: "demo.donor@bbmsmaroc.com",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchCurrentUser, getCachedAuthSnapshot } = await import("./auth");

    await expect(fetchCurrentUser()).resolves.toEqual({
      id: "u1",
      role: "donor",
      fullName: "Demo Donor",
      email: "demo.donor@bbmsmaroc.com",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://blood-management-bank-api.vercel.app/api/auth/profile",
      { credentials: "include" },
    );
    expect(getCachedAuthSnapshot()).toEqual({
      id: "u1",
      role: "donor",
      name: null,
      fullName: "Demo Donor",
      email: "demo.donor@bbmsmaroc.com",
    });
  });
});
