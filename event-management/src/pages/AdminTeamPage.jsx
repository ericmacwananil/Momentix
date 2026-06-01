// src/pages/AdminTeamPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import AdminShell from "../components/AdminShell";
import Button from "../components/Button";

// teamMembers will be loaded from backend
const activeStatuses = new Set(["pending", "confirmed", "assigned"]);

export default function AdminTeamPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      const start = Date.now();
      try {
        const res = await api.get("/bookings/all");
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("Failed to load team allocation data:", error);
        setBookings([]);
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
        setLoading(false);
      }
    };

    const fetchTeam = async () => {
      try {
        const res = await api.get('/users/team-members');
        const members = (res.data && res.data.data) ? res.data.data : [];
        setTeamMembers(members);
      } catch (e) {
        console.warn('Could not load team members, falling back to defaults', e.message);
        setTeamMembers([]);
      }
    };

    fetchBookings();
    fetchTeam();
  }, []);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => activeStatuses.has(booking.status)),
    [bookings]
  );

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

  const isBookingAssignedToMember = (booking, member) => {
    const assigned = getAssignedMemberId(booking);
    return assigned === member._id || booking.assignedMember === member.name;
  };

  const byMember = useMemo(() => {
    return teamMembers.map((member) => ({
      member,
      bookings: activeBookings.filter((booking) => {
        return isBookingAssignedToMember(booking, member);
      }),
    }));
  }, [activeBookings, teamMembers]);

  const unallocated = activeBookings.filter((booking) => {
    const assigned = getAssignedMemberId(booking);
    return !assigned;
  });

  // UI state for per-member quick-assign control
  const [assigningFor, setAssigningFor] = useState({});

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

  return (
    <AdminShell
      title="Team Members & Allocation"
      subtitle="See which active bookings are allocated, which ones are still waiting, and leave remarks while assigning work to team members."
    >
      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading team allocations...</div>
      ) : (
        <div className="space-y-8">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Bookings", value: activeBookings.length, tone: "from-cyan-500 to-blue-600" },
              { label: "Allocated", value: activeBookings.length - unallocated.length, tone: "from-emerald-500 to-green-600" },
              { label: "Waiting", value: unallocated.length, tone: "from-amber-500 to-orange-600" },
              { label: "Team Members", value: teamMembers.length, tone: "from-slate-600 to-slate-700" },
            ].map((card) => (
              <div key={card.label} className={`rounded-3xl p-5 bg-gradient-to-br ${card.tone} shadow-lg`}>
                <p className="text-white/80 text-sm font-medium">{card.label}</p>
                <p className="text-white text-3xl font-bold mt-1">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <h2 className="text-xl md:text-2xl font-bold text-white">Team allocation board</h2>
                <p className="text-slate-300 text-sm mt-1">Assign active bookings to team members and store remarks for the crew.</p>
              </div>

              {byMember.map(({ member, bookings: memberBookings }) => (
                <div key={member._id} className="rounded-3xl border border-white/10 bg-white p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-500">{memberBookings.length} active booking(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setAssigningFor((s) => ({ ...s, [member._id]: !s[member._id] }))}
                        variant="secondary"
                        size="sm"
                        className="border-orange-100 bg-orange-50 text-orange-600"
                      >
                        {assigningFor[member._id] ? 'Close' : 'Assign booking'}
                      </Button>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">Allocated</span>
                    </div>
                  </div>

                  {assigningFor[member._id] && (
                    <div className="mb-4">
                      <label className="block text-sm text-slate-600 mb-2">Assign a waiting booking to {member.name}</label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-3 py-2 rounded-xl bg-white text-slate-900 border border-slate-200"
                          onChange={(e) => setDraft('assign-'+member._id, 'bookingToAssign', e.target.value)}
                          value={getDraft('assign-'+member._id, 'bookingToAssign', '')}
                        >
                          <option value="">Select booking to assign</option>
                          {unallocated.map(b => (
                            <option key={b._id} value={b._id}>{b.eventId?.title || b.eventTitle || (`Booking ${b._id}`)}</option>
                          ))}
                        </select>
                        <Button
                          onClick={() => {
                            const bid = getDraft('assign-'+member._id, 'bookingToAssign', '');
                            if (!bid) return;
                            updateBooking(bid, { status: 'assigned', assignedMember: member._id });
                            // clear draft and close
                            setDraft('assign-'+member._id, 'bookingToAssign', '');
                            setAssigningFor((s) => ({ ...s, [member._id]: false }));
                          }}
                          variant="primary"
                          size="md"
                        >Assign</Button>
                      </div>
                    </div>
                  )}

                  {memberBookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-500 text-sm">
                      No active bookings allocated yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memberBookings.map((booking) => {
                        const remarks = getDraft(booking._id, "remarks", booking.remarks || "");
                        const assignedLabel = getAssignedMemberLabel(booking);
                        return (
                          <div key={booking._id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h4 className="font-bold text-slate-900">{booking.eventId?.title || booking.eventTitle || "Event booking"}</h4>
                                  <StatusBadge status={booking.status} />
                                </div>
                                <p className="text-sm text-slate-600 mt-1">👤 {booking.customerName} | 📞 {booking.customerPhone}</p>
                                <p className="text-sm text-slate-500 mt-1">📅 {new Date(booking.eventDate).toLocaleDateString()} | 📍 {booking.venueAddress}</p>
                                {assignedLabel && <p className="text-xs text-slate-500 mt-1">Assigned to: {assignedLabel}</p>}
                              </div>

                              <div className="md:w-[280px] space-y-2">
                                <textarea
                                  rows={3}
                                  value={remarks}
                                  onChange={(e) => setDraft(booking._id, "remarks", e.target.value)}
                                  placeholder="Remarks for this team member..."
                                  className="w-full textarea-unique px-4 py-3 text-slate-900"
                                />
                                <Button
                                  onClick={() => updateBooking(booking._id, { status: booking.status === "pending" ? "assigned" : booking.status, assignedMember: member._id, remarks })}
                                  variant="primary"
                                  size="full"
                                >
                                  Save allocation / remarks
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <h3 className="text-lg font-bold text-white">Waiting bookings</h3>
                <p className="text-slate-300 text-sm mt-1">These are active but not allocated yet.</p>
              </div>

              {unallocated.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-500">
                  No waiting bookings.
                </div>
              ) : (
                <div className="space-y-3">
                  {unallocated.map((booking) => {
                    const selectedMember = getDraft(booking._id, "assignedMember", "");
                    const remarks = getDraft(booking._id, "remarks", booking.remarks || "");

                    return (
                      <div key={booking._id} className="rounded-3xl border border-white/10 bg-white p-4 shadow-lg">
                        <h4 className="font-bold text-slate-900">{booking.eventId?.title || booking.eventTitle || "Event booking"}</h4>
                        <p className="text-sm text-slate-500 mt-1">{booking.customerName}</p>
                        <div className="mt-3 space-y-2">
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
                            placeholder="Remarks for the allocation..."
                            className="w-full textarea-unique px-4 py-3 text-slate-900"
                          />
                          <Button
                            onClick={() => updateBooking(booking._id, { status: selectedMember ? "assigned" : booking.status, assignedMember: selectedMember || null, remarks })}
                            variant="success"
                            size="full"
                          >
                            Allocate / Save remarks
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
