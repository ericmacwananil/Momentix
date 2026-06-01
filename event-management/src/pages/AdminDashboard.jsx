// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchAllBookings = async () => {
      const start = Date.now();
      try {
        console.log(`👑 Fetching all bookings for admin: ${user.name}`);
        const res = await api.get("/bookings/all");
        console.log(`✅ All bookings fetched:`, res.data.data);
        setBookings(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        console.log("⚠️ Using fallback mock data...");
        // Fallback to mock data
        setBookings([
          {
            _id: "1",
            eventTitle: "Premium Birthday Balloon Decor",
            customerName: "Rahul Sharma",
            customerPhone: "9876543210",
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            venueAddress: "123 Main St, Anand",
            status: "pending",
            price: 4999,
            notes: "Extra decorations requested",
          },
          {
            _id: "2",
            eventTitle: "Royal Wedding Stage Decor",
            customerName: "Priya Singh",
            customerPhone: "9123456789",
            eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            venueAddress: "The Grand Palace, Vadodara",
            status: "confirmed",
            price: 49999,
            notes: "Royal theme confirmed",
          },
        ]);
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
        setLoading(false);
      }
    };
    if (user?._id) fetchAllBookings();
    // load team members (non-blocking)
    (async () => {
      try {
        const res = await api.get('/users/team-members');
        const names = (res.data && res.data.data) ? res.data.data.map(u => u.name) : [];
        setTeamMembers(names);
      } catch (e) {
        setTeamMembers([]);
      }
    })();
  }, [user]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const updateStatus = async (bookingId, newStatus) => {
    try {
      // Call backend to persist status change (if available)
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error("Failed to update status on server, updating locally:", err);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">👑 Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage all bookings and team assignments</p>

      {loading ? (
        <div className="text-center py-20">Loading bookings...</div>
      ) : (
      <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Pending", value: stats.pending, color: "bg-yellow-50 text-yellow-700" },
          { label: "Confirmed", value: stats.confirmed, color: "bg-green-50 text-green-700" },
          { label: "Completed", value: stats.completed, color: "bg-purple-50 text-purple-700" },
          { label: "Cancelled", value: stats.cancelled, color: "bg-red-50 text-red-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* All Bookings */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">All Bookings</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="font-bold text-gray-800">{booking.eventTitle}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-gray-600">👤 {booking.customerName} | 📞 {booking.customerPhone}</p>
                <p className="text-sm text-gray-500">📅 {booking.eventDate} | 📍 {booking.venueAddress}</p>
                <p className="text-sm font-bold text-orange-500 mt-1">₹{booking.price.toLocaleString()}</p>
                {booking.notes && <p className="text-xs text-gray-500 mt-2">📝 {booking.notes}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking._id, e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancelled Bookings */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cancelled Bookings</h2>
        <div className="space-y-4">
          {bookings.filter((booking) => booking.status === "cancelled").length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-gray-500">
              No cancelled bookings yet.
            </div>
          ) : (
            bookings
              .filter((booking) => booking.status === "cancelled")
              .map((booking) => (
                <div key={booking._id} className="bg-red-50 rounded-2xl border border-red-100 p-5">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-bold text-gray-800">{booking.eventTitle}</h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm text-gray-600">👤 {booking.customerName} | 📞 {booking.customerPhone}</p>
                      <p className="text-sm text-gray-500">📅 {booking.eventDate} | 📍 {booking.venueAddress}</p>
                      <p className="text-sm text-gray-500 mt-1">Cancelled by: {booking.cancelledBy || "customer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="font-bold text-lg text-red-500">₹{booking.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}