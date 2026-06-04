// src/pages/AdminEventsPage.jsx
// FIXED: status select now binds to draft value (not live booking.status)
// ADDED: "Completed by team" highlight badge when team marks a task done

import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import AdminShell from "../components/AdminShell";
import Button from "../components/Button";

const activeStatuses    = new Set(["pending", "confirmed", "assigned"]);
const cancelledStatuses = new Set(["cancelled"]);

export default function AdminEventsPage() {
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [teamMembers,   setTeamMembers]   = useState([]);
  const [drafts,        setDrafts]        = useState({});
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
        if (elapsed < 1000) await new Promise((r) => setTimeout(r, 1000 - elapsed));
        setLoading(false);
      }
    };

    const fetchTeam = async () => {
      try {
        const res = await api.get("/users/team-members");
        setTeamMembers((res.data?.data) || []);
      } catch (e) {
        console.warn("Could not load team members", e.message);
      }
    };

    fetchBookings();
    fetchTeam();
  }, []);

  // ── Derived lists ─────────────────────────────────────────────────────────
  const activeBookings    = useMemo(() => bookings.filter((b) => activeStatuses.has(b.status)), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => cancelledStatuses.has(b.status)), [bookings]);
  // "Completed by team" = bookings the team marked done, waiting for admin to confirm
  const teamCompletedBookings = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);

  const stats = {
    active:    activeBookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    assigned:  bookings.filter((b) => b.status === "assigned").length,
    completed: teamCompletedBookings.length,
    cancelled: cancelledBookings.length,
  };

  const filterLabels = {
    active:    "Active / Running Events",
    pending:   "Pending Bookings",
    confirmed: "Confirmed Bookings",
    assigned:  "Assigned Bookings",
    completed: "Completed by Team ✅",
    cancelled: "Cancelled Bookings",
  };

  const filteredBookings = useMemo(() => {
    switch (selectedFilter) {
      case "active":    return activeBookings;
      case "pending":   return bookings.filter((b) => b.status === "pending");
      case "confirmed": return bookings.filter((b) => b.status === "confirmed");
      case "assigned":  return bookings.filter((b) => b.status === "assigned");
      case "completed": return teamCompletedBookings;
      case "cancelled": return cancelledBookings;
      default:          return activeBookings;
    }
  }, [bookings, activeBookings, cancelledBookings, teamCompletedBookings, selectedFilter]);

  // ── Draft helpers ─────────────────────────────────────────────────────────
  const setDraft = (bookingId, key, value) =>
    setDrafts((prev) => ({ ...prev, [bookingId]: { ...(prev[bookingId] || {}), [key]: value } }));

  const getDraft = (bookingId, key, fallback = "") => drafts[bookingId]?.[key] ?? fallback;

  const getAssignedMemberId = (booking) => {
    if (!booking?.assignedMember) return "";
    if (typeof booking.assignedMember === "object") return booking.assignedMember?._id || "";
    return booking.assignedMember;
  };

  const getAssignedMemberLabel = (booking) => {
    if (!booking?.assignedMember) return "";
    if (typeof booking.assignedMember === "object") return booking.assignedMember?.name || "";
    const member = teamMembers.find((m) => m._id === booking.assignedMember);
    return member?.name || booking.assignedMember;
  };

  // ── Update booking ────────────────────────────────────────────────────────
  const updateBooking = async (bookingId, payload) => {
    try {
      if (payload?.assignedMember === "") payload.assignedMember = null;
      const res = await api.put(`/bookings/${bookingId}/status`, payload);
      const updated = res?.data?.data || { _id: bookingId, ...payload };
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, ...updated } : b)));
      // clear draft after save
      setDrafts((prev) => { const n = { ...prev }; delete n[bookingId]; return n; });
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert("Failed to update booking. See console for details.");
    }
  };

  return (
    <AdminShell
      title="Active / Running Events"
      subtitle="Review bookings, confirm, cancel, assign team members and store remarks."
    >
      {loading ? (
        <div className="py-20 text-center text-slate-300">Loading bookings…</div>
      ) : (
        <div className="space-y-8">

          {/* ── Stat cards ── */}
          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6 sm:gap-3">
            {[
              { key: "active",    label: "Active",    value: stats.active,    tone: "from-orange-500 to-amber-500"  },
              { key: "pending",   label: "Pending",   value: stats.pending,   tone: "from-slate-600 to-slate-700"   },
              { key: "confirmed", label: "Confirmed", value: stats.confirmed, tone: "from-emerald-500 to-green-600" },
              { key: "assigned",  label: "Assigned",  value: stats.assigned,  tone: "from-cyan-500 to-blue-600"     },
              { key: "completed", label: "Completed ✅", value: stats.completed, tone: "from-green-500 to-teal-600" },
              { key: "cancelled", label: "Cancelled", value: stats.cancelled, tone: "from-rose-500 to-red-600"      },
            ].map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelectedFilter(card.key)}
                className={`rounded-2xl p-3 sm:p-4 bg-gradient-to-br ${card.tone} shadow-lg text-left transition hover:scale-[1.03] border-2 ${
                  selectedFilter === card.key ? "border-white" : "border-transparent"
                }`}
              >
                <p className="text-xs font-medium text-white/80">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{card.value}</p>
              </button>
            ))}
          </section>

          {/* ── "Completed by team" banner ── */}
          {stats.completed > 0 && selectedFilter !== "completed" && (
            <button
              onClick={() => setSelectedFilter("completed")}
              className="flex items-center justify-between w-full px-5 py-3 transition border bg-green-500/10 border-green-500/30 rounded-2xl hover:bg-green-500/20"
            >
              <span className="text-sm font-semibold text-green-300">
                🎉 {stats.completed} booking{stats.completed > 1 ? "s" : ""} marked complete by team — click to review
              </span>
              <span className="text-sm font-bold text-green-300">View →</span>
            </button>
          )}

          {/* ── Booking list ── */}
          <section className="p-5 border bg-white/5 border-white/10 rounded-3xl md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white md:text-2xl">{filterLabels[selectedFilter]}</h2>
              <p className="mt-1 text-sm text-slate-300">Click a summary card above to filter.</p>
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center border py-14 text-slate-300 bg-black/20 rounded-3xl border-white/10">
                  No bookings for this status.
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const draft          = drafts[booking._id] || {};
                  // ── KEY FIX: bind select to draft.status, fall back to booking.status ──
                  const currentStatus  = draft.status          ?? booking.status;
                  const selectedMember = draft.assignedMember  ?? getAssignedMemberId(booking);
                  const remarks        = draft.remarks         ?? booking.remarks ?? "";
                  const assignedLabel  = getAssignedMemberLabel(booking);
                  const showControls   = selectedFilter !== "cancelled";
                  const isTeamDone     = booking.status === "completed";

                  return (
                    <div
                      key={booking._id}
                      className={`rounded-3xl border p-5 shadow-xl ${
                        isTeamDone
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-slate-900/80 border-white/10"
                      }`}
                    >
                      {/* "Team marked done" badge */}
                      {isTeamDone && (
                        <div className="flex items-center gap-2 px-4 py-2 mb-3 border bg-green-500/20 border-green-500/30 rounded-xl w-fit">
                          <span className="text-sm font-semibold text-green-300">
                            ✅ Team marked this as completed — please confirm below
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-white md:text-xl">
                              {booking.eventId?.title || booking.eventTitle || "Event booking"}
                            </h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="mt-2 text-sm text-slate-300">
                            👤 {booking.customerName} | 📞 {booking.customerPhone}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            📅 {new Date(booking.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} | 📍 {booking.venueAddress}
                          </p>
                          {assignedLabel && (
                            <p className="mt-1 text-sm text-slate-300">🧑 Assigned to: {assignedLabel}</p>
                          )}
                          <p className="mt-2 font-bold text-orange-300">
                            ₹{(booking.price || 0).toLocaleString()}
                          </p>
                          {booking.notes && (
                            <p className="mt-2 text-sm text-slate-400">📝 {booking.notes}</p>
                          )}
                          {booking.remarks && (
                            <p className="mt-2 text-sm text-slate-300">💬 Remarks: {booking.remarks}</p>
                          )}
                          {booking.status === "cancelled" && (
                            <p className="mt-2 text-sm text-rose-300">
                              Cancelled by {booking.cancelledBy || "customer"}.
                            </p>
                          )}
                        </div>

                        {/* Controls */}
                        {showControls && (
                          <div className="w-full lg:w-[360px] space-y-3">

                            {/* ── STATUS SELECT — now bound to draft ── */}
                            <select
                              value={currentStatus}
                              onChange={(e) => setDraft(booking._id, "status", e.target.value)}
                              className="w-full px-3 py-2 font-medium bg-white border rounded-xl text-slate-900 border-slate-200"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="assigned">Assigned</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Team member assign */}
                            <select
                              value={selectedMember}
                              onChange={(e) => setDraft(booking._id, "assignedMember", e.target.value)}
                              className="w-full px-3 py-2 bg-white border rounded-xl text-slate-900 border-slate-200"
                            >
                              <option value="">Allocate team member</option>
                              {teamMembers.map((m) => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                              ))}
                            </select>

                            {/* Remarks */}
                            <textarea
                              rows={3}
                              value={remarks}
                              onChange={(e) => setDraft(booking._id, "remarks", e.target.value)}
                              placeholder="Add admin remarks…"
                              className="w-full px-4 py-3 text-sm bg-white border outline-none resize-none rounded-xl text-slate-900 border-slate-200 focus:border-orange-400"
                            />

                            <Button
                              onClick={() =>
                                updateBooking(booking._id, {
                                  status:         currentStatus,
                                  assignedMember: selectedMember || null,
                                  remarks,
                                })
                              }
                              variant="primary"
                              size="full"
                            >
                              Update Booking
                            </Button>
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