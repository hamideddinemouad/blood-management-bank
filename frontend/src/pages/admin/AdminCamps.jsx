import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  RefreshCw,
  Search,
  MapPin,
  Building2,
  Users,
  Clock,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL || ""}/api/admin`;

function AdminCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchCamps = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_URL}/camps`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch blood camps");
      }

      setCamps(data.camps || []);
      if (showToast) toast.success("Blood camps refreshed");
    } catch (error) {
      toast.error(error.message || "Failed to fetch blood camps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const filteredCamps = useMemo(() => {
    const term = search.trim().toLowerCase();

    return camps.filter((camp) => {
      const matchesSearch =
        !term ||
        [
          camp.title,
          camp.description,
          camp.location?.venue,
          camp.location?.city,
          camp.location?.state,
          camp.hospital?.name,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" || camp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [camps, search, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Blood Camps
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Blood Camps</h1>
              <p className="text-gray-600 mt-1">
                Monitor and review upcoming, live, and historical camp activity.
              </p>
            </div>

            <button
              onClick={() => fetchCamps(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Camps"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {["all", "Upcoming", "Ongoing", "Completed"].map((status) => {
              const count =
                status === "all"
                  ? camps.length
                  : camps.filter((camp) => camp.status === status).length;

              return (
                <div
                  key={status}
                  className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm"
                >
                  <div className="text-2xl font-bold text-gray-800">{count}</div>
                  <div className="text-sm text-gray-600">
                    {status === "all" ? "Total camps" : status}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, facility, city, or venue..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredCamps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 shadow-sm text-center text-gray-600">
            No camps match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCamps.map((camp) => (
              <div
                key={camp._id}
                className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {camp.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {camp.hospital?.name || "Unknown facility"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
                    {camp.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>{new Date(camp.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>
                      {camp.time?.start || "N/A"} - {camp.time?.end || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>
                      {camp.location?.venue}, {camp.location?.city},{" "}
                      {camp.location?.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-red-500" />
                    <span>
                      {camp.hospital?.facilityType === "blood-lab"
                        ? "Blood Lab Camp"
                        : "Hospital Camp"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-red-500" />
                    <span>
                      {camp.actualDonors || 0} actual / {camp.expectedDonors || 0} expected donors
                    </span>
                  </div>
                  {camp.description && (
                    <div className="pt-3 border-t border-gray-100 text-gray-600 italic">
                      {camp.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCamps;
