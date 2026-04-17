import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./components/layouts/AppShell", async () => {
  const { Outlet } = await vi.importActual("react-router-dom");

  return {
    default: () => (
      <div data-testid="app-shell">
        <Outlet />
      </div>
    ),
  };
});

vi.mock("./components/ProtectedRoute", () => ({
  default: ({ children }) => <div data-testid="protected-route">{children}</div>,
}));

vi.mock("./components/layouts/DashboardLayout", async () => {
  const { Outlet } = await vi.importActual("react-router-dom");

  return {
    default: ({ userRole }) => (
      <div data-testid={`dashboard-layout-${userRole}`}>
        <Outlet />
      </div>
    ),
  };
});

vi.mock("./pages/Landing", () => ({
  default: () => <h1>Landing Page</h1>,
}));
vi.mock("./pages/auth/Login", () => ({
  default: () => <h1>Login Page</h1>,
}));
vi.mock("./pages/auth/FacultyRegister", () => ({
  default: () => <h1>Facility Register Page</h1>,
}));
vi.mock("./pages/auth/DonorRegister", () => ({
  default: () => <h1>Donor Register Page</h1>,
}));
vi.mock("./components/about/About", () => ({
  default: () => <h1>About Page</h1>,
}));
vi.mock("./components/contact/Contact", () => ({
  default: () => <h1>Contact Page</h1>,
}));
vi.mock("./pages/FastTest", () => ({
  default: () => <h1>Fast Test Page</h1>,
}));
vi.mock("./pages/donor/DonorDashboard", () => ({
  default: () => <h1>Donor Dashboard Page</h1>,
}));
vi.mock("./pages/donor/DonorProfile", () => ({
  default: () => <h1>Donor Profile Page</h1>,
}));
vi.mock("./pages/donor/DonorCampsList", () => ({
  default: () => <h1>Donor Camps Page</h1>,
}));
vi.mock("./pages/donor/DonorDonationHistory", () => ({
  default: () => <h1>Donor History Page</h1>,
}));
vi.mock("./pages/hospital/HospitalDashboard", () => ({
  default: () => <h1>Hospital Dashboard Page</h1>,
}));
vi.mock("./pages/hospital/HospitalRequestBlood", () => ({
  default: () => <h1>Hospital Request Blood Page</h1>,
}));
vi.mock("./pages/hospital/HospitalRequestHistory", () => ({
  default: () => <h1>Hospital Request History Page</h1>,
}));
vi.mock("./pages/hospital/HospitalBloodStock", () => ({
  default: () => <h1>Hospital Blood Stock Page</h1>,
}));
vi.mock("./pages/hospital/DonorDirectory", () => ({
  default: () => <h1>Hospital Donor Directory Page</h1>,
}));
vi.mock("./pages/bloodlab/BloodlabDashboard", () => ({
  default: () => <h1>Lab Dashboard Page</h1>,
}));
vi.mock("./pages/bloodlab/BloodStock", () => ({
  default: () => <h1>Lab Blood Stock Page</h1>,
}));
vi.mock("./pages/bloodlab/BloodCamps", () => ({
  default: () => <h1>Lab Camps Page</h1>,
}));
vi.mock("./pages/bloodlab/LabProfile", () => ({
  default: () => <h1>Lab Profile Page</h1>,
}));
vi.mock("./pages/bloodlab/LabManageRequests", () => ({
  default: () => <h1>Lab Requests Page</h1>,
}));
vi.mock("./pages/bloodlab/BloodLabDonor", () => ({
  default: () => <h1>Lab Donor Page</h1>,
}));
vi.mock("./pages/admin/AdminDashboard", () => ({
  default: () => <h1>Admin Dashboard Page</h1>,
}));
vi.mock("./pages/admin/AdminFacilities", () => ({
  default: () => <h1>Admin Facilities Page</h1>,
}));
vi.mock("./pages/admin/GetAllDonors", () => ({
  default: () => <h1>Admin Donors Page</h1>,
}));
vi.mock("./pages/admin/GetAllFacilities", () => ({
  default: () => <h1>Admin All Facilities Page</h1>,
}));
vi.mock("./pages/admin/AdminDonations", () => ({
  default: () => <h1>Admin Donations Page</h1>,
}));
vi.mock("./pages/admin/AdminCamps", () => ({
  default: () => <h1>Admin Camps Page</h1>,
}));

const renderAt = (initialPath) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );

describe("App routes", () => {
  it.each([
    ["/", "Landing Page"],
    ["/login", "Login Page"],
    ["/register/donor", "Donor Register Page"],
    ["/register/facility", "Facility Register Page"],
    ["/about", "About Page"],
    ["/contact", "Contact Page"],
    ["/fast-test", "Fast Test Page"],
  ])("renders public route %s", (path, expectedText) => {
    renderAt(path);

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: expectedText })).toBeInTheDocument();
  });

  it.each([
    ["/donor", "dashboard-layout-donor", "Donor Dashboard Page"],
    ["/donor/profile", "dashboard-layout-donor", "Donor Profile Page"],
    ["/donor/camps", "dashboard-layout-donor", "Donor Camps Page"],
    ["/donor/history", "dashboard-layout-donor", "Donor History Page"],
    ["/hospital", "dashboard-layout-hospital", "Hospital Dashboard Page"],
    ["/hospital/blood-request-create", "dashboard-layout-hospital", "Hospital Request Blood Page"],
    ["/hospital/blood-request-history", "dashboard-layout-hospital", "Hospital Request History Page"],
    ["/hospital/inventory", "dashboard-layout-hospital", "Hospital Blood Stock Page"],
    ["/hospital/donors", "dashboard-layout-hospital", "Hospital Donor Directory Page"],
    ["/lab", "dashboard-layout-blood-lab", "Lab Dashboard Page"],
    ["/lab/inventory", "dashboard-layout-blood-lab", "Lab Blood Stock Page"],
    ["/lab/camps", "dashboard-layout-blood-lab", "Lab Camps Page"],
    ["/lab/profile", "dashboard-layout-blood-lab", "Lab Profile Page"],
    ["/lab/requests", "dashboard-layout-blood-lab", "Lab Requests Page"],
    ["/lab/donor", "dashboard-layout-blood-lab", "Lab Donor Page"],
    ["/admin", "dashboard-layout-admin", "Admin Dashboard Page"],
    ["/admin/verification", "dashboard-layout-admin", "Admin Facilities Page"],
    ["/admin/donors", "dashboard-layout-admin", "Admin Donors Page"],
    ["/admin/facilities", "dashboard-layout-admin", "Admin All Facilities Page"],
    ["/admin/donations", "dashboard-layout-admin", "Admin Donations Page"],
    ["/admin/camps", "dashboard-layout-admin", "Admin Camps Page"],
  ])("renders protected route %s", (path, layoutTestId, expectedText) => {
    renderAt(path);

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByTestId(layoutTestId)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: expectedText })).toBeInTheDocument();
  });
});
