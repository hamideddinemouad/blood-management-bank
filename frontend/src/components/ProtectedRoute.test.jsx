import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const { fetchCurrentUser, handleAuthError } = vi.hoisted(() => ({
  fetchCurrentUser: vi.fn(),
  handleAuthError: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  fetchCurrentUser,
  handleAuthError,
}));

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <h1>Protected Content</h1>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    fetchCurrentUser.mockReset();
    handleAuthError.mockReset();
  });

  it("renders children when the current user exists", async () => {
    fetchCurrentUser.mockResolvedValue({ id: "u1", role: "donor" });

    renderProtectedRoute();

    expect(
      await screen.findByRole("heading", { name: /protected content/i }),
    ).toBeInTheDocument();
    expect(handleAuthError).not.toHaveBeenCalled();
  });

  it("handles auth errors when the current user is missing", async () => {
    fetchCurrentUser.mockResolvedValue(null);

    renderProtectedRoute();

    await waitFor(() => {
      expect(handleAuthError).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.queryByRole("heading", { name: /protected content/i }),
    ).not.toBeInTheDocument();
  });
});
