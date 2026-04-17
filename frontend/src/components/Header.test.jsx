import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

const { clearCachedAuthSnapshot, fetchCurrentUser, getCachedAuthSnapshot } = vi.hoisted(() => ({
  clearCachedAuthSnapshot: vi.fn(),
  fetchCurrentUser: vi.fn(),
  getCachedAuthSnapshot: vi.fn(),
}));

vi.mock("../utils/auth", async () => {
  const actual = await vi.importActual("../utils/auth");

  return {
    ...actual,
    clearCachedAuthSnapshot,
    fetchCurrentUser,
    getCachedAuthSnapshot,
  };
});

const renderHeader = (initialPath = "/") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/about" element={<h1>About Page</h1>} />
        <Route path="/contact" element={<h1>Contact Page</h1>} />
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route path="/register/donor" element={<h1>Donor Register Page</h1>} />
        <Route path="/register/facility" element={<h1>Facility Register Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    clearCachedAuthSnapshot.mockReset();
    fetchCurrentUser.mockReset();
    getCachedAuthSnapshot.mockReset();
    getCachedAuthSnapshot.mockReturnValue(null);
    fetchCurrentUser.mockResolvedValue(null);
  });

  it("keeps logged-out desktop auth links stable across route changes", async () => {
    const user = userEvent.setup();

    renderHeader();

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: "Login" })).toHaveLength(2);
    });
    expect(fetchCurrentUser).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByRole("link", { name: "About" })[0]);

    expect(screen.getByRole("heading", { name: "About Page" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Login" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Register as Donor" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Register as Facility" })).toHaveLength(2);
    expect(fetchCurrentUser).toHaveBeenCalledTimes(1);
  });
});
