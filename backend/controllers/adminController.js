import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import BloodCamp from "../models/bloodCampModel.js";
const appendFacilityHistory = (facility, description, eventType = "Verification") => {
  facility.history = facility.history || [];
  facility.history.unshift({
    eventType,
    description,
    date: new Date()
  });
};
export const getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalFacilities = await Facility.countDocuments();
    const pendingFacilities = await Facility.countDocuments({
      status: "pending"
    });
    const approvedFacilities = await Facility.countDocuments({
      status: "approved"
    });
    const donors = await Donor.find({}, "donationHistory");
    const totalDonations = donors.reduce((sum, donor) => sum + (donor.donationHistory?.length || 0), 0);
    const activeDonors = await Donor.countDocuments({
      eligibleToDonate: true
    });
    res.status(200).json({
      totalDonors,
      totalFacilities,
      approvedFacilities,
      pendingFacilities,
      totalDonations,
      activeDonors,
      upcomingCamps: 3
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({
      message: "Failed to fetch stats"
    });
  }
};
export const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().select("-password");
    res.status(200).json({
      donors
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching donors"
    });
  }
};
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.status(200).json({
      facilities
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching facilities"
    });
  }
};
export const getAllDonationRecords = async (req, res) => {
  try {
    const donors = await Donor.find().populate("donationHistory.facility", "name address.city address.state").select("fullName email bloodGroup donationHistory");
    const donations = donors.flatMap(donor => (donor.donationHistory || []).map(entry => ({
      _id: entry._id,
      donorId: donor._id,
      donorName: donor.fullName,
      donorEmail: donor.email,
      donorBloodGroup: donor.bloodGroup,
      donationDate: entry.donationDate,
      bloodGroup: entry.bloodGroup,
      quantity: entry.quantity,
      remarks: entry.remarks,
      verified: entry.verified,
      facility: entry.facility?.name || "Unknown facility",
      city: entry.facility?.address?.city || "",
      state: entry.facility?.address?.state || ""
    }))).sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
    res.status(200).json({
      donations
    });
  } catch (err) {
    console.error("Admin donation records error:", err);
    res.status(500).json({
      message: "Error fetching donation records"
    });
  }
};
export const getAllCampRecords = async (req, res) => {
  try {
    const camps = await BloodCamp.find().populate("hospital", "name facilityType status").sort({
      date: 1,
      createdAt: -1
    });
    res.status(200).json({
      camps
    });
  } catch (err) {
    console.error("Admin camp records error:", err);
    res.status(500).json({
      message: "Error fetching blood camps"
    });
  }
};
export const approveFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({
      message: "Facility not found"
    });
    facility.status = "approved";
    facility.rejectionReason = "";
    facility.approvedAt = new Date();
    facility.approvedBy = req.user.id;
    appendFacilityHistory(facility, `Facility approved by admin on ${new Date().toLocaleDateString("en-GB")}.`);
    await facility.save();
    res.status(200).json({
      message: "Facility approved",
      facility
    });
  } catch (err) {
    console.error("Facility Approval Error:", err);
    res.status(500).json({
      message: "Error approving facility"
    });
  }
};
export const rejectFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({
      message: "Facility not found"
    });
    const {
      rejectionReason
    } = req.body;
    if (!rejectionReason) return res.status(400).json({
      message: "Rejection reason is required."
    });
    facility.status = "rejected";
    facility.rejectionReason = rejectionReason;
    facility.approvedAt = undefined;
    facility.approvedBy = undefined;
    appendFacilityHistory(facility, `Facility rejected by admin. Reason: ${rejectionReason}`);
    await facility.save();
    res.status(200).json({
      message: "Facility rejected and status updated",
      facility
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error rejecting facility"
    });
  }
};
export const updateDonorEligibility = async (req, res) => {
  try {
    const {
      eligibleToDonate
    } = req.body;
    if (typeof eligibleToDonate !== "boolean") {
      return res.status(400).json({
        message: "eligibleToDonate must be a boolean value"
      });
    }
    const donor = await Donor.findByIdAndUpdate(req.params.id, {
      eligibleToDonate
    }, {
      new: true,
      runValidators: true
    }).select("-password");
    if (!donor) return res.status(404).json({
      message: "Donor not found"
    });
    res.status(200).json({
      message: `Donor marked as ${eligibleToDonate ? "eligible" : "ineligible"}`,
      donor
    });
  } catch (err) {
    console.error("Donor eligibility update error:", err);
    res.status(500).json({
      message: "Failed to update donor eligibility"
    });
  }
};
export const updateDonorAccountStatus = async (req, res) => {
  try {
    const {
      isActive
    } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean value"
      });
    }
    const donor = await Donor.findByIdAndUpdate(req.params.id, {
      isActive
    }, {
      new: true,
      runValidators: true
    }).select("-password");
    if (!donor) return res.status(404).json({
      message: "Donor not found"
    });
    res.status(200).json({
      message: `Donor account ${isActive ? "activated" : "suspended"}`,
      donor
    });
  } catch (err) {
    console.error("Donor account status update error:", err);
    res.status(500).json({
      message: "Failed to update donor account status"
    });
  }
};
export const updateFacilityReviewStatus = async (req, res) => {
  try {
    const {
      status,
      rejectionReason = ""
    } = req.body;
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }
    if (status === "rejected" && !rejectionReason.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required."
      });
    }
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({
      message: "Facility not found"
    });
    facility.status = status;
    if (status === "approved") {
      facility.rejectionReason = "";
      facility.approvedAt = new Date();
      facility.approvedBy = req.user.id;
      appendFacilityHistory(facility, `Facility approved by admin on ${new Date().toLocaleDateString("en-GB")}.`);
    }
    if (status === "pending") {
      facility.rejectionReason = "";
      facility.approvedAt = undefined;
      facility.approvedBy = undefined;
      appendFacilityHistory(facility, "Facility moved back to pending review by admin.");
    }
    if (status === "rejected") {
      facility.rejectionReason = rejectionReason.trim();
      facility.approvedAt = undefined;
      facility.approvedBy = undefined;
      appendFacilityHistory(facility, `Facility rejected by admin. Reason: ${rejectionReason.trim()}`);
    }
    await facility.save();
    res.status(200).json({
      message: `Facility status updated to ${status}`,
      facility
    });
  } catch (err) {
    console.error("Facility review status update error:", err);
    res.status(500).json({
      message: "Failed to update facility review status"
    });
  }
};
export const updateFacilityAccountStatus = async (req, res) => {
  try {
    const {
      isActive
    } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean value"
      });
    }
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({
      message: "Facility not found"
    });
    facility.isActive = isActive;
    appendFacilityHistory(facility, `Facility account ${isActive ? "activated" : "suspended"} by admin.`);
    await facility.save();
    res.status(200).json({
      message: `Facility account ${isActive ? "activated" : "suspended"}`,
      facility
    });
  } catch (err) {
    console.error("Facility account status update error:", err);
    res.status(500).json({
      message: "Failed to update facility account status"
    });
  }
};
