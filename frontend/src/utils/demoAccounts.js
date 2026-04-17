export const demoAccounts = {
  admin: {
    key: "admin",
    label: "Admin",
    email: "demo.admin@bbmsmaroc.com",
    password: "DemoPass123!",
    redirect: "/admin",
    description: "System oversight, approvals, donors, and facility management.",
  },
  donor: {
    key: "donor",
    label: "Donor",
    email: "demo.donor@bbmsmaroc.com",
    password: "DemoPass123!",
    redirect: "/donor",
    description: "Donation profile, eligibility, camps, and donation history.",
  },
  hospital: {
    key: "hospital",
    label: "Hospital",
    email: "demo.hospital@bbmsmaroc.com",
    password: "DemoPass123!",
    redirect: "/hospital",
    description: "Blood requests, hospital inventory, donor outreach, and history.",
  },
  "blood-lab": {
    key: "blood-lab",
    label: "Blood Lab",
    email: "demo.lab@bbmsmaroc.com",
    password: "DemoPass123!",
    redirect: "/lab",
    description: "Blood camps, stock management, donation records, and lab requests.",
  },
};

export const demoAccountList = [
  demoAccounts.admin,
  demoAccounts.donor,
  demoAccounts.hospital,
  demoAccounts["blood-lab"],
];
