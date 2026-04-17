import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
const formatResponseTime = minutes => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "N/A";
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)} hrs`;
  }
  const days = hours / 24;
  return `${days.toFixed(days < 10 ? 1 : 0)} days`;
};
export const getLandingStats = async (_req, res) => {
  try {
    const [donors, inventorySummary, partnerHospitals, requestSummary] = await Promise.all([Donor.find({}, "donationHistory quantity").lean(), Blood.aggregate([{
      $group: {
        _id: null,
        totalUnits: {
          $sum: "$quantity"
        }
      }
    }]), Facility.countDocuments({
      facilityType: "hospital",
      status: "approved",
      isActive: true
    }), BloodRequest.aggregate([{
      $match: {
        status: {
          $in: ["accepted", "rejected"]
        },
        processedAt: {
          $exists: true,
          $ne: null
        }
      }
    }, {
      $project: {
        processingMinutes: {
          $divide: [{
            $subtract: ["$processedAt", "$createdAt"]
          }, 1000 * 60]
        }
      }
    }, {
      $group: {
        _id: null,
        averageMinutes: {
          $avg: "$processingMinutes"
        }
      }
    }])]);
    const totalDonatedUnits = donors.reduce((sum, donor) => sum + (donor.donationHistory || []).reduce((donationSum, donation) => donationSum + (donation.quantity || 1), 0), 0);
    const livesSaved = totalDonatedUnits * 3;
    const bloodUnits = inventorySummary[0]?.totalUnits || 0;
    const averageResponseMinutes = requestSummary[0]?.averageMinutes || null;
    res.status(200).json({
      success: true,
      stats: {
        livesSaved,
        bloodUnits,
        partnerHospitals,
        responseTime: formatResponseTime(averageResponseMinutes)
      }
    });
  } catch (error) {
    console.error("Landing stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load landing stats"
    });
  }
};
