import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { buildApiUrl } from "../../config/app";
import {
  Droplet,
  RefreshCw,
  Search,
  Calendar,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";

const API_URL = buildApiUrl("/api/admin");

function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchDonations = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_URL}/donations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch donation records");
      }

      setDonations(data.donations || []);
      if (showToast) toast.success("Donation records refreshed");
    } catch (error) {
      toast.error(error.message || "Failed to fetch donation records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return donations;

    return donations.filter((donation) =>
      [
        donation.donorName,
        donation.donorEmail,
        donation.facility,
        donation.city,
        donation.state,
        donation.bloodGroup,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [donations, search]);

  const totalUnits = filteredDonations.reduce(
    (sum, donation) => sum + (donation.quantity || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Droplet className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Donation Records
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
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                Donation History
              </h1>
              <p className="text-gray-600 mt-1">
                View all donation records, analytics, and verification signals.
              </p>
            </div>

            <button
              onClick={() => fetchDonations(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Records"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
              <div className="text-2xl font-bold text-gray-800">
                {filteredDonations.length}
              </div>
              <div className="text-sm text-gray-600">Donation entries</div>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{totalUnits}</div>
              <div className="text-sm text-gray-600">Units recorded</div>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {filteredDonations.filter((d) => d.verified).length}
              </div>
              <div className="text-sm text-gray-600">Verified donations</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donor, facility, city, or blood group..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 shadow-sm text-center text-gray-600">
            No donation records match the current search.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredDonations.map((donation) => (
              <div
                key={donation._id}
                className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {donation.donorName}
                    </h3>
                    <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
                    {donation.bloodGroup}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>
                      {new Date(donation.donationDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-red-500" />
                    <span>
                      {donation.facility}
                      {donation.city ? `, ${donation.city}` : ""}
                      {donation.state ? `, ${donation.state}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-red-500" />
                    <span>{donation.quantity} unit(s) recorded</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                    <span>{donation.verified ? "Verified" : "Awaiting verification"}</span>
                  </div>
                  {donation.remarks && (
                    <div className="pt-3 border-t border-gray-100 text-gray-600 italic">
                      {donation.remarks}
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

export default AdminDonations;
