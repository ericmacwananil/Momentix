// src/pages/AdminEventsPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import AdminShell from "../components/AdminShell";
import Button from "../components/Button";

const activeStatuses = new Set(["pending", "confirmed", "assigned"]);
const cancelledStatuses = new Set(["cancelled"]);

export default function AdminEventsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("active");

  useEffect(() => {
    const fetchBookings = async () => {
      const start = Date.now();
      try {
        const res = await api.get("/bookings/all");
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("Failed to load admin bookings:", error);
        setBookings([]);
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
        setLoading(false);
      }
    };

    fetchBookings();
    // load team members
    const fetchTeam = async () => {
      try {
        const res = await api.get('/users/team-members');
        const members = (res.data && res.data.data) ? res.data.data : [];
        setTeamMembers(members);
      } catch (e) {
        console.warn('Could not load team members for events page', e.message);
        setTeamMembers([]);
      }
    };
    fetchTeam();
  }, []);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => activeStatuses.has(booking.status)),
    [bookings]
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => cancelledStatuses.has(booking.status)),
    [bookings]
  );

  const stats = {
    active: activeBookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    assigned: bookings.filter((booking) => booking.status === "assigned").length,
    cancelled: cancelledBookings.length,
  };

  const filterLabels = {
    active: "Active / Running Events",
    pending: "Pending Bookings",
    confirmed: "Confirmed Bookings",
    assigned: "Assigned Bookings",
    cancelled: "Cancelled Bookings",
  };

  const filteredBookings = useMemo(() => {
    if (selectedFilter === "active") return activeBookings;
    if (selectedFilter === "pending") return bookings.filter((booking) => booking.status === "pending");
    if (selectedFilter === "confirmed") return bookings.filter((booking) => booking.status === "confirmed");
    if (selectedFilter === "assigned") return bookings.filter((booking) => booking.status === "assigned");
    if (selectedFilter === "cancelled") return cancelledBookings;
    return activeBookings;
  }, [activeBookings, bookings, cancelledBookings, selectedFilter]);

  const updateBooking = async (bookingId, payload) => {
    try {
      if (payload && payload.assignedMember === "") payload.assignedMember = null;
      const res = await api.put(`/bookings/${bookingId}/status`, payload);
      const updated = res?.data?.data || { ...payload, _id: bookingId };
      setBookings((prev) => prev.map((booking) => (booking._id === bookingId ? updated : booking)));
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert("Failed to update booking. See console for details.");
    }
  };

  const setDraft = (bookingId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] || {}),
        [key]: value,
      },
    }));
  };

  const getDraft = (bookingId, key, fallback = "") => drafts[bookingId]?.[key] ?? fallback;

  const getAssignedMemberId = (booking) => {
    if (!booking?.assignedMember) return "";
    if (typeof booking.assignedMember === "object") return booking.assignedMember?._id || "";
    return booking.assignedMember;
  };

  const getAssignedMemberLabel = (booking) => {
    if (!booking?.assignedMember) return "";
    if (typeof booking.assignedMember === "object") return booking.assignedMember?.name || booking.assignedMember?._id || "";
    const member = teamMembers.find((item) => item._id === booking.assignedMember);
    return member?.name || booking.assignedMember;
  };

  return (
    <AdminShell
      title="Active / Running Events"
      subtitle="Review bookings that are active or running, then confirm, cancel, assign, and store remarks from one screen."
    >
      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading bookings...</div>
      ) : (
        <div className="space-y-8">
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {[
              { key: "active", label: "Active", value: stats.active, tone: "from-orange-500 to-amber-500" },
              { key: "pending", label: "Pending", value: stats.pending, tone: "from-slate-600 to-slate-700" },
              { key: "confirmed", label: "Confirmed", value: stats.confirmed, tone: "from-emerald-500 to-green-600" },
              { key: "assigned", label: "Assigned", value: stats.assigned, tone: "from-cyan-500 to-blue-600" },
              { key: "cancelled", label: "Cancelled", value: stats.cancelled, tone: "from-rose-500 to-red-600" },
            ].map((card) => (
              <button
                key={card.label}
                type="button"
                onClick={() => setSelectedFilter(card.key)}
                className={`rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 bg-gradient-to-br ${card.tone} shadow-lg text-left transition transform hover:scale-[1.02] border-2 ${
                  selectedFilter === card.key ? "border-white" : "border-transparent"
                }`}
              >
                <p className="text-white/80 text-xs sm:text-sm font-medium">{card.label}</p>
                <p className="text-white text-2xl sm:text-3xl font-bold mt-1">{card.value}</p>
              </button>
            ))}
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{filterLabels[selectedFilter] || "Bookings"}</h2>
                <p className="text-slate-300 text-sm mt-1">Click a summary card above to filter this list by status.</p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-14 text-slate-300 bg-black/20 rounded-3xl border border-white/10">
                  No bookings found for this status.
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const draft = drafts[booking._id] || {};
                  const selectedMember = draft.assignedMember ?? getAssignedMemberId(booking);
                  const remarks = draft.remarks ?? booking.remarks ?? "";
                  const assignedLabel = getAssignedMemberLabel(booking);
                  const showControls = selectedFilter !== "cancelled";

                  return (
                    <div key={booking._id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
                      <div className="flex flex-col lg:flex-row gap-5 lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg md:text-xl font-bold text-white">{booking.eventId?.title || booking.eventTitle || "Event booking"}</h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="text-slate-300 text-sm mt-2">👤 {booking.customerName} | 📞 {booking.customerPhone}</p>
                          <p className="text-slate-400 text-sm mt-1">📅 {new Date(booking.eventDate).toLocaleDateString()} | 📍 {booking.venueAddress}</p>
                          {assignedLabel && <p className="text-slate-300 text-sm mt-1">🧑 Assigned to: {assignedLabel}</p>}
                          <p className="text-orange-300 font-bold mt-2">₹{booking.price.toLocaleString()}</p>
                          {booking.notes && <p className="text-slate-400 text-sm mt-2">📝 {booking.notes}</p>}
                          {booking.remarks && <p className="text-slate-300 text-sm mt-2">💬 Remarks: {booking.remarks}</p>}
                          {booking.status === "cancelled" && (
                            <p className="text-rose-300 text-sm mt-2">This booking was cancelled by {booking.cancelledBy || "customer"}.</p>
                          )}
                        </div>

                        {showControls && (
                          <div className="w-full lg:w-[360px] space-y-3">
                            <select
                              value={booking.status}
                              onChange={(e) => setDraft(booking._id, "status", e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 border border-slate-200"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="assigned">Assigned</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                              value={selectedMember}
                              onChange={(e) => setDraft(booking._id, "assignedMember", e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 border border-slate-200"
                            >
                              <option value="">Allocate team member</option>
                              {teamMembers.map((member) => (
                                <option key={member._id} value={member._id}>{member.name}</option>
                              ))}
                            </select>

                            <textarea
                              rows={3}
                              value={remarks}
                              onChange={(e) => setDraft(booking._id, "remarks", e.target.value)}
                              placeholder="Add admin remarks for this booking..."
                              className="w-full textarea-unique px-4 py-3 text-slate-900"
                            />

                            <Button
                              onClick={() => updateBooking(booking._id, {
                                status: draft.status || booking.status,
                                assignedMember: selectedMember || null,
                                remarks,
                              })}
                              variant="primary"
                              size="full"
                              className="mt-2"
                            >Update Booking</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
