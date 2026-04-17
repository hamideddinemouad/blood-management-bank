import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DemoAccessPanel from "./DemoAccessPanel";

const { loginWithDemoRole } = vi.hoisted(() => ({
  loginWithDemoRole: vi.fn(),
}));

vi.mock("../utils/demoLogin", () => ({
  loginWithDemoRole,
}));

describe("DemoAccessPanel", () => {
  it("starts a demo login and shows loading feedback", async () => {
    let resolveLogin;
    loginWithDemoRole.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    render(
      <MemoryRouter>
        <DemoAccessPanel variant="priority" />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /demo as admin/i }));

    expect(loginWithDemoRole).toHaveBeenCalledWith("admin", expect.any(Function));
    expect(
      screen.getByText(/setting up the admin demo workspace/i),
    ).toBeInTheDocument();

    resolveLogin();

    await waitFor(() => {
      expect(
        screen.queryByText(/setting up the admin demo workspace/i),
      ).not.toBeInTheDocument();
    });
  });
});
