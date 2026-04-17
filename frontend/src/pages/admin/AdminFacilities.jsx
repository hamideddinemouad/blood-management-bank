import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { buildApiUrl } from "../../config/app";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import MobileShieldLoader from "../../components/MobileShieldLoader";

const FacilityApproval = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = buildApiUrl("/api/admin");

  // Fetch pending facilities
  const fetchPendingFacilities = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      console.log("🔄 Fetching facilities...");

      const res = await fetch(`${API_URL}/facilities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📨 Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Failed to fetch facilities: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Facilities data:", data);

      // Filter to show only pending facilities for approval
      const pendingFacilities =
        data.facilities?.filter((f) => f.status === "pending") || [];
      setFacilities(pendingFacilities);

      if (showToast) {
        toast.success(`Found ${pendingFacilities.length} pending facilities`);
      }
    } catch (error) {
      console.error("🚨 Fetch facilities error:", error);
      toast.error("Failed to load facilities. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingFacilities();
  }, []);

  const handleApprove = async (facilityId) => {
    if (!facilityId) {
      toast.error("Invalid facility ID");
      return;
    }

    setActionLoading(facilityId);
    console.log("✅ Approving facility:", facilityId);

    try {
      const res = await fetch(`${API_URL}/facility/approve/${facilityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("📨 Approval response:", data);

      if (res.ok && data.message) {
        toast.success("Facility approved successfully!");
        // Remove the approved facility from the list
        setFacilities((prev) => prev.filter((f) => f._id !== facilityId));
        setSelectedFacility(null);
      } else {
        throw new Error(data.message || "Approval failed");
      }
    } catch (error) {
      console.error("🚨 Approval error:", error);
      toast.error(error.message || "Error approving facility");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (facilityId) => {
    if (!facilityId) {
      toast.error("Invalid facility ID");
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(facilityId);
    console.log(
      "❌ Rejecting facility:",
      facilityId,
      "Reason:",
      rejectionReason,
    );

    try {
      const res = await fetch(`${API_URL}/facility/reject/${facilityId}`, {
        // 👇 FIX: Change method to PUT for status update
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await res.json();
      console.log("📨 Rejection response:", data);

      if (res.ok && data.message) {
        toast.success("Facility rejected successfully!");
        // Remove the rejected facility from the list
        setFacilities((prev) => prev.filter((f) => f._id !== facilityId));
        setSelectedFacility(null);
        setRejectionReason("");
      } else {
        throw new Error(data.message || "Rejection failed");
      }
    } catch (error) {
      console.error("🚨 Rejection error:", error);
      toast.error(error.message || "Error rejecting facility");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadDocument = (
    documentUrl,
    filename = "document",
    facility = null,
  ) => {
    if (!documentUrl) {
      toast.error("Document not available for download");
      return;
    }

    const isDemoDocument = documentUrl.includes("example.com");

    if (isDemoDocument && facility) {
      const proofContent = [
        "Blood Bank Management System",
        "Demo Registration Proof",
        "",
        `Facility Name: ${facility.name || "N/A"}`,
        `Facility Type: ${facility.facilityType || "N/A"}`,
        `Registration Number: ${facility.registrationNumber || "N/A"}`,
        `Email: ${facility.email || "N/A"}`,
        `Phone: ${facility.phone || "N/A"}`,
        `Emergency Contact: ${facility.emergencyContact || "N/A"}`,
        `Address: ${facility.address?.street || "N/A"}, ${facility.address?.city || "N/A"}, ${facility.address?.state || "N/A"} ${facility.address?.pincode || ""}`.trim(),
        "",
        "This is a seeded demo document generated locally for admin review.",
      ].join("\n");

      const blob = new Blob([proofContent], {
        type: "text/plain;charset=utf-8",
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeFilename = (filename || "registration-proof.txt").endsWith(".pdf")
        ? filename.replace(/\.pdf$/i, ".txt")
        : filename;

      link.href = objectUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.success("Demo registration proof downloaded");
      return;
    }

    console.log("💾 Downloading document:", documentUrl);
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending Review",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getFacilityTypeBadge = (type) => {
    const isHospital = type === "Hospital";
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
          isHospital
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : "bg-purple-100 text-purple-800 border-purple-200"
        }`}
      >
        <Building size={12} />
        {type || "Facility"}
      </span>
    );
  };

  const renderListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-block h-5 w-40 rounded-lg" />
              <div className="skeleton-block h-4 w-48 max-w-full rounded-lg" />
              <div className="skeleton-block h-4 w-32 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="skeleton-block h-6 w-24 rounded-full" />
              <div className="skeleton-block h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="space-y-3 pt-4">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3">
                <div className="skeleton-block h-4 w-4 rounded-full" />
                <div className="skeleton-block h-4 flex-1 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="skeleton-block h-10 w-32 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetailsSkeleton = () => (
    <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="skeleton-block h-7 w-48 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="skeleton-block h-4 w-24 rounded-lg" />
              <div className="skeleton-block h-11 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="skeleton-block h-28 rounded-2xl" />
        <div className="space-y-3 border-t border-gray-100 pt-6">
          <div className="skeleton-block h-11 rounded-xl" />
          <div className="skeleton-block h-24 rounded-2xl" />
          <div className="skeleton-block h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <MobileShieldLoader
          title="Loading Facility Verification"
          message="Preparing pending facility requests..."
        />
        <div className="hidden sm:block min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 page-enter">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="skeleton-block h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                      <div className="skeleton-block h-7 w-56 rounded-lg" />
                      <div className="skeleton-block h-4 w-96 max-w-full rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="skeleton-block h-11 w-28 rounded-xl" />
              </div>
              <div className="mt-6 rounded-3xl border border-red-100 p-5">
                <div className="flex items-center gap-4">
                  <div className="skeleton-block h-12 w-12 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="skeleton-block h-5 w-56 rounded-lg" />
                    <div className="skeleton-block h-4 w-80 max-w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {renderListSkeleton()}
              {renderDetailsSkeleton()}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800 sm:text-3xl">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                Facility Verification
              </h1>
              <p className="text-gray-600 mt-2">
                Review and verify hospital and blood lab registration requests
              </p>
            </div>

            <button
              onClick={() => fetchPendingFacilities(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-red-800 text-lg">
                  {facilities.length} Facility
                  {facilities.length !== 1 ? "s" : ""} Pending Verification
                </p>
                <p className="text-red-600 text-sm">
                  Facilities awaiting admin approval to access the system
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Facilities List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600" />
              Pending Requests ({facilities.length})
            </h2>

            {facilities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-red-100">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-gray-600">No pending facility requests</p>
                <p className="text-sm text-gray-500 mt-1">
                  All facilities have been processed and approved
                </p>
              </div>
            ) : (
              facilities.map((facility) => (
                <div
                  key={facility._id}
                  className={`soft-card cursor-pointer rounded-3xl border-2 p-6 shadow-lg ${
                    selectedFacility?._id === facility._id
                      ? "border-red-300 bg-red-50 shadow-xl"
                      : "border-red-100 bg-white hover:border-red-300 hover:shadow-xl"
                  }`}
                  onClick={() => {
                    console.log("🎯 Selecting facility:", facility._id);
                    setSelectedFacility(facility);
                  }}
                >
                  <div className="mb-4 border-b border-gray-100 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-start gap-3">
                          <h3 className="text-lg font-semibold leading-snug text-gray-900 break-words">
                            {facility.name}
                          </h3>
                          {getFacilityTypeBadge(facility.facilityType)}
                        </div>
                        <p className="flex items-start gap-2 text-sm text-gray-600">
                          <Mail size={14} className="mt-0.5 shrink-0" />
                          <span className="break-all font-medium text-gray-700">
                            {facility.email}
                          </span>
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{facility.phone || "No phone provided"}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(facility.status)}
                        {selectedFacility?._id === facility._id && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Reviewing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3 rounded-2xl bg-red-50/60 px-3 py-3">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="break-words leading-6 text-gray-700">
                        {facility.address?.street || "Address not provided"}
                        {facility.address?.city ? `, ${facility.address.city}` : ""}
                        {facility.address?.state ? `, ${facility.address.state}` : ""}
                        {facility.address?.pincode ? ` - ${facility.address.pincode}` : ""}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <p className="flex items-start gap-2 rounded-2xl bg-red-50/60 px-3 py-2">
                        <FileText size={14} className="mt-0.5 shrink-0" />
                        <span className="break-all leading-6 text-gray-700">
                          {facility.registrationNumber || "No registration"}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 rounded-2xl bg-red-50/60 px-3 py-2">
                        <Calendar size={14} />
                        <span>
                          {new Date(facility.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>

                    {facility.documents?.registrationProof && (
                      <div className="pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(
                              facility.documents.registrationProof.url,
                              facility.documents.registrationProof.filename,
                              facility,
                            );
                          }}
                          className="flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-200"
                        >
                          <Download size={14} />
                          Download document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Facility Details & Actions */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            {selectedFacility ? (
              <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-lg">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Building className="w-5 h-5 text-red-600" />
                  Review Facility
                </h2>

                {/* Facility Details */}
                <div className="space-y-6">
                  <div className="rounded-3xl border border-red-100 bg-red-50/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Selected request
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-gray-900">
                          {selectedFacility.name}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {selectedFacility.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getFacilityTypeBadge(selectedFacility.facilityType)}
                        {getStatusBadge(selectedFacility.status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Facility Name
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {selectedFacility.name}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      {getFacilityTypeBadge(selectedFacility.facilityType)}
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="break-all text-gray-900">
                        {selectedFacility.email}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedFacility.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Emergency Contact
                      </label>
                      <p className="text-gray-900">
                        {selectedFacility.emergencyContact || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Registration Number
                      </label>
                      <p className="font-mono text-gray-900">
                        {selectedFacility.registrationNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <p className="text-gray-900">
                      {selectedFacility.address?.street ||
                        "Street not provided"}
                      , {selectedFacility.address?.city}
                      <br />
                      {selectedFacility.address?.state} -{" "}
                      {selectedFacility.address?.pincode}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedFacility.facilityCategory || "Not specified"}
                    </p>
                  </div>

                  {selectedFacility.operatingHours && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Operating Hours
                      </label>
                      <p className="text-gray-900">
                        {selectedFacility.operatingHours.open} -{" "}
                        {selectedFacility.operatingHours.close}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedFacility.operatingHours.workingDays?.join(
                          ", ",
                        ) || "Not specified"}
                        {selectedFacility.is24x7 && " • 24/7 Service"}
                      </p>
                    </div>
                  )}

                  {selectedFacility.emergencyServices && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="flex items-center gap-2 font-semibold text-red-700">
                        <Shield size={16} />
                        Emergency Services Available
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                  <button
                    onClick={() => handleApprove(selectedFacility._id)}
                    disabled={actionLoading === selectedFacility._id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading === selectedFacility._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {actionLoading === selectedFacility._id
                      ? "Approving..."
                      : "Approve Facility"}
                  </button>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rejection Reason (required)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide specific reason for rejection. This will be communicated to the facility..."
                      className="w-full resize-none rounded-2xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      rows="3"
                    />
                    <button
                      onClick={() => handleReject(selectedFacility._id)}
                      disabled={
                        actionLoading === selectedFacility._id ||
                        !rejectionReason.trim()
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === selectedFacility._id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle size={20} />
                      )}
                      {actionLoading === selectedFacility._id
                        ? "Rejecting..."
                        : "Reject Facility"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-red-100 bg-white p-12 text-center shadow-lg">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Select a Facility
                </h3>
                <p className="text-gray-500">
                  Click on any facility from the list to review details and take
                  action
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityApproval;
