import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import DonorDashboard from "./DonorDashboard";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const donorPayload = {
  _id: "donor-1",
  fullName: "Demo Donor",
  email: "demo.donor@bbmsmaroc.com",
  phone: "0612345678",
  bloodGroup: "O+",
  age: 30,
  weight: 70,
  address: {
    city: "Casablanca",
    state: "Casablanca-Settat",
  },
  eligibleToDonate: true,
  lastDonationDate: null,
  createdAt: "2025-01-01T00:00:00.000Z",
};

const donationHistory = [
  {
    _id: "donation-1",
    facility: "Central Blood Lab",
    donationDate: "2026-01-10T00:00:00.000Z",
    bloodGroup: "O+",
    quantity: 1,
  },
];

const mockDashboardRequests = (profileData) => {
  axios.get.mockImplementation((url) => {
    if (url.endsWith("/profile")) {
      return Promise.resolve({ data: profileData });
    }

    if (url.endsWith("/history")) {
      return Promise.resolve({ data: { history: donationHistory } });
    }

    if (url.endsWith("/stats")) {
      return Promise.resolve({ data: { totalDonations: 1 } });
    }

    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DonorDashboard />
    </MemoryRouter>,
  );

describe("DonorDashboard", () => {
  beforeEach(() => {
    axios.get.mockReset();
    localStorage.setItem("token", "test-token");
  });

  it("renders dashboard data from nested donor profile payloads", async () => {
    mockDashboardRequests({ donor: donorPayload });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: /donor dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("demo.donor@bbmsmaroc.com")).toBeInTheDocument();
    expect(screen.getByText("Central Blood Lab")).toBeInTheDocument();
    expect(screen.getAllByText("1")).not.toHaveLength(0);
  });

  it("renders dashboard data from direct donor profile payloads", async () => {
    mockDashboardRequests(donorPayload);

    renderDashboard();

    expect(await screen.findByText("demo.donor@bbmsmaroc.com")).toBeInTheDocument();
    expect(screen.getByText("O+")).toBeInTheDocument();
  });

  it("sends donor dashboard requests with bearer auth", async () => {
    mockDashboardRequests({ donor: donorPayload });

    renderDashboard();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://blood-management-bank-api.vercel.app/api/donor/profile",
        { headers: { Authorization: "Bearer test-token" } },
      );
    });
  });
});
