import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { buildApiUrl } from "../../config/app";
import {
  User,
  Heart,
  Calendar,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Weight,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldOff,
  Power,
  PowerOff,
} from "lucide-react";

const API_URL = buildApiUrl("/api/admin");

const DonorPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 page-enter">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="skeleton-block h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="skeleton-block h-7 w-52 rounded-lg" />
              <div className="skeleton-block h-4 w-80 max-w-full rounded-lg" />
            </div>
          </div>
          <div className="skeleton-block h-11 w-36 rounded-xl" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-red-100 p-4">
              <div className="skeleton-block mx-auto h-8 w-14 rounded-lg" />
              <div className="skeleton-block mx-auto mt-3 h-4 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_56px]">
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
                <div className="skeleton-block h-6 w-14 rounded-full" />
              </div>
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((__, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-3">
                  <div className="skeleton-block h-4 w-4 rounded-full" />
                  <div className="skeleton-block h-4 flex-1 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4">
              <div className="skeleton-block h-10 rounded-xl" />
              <div className="skeleton-block h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function GetAllDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    bloodGroup: "all",
    eligibility: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  const token = localStorage.getItem("token");

  const updateDonorState = (updatedDonor) => {
    setDonors((prev) =>
      prev.map((donor) => (donor._id === updatedDonor._id ? updatedDonor : donor)),
    );
  };

  const handleEligibilityToggle = async (donor) => {
    try {
      const res = await fetch(`${API_URL}/donors/${donor._id}/eligibility`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eligibleToDonate: !donor.eligibleToDonate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update donor eligibility");
      }

      updateDonorState(data.donor);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to update donor eligibility");
    }
  };

  const handleAccountToggle = async (donor) => {
    try {
      const res = await fetch(`${API_URL}/donors/${donor._id}/account-status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !donor.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update donor account");
      }

      updateDonorState(data.donor);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to update donor account");
    }
  };

  // Blood groups for filter
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch Donors Function
  const fetchAllDonors = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      console.log("🔄 Fetching donors...");

      const res = await fetch(`${API_URL}/donors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📨 Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Failed to fetch donors: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Donors data:", data);
      setDonors(data.donors || []);

      if (showToast) {
        toast.success(`Loaded ${data.donors?.length || 0} donors`);
      }
    } catch (error) {
      console.error("🚨 Fetch donors error:", error);
      toast.error(error.message || "Failed to load donor data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllDonors();
  }, []);

  // Filter and sort donors
  const filteredDonors = donors
    .filter((donor) => {
      const matchesSearch =
        !filters.search ||
        donor.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        donor.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        donor.phone?.includes(filters.search);

      const matchesBloodGroup =
        filters.bloodGroup === "all" || donor.bloodGroup === filters.bloodGroup;

      const matchesEligibility =
        filters.eligibility === "all" ||
        (filters.eligibility === "eligible" && donor.eligibleToDonate) ||
        (filters.eligibility === "ineligible" && !donor.eligibleToDonate);

      return matchesSearch && matchesBloodGroup && matchesEligibility;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = a.fullName?.toLowerCase();
          bValue = b.fullName?.toLowerCase();
          break;
        case "donations":
          aValue = a.donationHistory?.length || 0;
          bValue = b.donationHistory?.length || 0;
          break;
        case "age":
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        default:
          aValue = a.fullName?.toLowerCase();
          bValue = b.fullName?.toLowerCase();
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  // Helper to use the schema field: eligibleToDonate
  const getEligibilityBadge = (isEligible) => {
    if (isEligible === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
          <Clock size={12} /> Unknown
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
          isEligible
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-red-100 text-red-800 border-red-200"
        }`}
      >
        {isEligible ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {isEligible ? "Eligible" : "Ineligible"}
      </span>
    );
  };

  const getBloodGroupBadge = (bloodGroup) => {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
        {bloodGroup || "Unknown"}
      </span>
    );
  };

  if (loading) {
    return <DonorPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                  Blood Donors
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and view all registered blood donors in the system
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchAllDonors(true)}
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
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {donors.length}
                </div>
                <div className="text-sm text-gray-600">Total Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {donors.filter((d) => d.eligibleToDonate).length}
                </div>
                <div className="text-sm text-gray-600">Eligible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {donors.filter((d) => !d.eligibleToDonate).length}
                </div>
                <div className="text-sm text-gray-600">Ineligible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {donors.filter((d) => d.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {donors.reduce(
                    (sum, donor) => sum + (donor.donationHistory?.length || 0),
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Donations</div>
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
                  placeholder="Search donors by name, email, or phone..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <select
              value={filters.bloodGroup}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, bloodGroup: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Blood Types</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <select
              value={filters.eligibility}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, eligibility: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="eligible">Eligible Only</option>
              <option value="ineligible">Ineligible Only</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="name">Sort by Name</option>
              <option value="donations">Sort by Donations</option>
              <option value="age">Sort by Age</option>
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
            Showing {filteredDonors.length} of {donors.length} donors
          </p>
          {filters.search && (
            <p className="text-sm text-red-600">
              Filtered by: "{filters.search}"
            </p>
          )}
        </div>

        {/* Donor Grid */}
        {filteredDonors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-red-100">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {donors.length === 0 ? "No Donors Found" : "No Matching Donors"}
            </h3>
            <p className="text-gray-600">
              {donors.length === 0
                ? "The blood donor database is currently empty."
                : "No donors match your current filters."}
            </p>
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="mt-4 text-red-600 hover:text-red-700 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDonors.map((donor) => (
              <div
                key={donor._id}
                className="soft-card group rounded-3xl border border-red-100 bg-white p-6 shadow-lg hover:shadow-xl"
              >
                {/* Header with Name and Badges */}
                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-lg font-bold text-gray-800 transition-colors group-hover:text-red-600">
                        {donor.fullName}
                      </h3>
                      <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 break-all">
                        {donor.email || "No email provided"}
                      </p>
                    </div>
                    {getBloodGroupBadge(donor.bloodGroup)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {getEligibilityBadge(donor.eligibleToDonate)}
                  </div>
                </div>

                {/* Donor Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Phone className="h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="truncate text-gray-700">
                        {donor.phone || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="text-gray-700">
                        {donor.age || "N/A"} years old
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Weight className="h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="text-gray-700">
                        {donor.weight || "N/A"} kg
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-red-50/60 px-3 py-2 text-sm">
                      <Heart className="h-4 w-4 flex-shrink-0 text-red-500" />
                      <span className="text-gray-700">
                        {donor.donationHistory?.length || 0} donation
                        {(donor.donationHistory?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    {donor.isActive ? (
                      <Power className="h-4 w-4 flex-shrink-0 text-green-500" />
                    ) : (
                      <PowerOff className="h-4 w-4 flex-shrink-0 text-slate-500" />
                    )}
                    <span className="text-gray-700">
                      Account {donor.isActive ? "active" : "suspended"}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-3 py-3 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    <div className="line-clamp-2 text-gray-700">
                      {donor.address?.street && `${donor.address.street}, `}
                      {donor.address?.city || "City not provided"}
                      {donor.address?.state ? `, ${donor.address.state}` : ""}
                      {donor.address?.pincode ? ` - ${donor.address.pincode}` : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleEligibilityToggle(donor)}
                    className={`w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      donor.eligibleToDonate
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {donor.eligibleToDonate ? (
                      <ShieldOff className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {donor.eligibleToDonate
                      ? "Mark Ineligible"
                      : "Restore Eligibility"}
                  </button>

                  <button
                    onClick={() => handleAccountToggle(donor)}
                    className={`w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      donor.isActive
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {donor.isActive ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                    {donor.isActive ? "Suspend Account" : "Reactivate Account"}
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

export default GetAllDonors;
