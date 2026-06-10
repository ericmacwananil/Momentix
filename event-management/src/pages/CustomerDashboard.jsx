// In CustomerDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import sleep from "../utils/sleep";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      const start = Date.now();
      try {
        console.log(`📱 Fetching bookings for user: ${user.name} (ID: ${user._id})`);
        const res = await api.post("/bookings/my-bookings", { userId: user._id });
        console.log(`✅ Bookings fetched:`, res.data.data);
        setBookings(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        console.log("⚠️ Using fallback mock data...");
        // Fallback to mock data if API fails
        setBookings([
          {
            _id: "1",
            eventId: { title: "Premium Birthday Balloon Decor" },
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            venueAddress: "123 Main St, Anand",
            status: "confirmed",
            price: 4999,
            customerName: user.name,
          },
        ]);
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await sleep(1000 - elapsed);
        setLoading(false);
      }
    };
    if (user?._id) fetchMyBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`, {
        userId: user._id,
        role: user.role,
      });

      const updatedBooking = res.data.data;
      setBookings((current) =>
        current.map((booking) => (booking._id === bookingId ? updatedBooking : booking))
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert(err?.response?.data?.message || "Failed to cancel booking. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 sm:py-20 text-sm sm:text-base text-gray-600">
        Loading your bookings...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">✨ Welcome, {user.name}!</h1>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Manage your event bookings here</p>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-8 sm:py-10 text-gray-500">
            <p className="text-base sm:text-lg font-medium">No bookings yet</p>
            <p className="text-xs sm:text-sm mt-1">Browse events and create your first booking!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const eventTitle = booking?.eventId?.title || "Event";
              const price = booking?.price || 0;
              return (
              <div key={booking._id} className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 hover:bg-gray-50 transition">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">{eventTitle}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">📅 {new Date(booking.eventDate).toLocaleDateString()}</p>
                  <p className="text-xs sm:text-sm text-gray-500">📍 {booking.venueAddress}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="font-bold text-base sm:text-lg text-orange-500">₹{price.toLocaleString()}</p>
                  </div>
                  <div className="block sm:hidden">
                    <p className="font-bold text-base text-orange-500">₹{price.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <Button
                      onClick={() => handleCancelBooking(booking._id)}
                      variant="danger"
                      size="md"
                      className="text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}