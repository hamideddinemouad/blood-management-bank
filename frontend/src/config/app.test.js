import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApiUrl, getApiBaseUrl } from "./app";

describe("app config", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/fast-test");
  });

  it("uses the configured hosted API origin", () => {
    vi.stubEnv("VITE_API_URL", "https://blood-management-bank-api.vercel.app");

    expect(getApiBaseUrl()).toBe("https://blood-management-bank-api.vercel.app");
    expect(buildApiUrl("/api/donor/profile")).toBe(
      "https://blood-management-bank-api.vercel.app/api/donor/profile",
    );
  });

  it("drops same-origin API base urls", () => {
    vi.stubEnv("VITE_API_URL", "https://frontend.example.com");

    expect(getApiBaseUrl()).toBe("");
  });

  it("drops local api urls when the frontend is hosted", () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:5000");

    expect(getApiBaseUrl()).toBe("");
  });
});
