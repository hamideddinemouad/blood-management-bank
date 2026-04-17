import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { buildApiUrl } from "../../config/app";
import {
  Hospital,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  Briefcase,
  Shield,
  AlertTriangle,
  Building2,
  Power,
  PowerOff,
  RotateCcw,
} from "lucide-react";

const API_URL = buildApiUrl("/api/admin");

const FacilityPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 page-enter">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="skeleton-block h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="skeleton-block h-7 w-60 rounded-lg" />
              <div className="skeleton-block h-4 w-96 max-w-full rounded-lg" />
            </div>
          </div>
          <div className="skeleton-block h-11 w-36 rounded-xl" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-red-100 p-4">
              <div className="skeleton-block mx-auto h-8 w-14 rounded-lg" />
              <div className="skeleton-block mx-auto mt-3 h-4 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px_170px_170px_56px]">
          <div className="skeleton-block h-11 rounded-xl" />
          <div className="skeleton-block h-11 rounded-xl" />
          <div className="skeleton-block h-11 rounded-xl" />
          <div className="skeleton-block h-11 rounded-xl" />
          <div className="skeleton-block h-11 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-block h-5 w-32 rounded-lg" />
                <div className="skeleton-block h-4 w-40 max-w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="skeleton-block h-6 w-24 rounded-full" />
                <div className="skeleton-block h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 6 }).map((__, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-3">
                  <div className="skeleton-block h-4 w-4 rounded-full" />
                  <div className="skeleton-block h-4 flex-1 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4">
              <div className="skeleton-block h-10 rounded-xl" />
              <div className="skeleton-block h-10 rounded-xl" />
              <div className="skeleton-block h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function GetAllFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    facilityType: "all",
    status: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  const token = localStorage.getItem("token");

  const updateFacilityState = (updatedFacility) => {
    setFacilities((prev) =>
      prev.map((facility) =>
        facility._id === updatedFacility._id ? updatedFacility : facility,
      ),
    );
  };

  const handleFacilityReviewStatus = async (facility, status) => {
    try {
      let rejectionReason = "";

      if (status === "rejected") {
        rejectionReason = window.prompt(
          `Why are you rejecting ${facility.name}?`,
          facility.rejectionReason || "",
        );

        if (!rejectionReason || !rejectionReason.trim()) {
          toast.error("A rejection reason is required.");
          return;
        }
      }

      const res = await fetch(
        `${API_URL}/facilities/${facility._id}/review-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, rejectionReason }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update facility status");
      }

      updateFacilityState(data.facility);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to update facility status");
    }
  };

  const handleFacilityAccountToggle = async (facility) => {
    try {
      const res = await fetch(
        `${API_URL}/facilities/${facility._id}/account-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !facility.isActive }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update facility account");
      }

      updateFacilityState(data.facility);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to update facility account");
    }
  };

  // Facility status and types for filters
  const facilityTypes = ["hospital", "blood-lab"];
  const statuses = ["pending", "approved", "rejected"];

  // Fetch Facilities Function
  const fetchAllFacilities = async (showToast = false) => {
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
      setFacilities(data.facilities || []);

      if (showToast) {
        toast.success(`Loaded ${data.facilities?.length || 0} facilities`);
      }
    } catch (error) {
      console.error("🚨 Fetch facilities error:", error);
      toast.error(error.message || "Failed to load facility data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllFacilities();
  }, []);

  // Filter and sort facilities
  const filteredFacilities = facilities
    .filter((facility) => {
      const matchesSearch =
        !filters.search ||
        facility.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.registrationNumber
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        facility.phone?.includes(filters.search);

      const matchesType =
        filters.facilityType === "all" ||
        facility.facilityType === filters.facilityType;

      const matchesStatus =
        filters.status === "all" || facility.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name?.toLowerCase();
          bValue = b.name?.toLowerCase();
          break;
        case "status":
          aValue = a.status?.toLowerCase();
          bValue = b.status?.toLowerCase();
          break;
        case "type":
          aValue = a.facilityType?.toLowerCase();
          bValue = b.facilityType?.toLowerCase();
          break;
        default:
          aValue = a.name?.toLowerCase();
          bValue = b.name?.toLowerCase();
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  // Helper to get the status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle size={12} />,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle size={12} />,
        label: "Rejected",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock size={12} />,
        label: "Pending Review",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeDisplay = type
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    const isHospital = type === "hospital";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${
          isHospital
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-purple-50 text-purple-700 border-purple-200"
        }`}
      >
        <Building2 size={10} />
        {typeDisplay}
      </span>
    );
  };

  if (loading) {
    return <FacilityPageSkeleton />;
  }

  // Count for stats card
  const approvedCount = facilities.filter(
    (f) => f.status === "approved",
  ).length;
  const pendingCount = facilities.filter((f) => f.status === "pending").length;
  const rejectedCount = facilities.filter(
    (f) => f.status === "rejected",
  ).length;
  const hospitalCount = facilities.filter(
    (f) => f.facilityType === "hospital",
  ).length;
  const labCount = facilities.filter(
    (f) => f.facilityType === "blood-lab",
  ).length;
  const activeFacilityCount = facilities.filter((f) => f.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <Hospital className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                  Medical Facilities
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and view all registered hospitals and blood
                  laboratories
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchAllFacilities(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {facilities.length}
                </div>
                <div className="text-sm text-gray-600">Total Facilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {approvedCount}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {rejectedCount}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {hospitalCount}H {labCount}L
                </div>
                <div className="text-sm text-gray-600">Hospitals & Labs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">
                  {activeFacilityCount}
                </div>
                <div className="text-sm text-gray-600">Active Accounts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search facilities by name, email, or registration number..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <select
              value={filters.facilityType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  facilityType: e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Types</option>
              {facilityTypes.map((type) => (
                <option key={type} value={type}>
                  {type
                    .split("-")
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(" ")}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="type">Sort by Type</option>
            </select>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {filters.sortOrder === "asc" ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredFacilities.length}</span>{" "}
            of <span className="font-semibold">{facilities.length}</span>{" "}
            facilities
          </p>
          {filters.search && (
            <p className="text-sm text-red-600">
              Filtered by: "{filters.search}"
            </p>
          )}
        </div>

        {/* Alert for pending facilities */}
        {pendingCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">
                  {pendingCount} Facility Approval
                  {pendingCount !== 1 ? "s" : ""} Pending
                </p>
                <p className="text-amber-700 text-sm">
                  {pendingCount} medical facility{pendingCount !== 1 ? "s" : ""}{" "}
                  awaiting administrative review and approval
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Facility Grid */}
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-red-100">
            <Hospital className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {facilities.length === 0
                ? "No Facilities Found"
                : "No Matching Facilities"}
            </h3>
            <p className="text-gray-600">
              {facilities.length === 0
                ? "The medical facility database is currently empty."
                : "No facilities match your current search criteria."}
            </p>
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="mt-4 text-red-600 hover:text-red-700 underline transition-colors"
              >
                Clear search filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFacilities.map((facility) => (
              <div
                key={facility._id}
                className="soft-card group rounded-3xl border border-red-100 bg-white p-6 shadow-lg hover:shadow-xl"
              >
                {/* Header with Name and Badges */}
                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <h3 className="text-lg font-bold leading-snug text-gray-800 break-words transition-colors group-hover:text-red-600">
                        {facility.name}
                      </h3>
                      <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 break-all">
                        {facility.email || "No email provided"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(facility.status)}
                      {getTypeBadge(facility.facilityType)}
                    </div>
                  </div>
                </div>

                {/* Facility Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="break-all font-medium leading-6 text-gray-700">
                        {facility.registrationNumber || "No registration"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="break-words leading-6 text-gray-700">
                        {facility.phone || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="break-words capitalize leading-6 text-gray-700">
                        {facility.facilityCategory || "General"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Clock
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          facility.is24x7 ? "text-green-500" : "text-gray-500"
                        }`}
                      />
                      <span className="break-words font-medium leading-6 text-gray-700">
                        {facility.is24x7
                          ? "24/7 Service"
                          : `${facility.operatingHours?.open || "N/A"} - ${facility.operatingHours?.close || "N/A"}`}
                      </span>
                    </div>
                  </div>

                  {facility.emergencyServices && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm">
                      <Shield className="h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="font-medium text-red-700">
                        Emergency services available
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-3 py-3 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    <div className="break-words leading-6 text-gray-700">
                      {facility.address?.street &&
                        `${facility.address.street}, `}
                      {facility.address?.city || "City not provided"}
                      {facility.address?.state ? `, ${facility.address.state}` : ""}
                      {facility.address?.pincode
                        ? ` - ${facility.address.pincode}`
                        : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    {facility.isActive ? (
                      <Power className="h-4 w-4 flex-shrink-0 text-green-500" />
                    ) : (
                      <PowerOff className="h-4 w-4 flex-shrink-0 text-slate-500" />
                    )}
                    <span className="text-gray-700">
                      Account {facility.isActive ? "active" : "suspended"}
                    </span>
                  </div>

                  {facility.rejectionReason && facility.status === "rejected" && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                      <span className="font-semibold">Rejection note:</span>{" "}
                      {facility.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4">
                  {facility.status !== "approved" && (
                    <button
                      onClick={() => handleFacilityReviewStatus(facility, "approved")}
                      className="w-full rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Facility
                    </button>
                  )}

                  {facility.status !== "pending" && (
                    <button
                      onClick={() => handleFacilityReviewStatus(facility, "pending")}
                      className="w-full rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Send Back To Review
                    </button>
                  )}

                  {facility.status !== "rejected" && (
                    <button
                      onClick={() => handleFacilityReviewStatus(facility, "rejected")}
                      className="w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Facility
                    </button>
                  )}

                  <button
                    onClick={() => handleFacilityAccountToggle(facility)}
                    className={`w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      facility.isActive
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {facility.isActive ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                    {facility.isActive ? "Suspend Access" : "Reactivate Access"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GetAllFacilities;
