import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardLayout from "./DashboardLayout";

const { fetchCurrentUser } = vi.hoisted(() => ({
  fetchCurrentUser: vi.fn(),
}));

vi.mock("../../utils/auth", async () => {
  const actual = await vi.importActual("../../utils/auth");

  return {
    ...actual,
    fetchCurrentUser,
  };
});

const renderDashboardLayout = () =>
  render(
    <MemoryRouter initialEntries={["/donor"]}>
      <Routes>
        <Route
          path="/donor"
          element={<DashboardLayout userRole="donor" />}
        >
          <Route index element={<h1>Dashboard Content</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("DashboardLayout", () => {
  beforeEach(() => {
    fetchCurrentUser.mockReset();
    fetchCurrentUser.mockResolvedValue({
      id: "donor-1",
      role: "donor",
      fullName: "Demo Donor",
      email: "demo.donor@bbmsmaroc.com",
    });
  });

  it("renders an explicit mobile header logout control", async () => {
    renderDashboardLayout();

    expect(
      await screen.findByRole("heading", { name: /dashboard content/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/logout/i)).toBeInTheDocument();
  });
});
