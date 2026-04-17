import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import DonorProfile from "./DonorProfile";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}));

const donorPayload = {
  _id: "donor-1",
  fullName: "Hosted Donor",
  email: "hosted.donor@bbmsmaroc.com",
  phone: "0612345678",
  bloodGroup: "A+",
  age: 30,
  gender: "male",
  weight: 75,
  address: {
    street: "1 Blood Way",
    city: "Rabat",
    state: "Rabat-Sale-Kenitra",
    pincode: "10000",
  },
  lastDonationDate: null,
  createdAt: "2025-01-01T00:00:00.000Z",
};

describe("DonorProfile", () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.put.mockReset();
    localStorage.setItem("token", "donor-token");
  });

  it("fetches donor profile from the hosted API origin", async () => {
    axios.get.mockResolvedValue({ data: { donor: donorPayload } });

    render(<DonorProfile />);

    expect(await screen.findByText("Hosted Donor")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://blood-management-bank-api.vercel.app/api/donor/profile",
        {
          withCredentials: true,
          headers: { Authorization: "Bearer donor-token" },
        },
      );
    });
  });
});
