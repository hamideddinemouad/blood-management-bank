import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import Admin from "../models/adminModel.js";
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
let mongod;
let app;
const signToken = user => jwt.sign({
  id: user._id,
  role: user.role
}, process.env.JWT_SECRET, {
  expiresIn: "1h"
});
const authHeader = token => ({
  Authorization: `Bearer ${token}`
});
const createBaseFixtures = async () => {
  const admin = await Admin.create({
    name: "Admin User",
    email: "admin@test.com",
    password: "AdminPass123!",
    role: "admin"
  });
  const donor = await Donor.create({
    fullName: "Donor User",
    email: "donor@test.com",
    password: "DonorPass123!",
    phone: "0612345678",
    bloodGroup: "O+",
    age: 30,
    gender: "Male",
    weight: 72,
    address: {
      street: "1 Main St",
      city: "Casablanca",
      state: "Casablanca-Settat",
      pincode: "200001"
    }
  });
  const hospital = await Facility.create({
    name: "Hospital One",
    email: "hospital@test.com",
    password: "HospitalPass123!",
    phone: "0611111111",
    emergencyContact: "0622222222",
    address: {
      street: "2 Clinic Rd",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      pincode: "100001"
    },
    registrationNumber: "HOSP-001",
    facilityType: "hospital",
    status: "approved",
    documents: {
      registrationProof: {
        url: "https://example.com/hospital.pdf",
        filename: "hospital.pdf"
      }
    }
  });
  const lab = await Facility.create({
    name: "Lab One",
    email: "lab@test.com",
    password: "LabPass123!",
    phone: "0633333333",
    emergencyContact: "0644444444",
    address: {
      street: "3 Lab Rd",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      pincode: "100002"
    },
    registrationNumber: "LAB-001",
    facilityType: "blood-lab",
    status: "approved",
    documents: {
      registrationProof: {
        url: "https://example.com/lab.pdf",
        filename: "lab.pdf"
      }
    }
  });
  const pendingHospital = await Facility.create({
    name: "Pending Hospital",
    email: "pending-hospital@test.com",
    password: "PendingPass123!",
    phone: "0655555555",
    emergencyContact: "0666666666",
    address: {
      street: "4 Pending Rd",
      city: "Marrakech",
      state: "Marrakech-Safi",
      pincode: "400001"
    },
    registrationNumber: "HOSP-002",
    facilityType: "hospital",
    status: "pending",
    documents: {
      registrationProof: {
        url: "https://example.com/pending.pdf",
        filename: "pending.pdf"
      }
    }
  });
  const camp = await BloodCamp.create({
    hospital: lab._id,
    title: "City Donation Camp",
    description: "Community blood drive",
    date: new Date(Date.now() + 86400000),
    time: {
      start: "09:00",
      end: "15:00"
    },
    location: {
      venue: "Community Hall",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      pincode: "100003"
    },
    expectedDonors: 10,
    status: "Upcoming"
  });
  await Blood.create({
    bloodGroup: "O+",
    quantity: 5,
    expiryDate: new Date(Date.now() + 10 * 86400000),
    bloodLab: lab._id
  });
  const pendingRequest = await BloodRequest.create({
    hospitalId: hospital._id,
    labId: lab._id,
    bloodType: "O+",
    units: 2
  });
  return {
    admin,
    donor,
    hospital,
    lab,
    pendingHospital,
    camp,
    pendingRequest,
    tokens: {
      admin: signToken(admin),
      donor: signToken(donor),
      hospital: signToken(hospital),
      lab: signToken(lab),
      pendingHospital: signToken(pendingHospital)
    }
  };
};
test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
});
test.after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});
test.beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});
test("public and auth endpoints respond", async () => {
  const fixtures = await createBaseFixtures();
  const root = await request(app).get("/");
  assert.equal(root.status, 302);
  assert.equal(root.headers.location, "/api/doc");
  const docsPage = await request(app).get("/api/doc");
  assert.equal(docsPage.status, 200);
  assert.match(docsPage.text, /SwaggerUIBundle/);
  assert.match(docsPage.text, /\/api\/doc\.json/);
  const landingStats = await request(app).get("/api/public/landing-stats");
  assert.equal(landingStats.status, 200);
  assert.equal(landingStats.body.success, true);
  const docs = await request(app).get("/api/doc.json");
  assert.equal(docs.status, 200);
  assert.ok(docs.body.paths["/api/admin/dashboard"]);
  const login = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "AdminPass123!"
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, "admin");
  assert.ok(login.headers["set-cookie"]?.some(cookie => cookie.startsWith("bbms_auth=")));
  const cookieAgent = request.agent(app);
  const cookieProfile = await cookieAgent.post("/api/auth/login").send({
    email: "admin@test.com",
    password: "AdminPass123!"
  });
  assert.equal(cookieProfile.status, 200);
  const profileViaCookie = await cookieAgent.get("/api/auth/profile");
  assert.equal(profileViaCookie.status, 200);
  const logout = await cookieAgent.post("/api/auth/logout");
  assert.equal(logout.status, 200);
  const profileAfterLogout = await cookieAgent.get("/api/auth/profile");
  assert.equal(profileAfterLogout.status, 401);
  const profile = await request(app).get("/api/auth/profile").set(authHeader(fixtures.tokens.admin));
  assert.equal(profile.status, 200);
  const invalidDemo = await request(app).post("/api/auth/demo-access").send({
    roleKey: "bad-role"
  });
  assert.equal(invalidDemo.status, 400);
});
test("admin endpoints are restricted to admins and still work", async () => {
  const fixtures = await createBaseFixtures();
  const donorBlocked = await request(app).get("/api/admin/dashboard").set(authHeader(fixtures.tokens.donor));
  assert.equal(donorBlocked.status, 403);
  const dashboard = await request(app).get("/api/admin/dashboard").set(authHeader(fixtures.tokens.admin));
  assert.equal(dashboard.status, 200);
  const facilities = await request(app).get("/api/admin/facilities").set(authHeader(fixtures.tokens.admin));
  assert.equal(facilities.status, 200);
  const approve = await request(app).put(`/api/admin/facility/approve/${fixtures.pendingHospital._id}`).set(authHeader(fixtures.tokens.admin));
  assert.equal(approve.status, 200);
  const reject = await request(app).put(`/api/admin/facility/reject/${fixtures.pendingHospital._id}`).set(authHeader(fixtures.tokens.admin)).send({
    rejectionReason: "Missing records"
  });
  assert.equal(reject.status, 200);
  const donors = await request(app).get("/api/admin/donors").set(authHeader(fixtures.tokens.admin));
  assert.equal(donors.status, 200);
  const donations = await request(app).get("/api/admin/donations").set(authHeader(fixtures.tokens.admin));
  assert.equal(donations.status, 200);
  const camps = await request(app).get("/api/admin/camps").set(authHeader(fixtures.tokens.admin));
  assert.equal(camps.status, 200);
  const donorEligibility = await request(app).patch(`/api/admin/donors/${fixtures.donor._id}/eligibility`).set(authHeader(fixtures.tokens.admin)).send({
    eligibleToDonate: false
  });
  assert.equal(donorEligibility.status, 200);
  const donorAccount = await request(app).patch(`/api/admin/donors/${fixtures.donor._id}/account-status`).set(authHeader(fixtures.tokens.admin)).send({
    isActive: true
  });
  assert.equal(donorAccount.status, 200);
  const facilityReview = await request(app).patch(`/api/admin/facilities/${fixtures.lab._id}/review-status`).set(authHeader(fixtures.tokens.admin)).send({
    status: "approved"
  });
  assert.equal(facilityReview.status, 200);
  const facilityAccount = await request(app).patch(`/api/admin/facilities/${fixtures.lab._id}/account-status`).set(authHeader(fixtures.tokens.admin)).send({
    isActive: true
  });
  assert.equal(facilityAccount.status, 200);
});
test("donor endpoints work for an active donor token", async () => {
  const fixtures = await createBaseFixtures();
  const donorProfile = await request(app).get("/api/donor/profile").set(authHeader(fixtures.tokens.donor));
  assert.equal(donorProfile.status, 200);
  const donorStats = await request(app).get("/api/donor/stats").set(authHeader(fixtures.tokens.donor));
  assert.equal(donorStats.status, 200);
  const camps = await request(app).get("/api/donor/camps").set(authHeader(fixtures.tokens.donor));
  assert.equal(camps.status, 200);
  const register = await request(app).post(`/api/donor/camps/${fixtures.camp._id}/register`).set(authHeader(fixtures.tokens.donor));
  assert.equal(register.status, 200);
  const history = await request(app).get("/api/donor/history").set(authHeader(fixtures.tokens.donor));
  assert.equal(history.status, 200);
  const update = await request(app).put("/api/donor/profile").set(authHeader(fixtures.tokens.donor)).send({
    fullName: "Updated Donor User"
  });
  assert.equal(update.status, 200);
  const unregister = await request(app).delete(`/api/donor/camps/${fixtures.camp._id}/register`).set(authHeader(fixtures.tokens.donor));
  assert.equal(unregister.status, 200);
});
test("facility, hospital, and blood-lab endpoints still work", async () => {
  const fixtures = await createBaseFixtures();
  const blockedPending = await request(app).get("/api/hospital/dashboard").set(authHeader(fixtures.tokens.pendingHospital));
  assert.equal(blockedPending.status, 403);
  const facilityProfile = await request(app).get("/api/facility/profile").set(authHeader(fixtures.tokens.hospital));
  assert.equal(facilityProfile.status, 200);
  const facilityDashboard = await request(app).get("/api/facility/dashboard").set(authHeader(fixtures.tokens.hospital));
  assert.equal(facilityDashboard.status, 200);
  const facilityUpdate = await request(app).put("/api/facility/profile").set(authHeader(fixtures.tokens.hospital)).send({
    name: "Hospital Updated"
  });
  assert.equal(facilityUpdate.status, 200);
  const facilityLabs = await request(app).get("/api/facility/labs").set(authHeader(fixtures.tokens.hospital));
  assert.equal(facilityLabs.status, 200);
  const hospitalDashboard = await request(app).get("/api/hospital/dashboard").set(authHeader(fixtures.tokens.hospital));
  assert.equal(hospitalDashboard.status, 200);
  const hospitalStock = await request(app).get("/api/hospital/blood/stock").set(authHeader(fixtures.tokens.hospital));
  assert.equal(hospitalStock.status, 200);
  const hospitalHistory = await request(app).get("/api/hospital/history").set(authHeader(fixtures.tokens.hospital));
  assert.equal(hospitalHistory.status, 200);
  const hospitalDonors = await request(app).get("/api/hospital/donors").set(authHeader(fixtures.tokens.hospital));
  assert.equal(hospitalDonors.status, 200);
  const hospitalContact = await request(app).post(`/api/hospital/donors/${fixtures.donor._id}/contact`).set(authHeader(fixtures.tokens.hospital)).send({
    note: "Called donor"
  });
  assert.equal(hospitalContact.status, 200);
  const hospitalRequest = await request(app).post("/api/hospital/blood/request").set(authHeader(fixtures.tokens.hospital)).send({
    labId: fixtures.lab._id.toString(),
    bloodType: "O+",
    units: 1
  });
  assert.equal(hospitalRequest.status, 201);
  const hospitalRequests = await request(app).get("/api/hospital/blood/requests").set(authHeader(fixtures.tokens.hospital));
  assert.equal(hospitalRequests.status, 200);
  const labDashboard = await request(app).get("/api/blood-lab/dashboard").set(authHeader(fixtures.tokens.lab));
  assert.equal(labDashboard.status, 200);
  const labHistory = await request(app).get("/api/blood-lab/history").set(authHeader(fixtures.tokens.lab));
  assert.equal(labHistory.status, 200);
  const createCamp = await request(app).post("/api/blood-lab/camps").set(authHeader(fixtures.tokens.lab)).send({
    title: "Second Camp",
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    time: {
      start: "10:00",
      end: "16:00"
    },
    location: {
      venue: "Town Hall",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra"
    },
    expectedDonors: 25
  });
  assert.equal(createCamp.status, 201);
  const createdCampId = createCamp.body.data._id;
  const labCamps = await request(app).get("/api/blood-lab/camps").set(authHeader(fixtures.tokens.lab));
  assert.equal(labCamps.status, 200);
  const updateCamp = await request(app).put(`/api/blood-lab/camps/${createdCampId}`).set(authHeader(fixtures.tokens.lab)).send({
    description: "Updated description"
  });
  assert.equal(updateCamp.status, 200);
  const updateCampStatus = await request(app).patch(`/api/blood-lab/camps/${createdCampId}/status`).set(authHeader(fixtures.tokens.lab)).send({
    status: "Ongoing"
  });
  assert.equal(updateCampStatus.status, 200);
  const addStock = await request(app).post("/api/blood-lab/blood/add").set(authHeader(fixtures.tokens.lab)).send({
    bloodType: "A+",
    quantity: 3
  });
  assert.equal(addStock.status, 200);
  const removeStock = await request(app).post("/api/blood-lab/blood/remove").set(authHeader(fixtures.tokens.lab)).send({
    bloodType: "A+",
    quantity: 1
  });
  assert.equal(removeStock.status, 200);
  const bloodStock = await request(app).get("/api/blood-lab/blood/stock").set(authHeader(fixtures.tokens.lab));
  assert.equal(bloodStock.status, 200);
  const requestList = await request(app).get("/api/blood-lab/blood/requests").set(authHeader(fixtures.tokens.lab));
  assert.equal(requestList.status, 200);
  const processRequest = await request(app).put(`/api/blood-lab/blood/requests/${fixtures.pendingRequest._id}`).set(authHeader(fixtures.tokens.lab)).send({
    action: "accept"
  });
  assert.equal(processRequest.status, 200);
  const labs = await request(app).get("/api/blood-lab/labs").set(authHeader(fixtures.tokens.lab));
  assert.equal(labs.status, 200);
  const donorSearch = await request(app).get("/api/blood-lab/donors/search").query({
    term: "donor"
  }).set(authHeader(fixtures.tokens.lab));
  assert.equal(donorSearch.status, 200);
  const markDonation = await request(app).post(`/api/blood-lab/donors/donate/${fixtures.donor._id}`).set(authHeader(fixtures.tokens.lab)).send({
    quantity: 1,
    remarks: "Healthy donor"
  });
  assert.equal(markDonation.status, 200);
  const recentDonations = await request(app).get("/api/blood-lab/donations/recent").set(authHeader(fixtures.tokens.lab));
  assert.equal(recentDonations.status, 200);
  const deleteCamp = await request(app).delete(`/api/blood-lab/camps/${createdCampId}`).set(authHeader(fixtures.tokens.lab));
  assert.equal(deleteCamp.status, 200);
});
