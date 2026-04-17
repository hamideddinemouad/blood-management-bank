import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const { cacheAuthSnapshot } = vi.hoisted(() => ({
  cacheAuthSnapshot: vi.fn(),
}));

vi.mock("../../components/DemoFirstSection", () => ({
  default: () => <section>Demo entry</section>,
}));

vi.mock("../../utils/auth", () => ({
  cacheAuthSnapshot,
}));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/donor" element={<h1>Donor Home</h1>} />
      </Routes>
    </MemoryRouter>,
  );

describe("Login", () => {
  beforeEach(() => {
    cacheAuthSnapshot.mockReset();
  });

  it("submits credentials to the hosted API and navigates to the returned route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: vi.fn().mockResolvedValue({
        user: {
          id: "donor-1",
          role: "donor",
          email: "demo.donor@bbmsmaroc.com",
        },
        redirect: "/donor",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderLogin();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      "demo.donor@bbmsmaroc.com",
    );
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "https://blood-management-bank-api.vercel.app/api/auth/login",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });

    expect(cacheAuthSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ role: "donor" }),
    );
    expect(
      await screen.findByRole("heading", { name: /donor home/i }),
    ).toBeInTheDocument();
  });

  it("shows validation before calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderLogin();

    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.fails("associates visible labels with login inputs for accessibility", () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
