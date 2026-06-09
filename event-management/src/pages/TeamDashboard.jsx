// src/pages/TeamDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import sleep from "../utils/sleep";

export default function TeamDashboard() {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  const activeTasks    = myTasks.filter((t) => t.status !== "cancelled" && t.status !== "completed");
  const completedTasks = myTasks.filter((t) => t.status === "completed");
  const cancelledTasks = myTasks.filter((t) => t.status === "cancelled");

  // ── Fetch tasks ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMyTasks = async () => {
      const start = Date.now();
      try {
        const res = await api.post("/bookings/my-tasks", { userId: user._id });
        setMyTasks(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setMyTasks([
          {
            _id: "1",
            eventTitle: "Premium Birthday Balloon Decor",
            customerName: "Rahul Sharma",
            customerPhone: "9876543210",
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            venueAddress: "123 Main St, Anand",
            status: "assigned",
            eventType: "birthday",
            price: 4999,
          },
        ]);
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await sleep(1000 - elapsed);
        setLoading(false);
      }
    };
    if (user?._id) fetchMyTasks();
  }, [user]);

  // ── Mark completed ───────────────────────────────────────────────────────
  const markCompleted = async (taskId) => {
    setCompleting(taskId);
    try {
      await api.put(`/bookings/${taskId}/status`, { status: "completed" });
      setMyTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: "completed" } : t))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to mark task as completed. Please try again.");
    } finally {
      setCompleting(null);
    }
  };

  // ── Type tag colors ──────────────────────────────────────────────────────
  const typeTag = (type) => {
    const map = {
      birthday:  "bg-pink-100 text-pink-700",
      wedding:   "bg-rose-100 text-rose-700",
      corporate: "bg-blue-100 text-blue-700",
    };
    return map[type] || "bg-gray-100 text-gray-700";
  };

  // ── Task Card ────────────────────────────────────────────────────────────
  const TaskCard = ({ task, showComplete = false, cardClass = "bg-white border-gray-100" }) => (
    <div className={`rounded-2xl shadow-sm border p-4 sm:p-5 md:p-6 ${cardClass}`}>
      {/* ✅ Outer: stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">

        {/* LEFT — Task info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2 sm:gap-3">
            <h3 className="text-sm font-bold leading-snug text-gray-800 sm:text-base md:text-lg">
              {task.eventId?.title || task.eventTitle || "Event"}
            </h3>
            <StatusBadge status={task.status} />
          </div>

          {/* ✅ text-xs on mobile, text-sm on sm+ for readability */}
          <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 mt-2">
            <p>👤 <strong className="text-gray-700">Customer:</strong> {task.customerName}</p>
            <p>📞 <strong className="text-gray-700">Phone:</strong> {task.customerPhone}</p>
            <p>📅 <strong className="text-gray-700">Date:</strong> {
              task.eventDate
                ? new Date(task.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—"
            }</p>
            <p>📍 <strong className="text-gray-700">Venue:</strong> {task.venueAddress}</p>
            {task.remarks && (
              <p className="px-3 py-2 mt-2 text-xs font-medium text-orange-600 rounded-lg bg-orange-50 sm:text-sm">
                💬 Admin note: {task.remarks}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — Price + Button */}
        {/* ✅ On mobile: row with price left, button right
             On md+: column with both right-aligned */}
        <div className="flex flex-row items-center justify-between flex-shrink-0 gap-3 md:flex-col md:items-end md:justify-start md:gap-3">
          <div>
            {/* ✅ text-left on mobile, text-right on md+ */}
            <p className="text-lg font-bold text-orange-500 sm:text-xl md:text-2xl">
              ₹{(task.price || 0).toLocaleString()}
            </p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${typeTag(task.eventType)}`}>
              {task.eventType}
            </span>
          </div>

          {/* Mark as Done button */}
          {showComplete && (
            <button
              onClick={() => markCompleted(task._id)}
              disabled={completing === task._id}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition bg-green-500 shadow-md hover:bg-green-600 active:scale-95 disabled:opacity-60 rounded-xl shadow-green-200 whitespace-nowrap"
            >
              {completing === task._id ? (
                <>
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
                  Saving…
                </>
              ) : (
                <>✅ Mark as Done</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ── Section header helper ─────────────────────────────────────────────────
  const SectionHeader = ({ title, count, countLabel }) => (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h2 className="text-base font-bold text-gray-800 sm:text-lg md:text-xl">{title}</h2>
      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
        {count} {countLabel}
      </span>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl px-4 py-6 mx-auto sm:py-8 md:py-10">

      {/* Page heading */}
      <h1 className="mb-1 text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
        🔧 My Assigned Tasks
      </h1>
      <p className="mb-6 text-xs text-gray-500 sm:text-sm md:text-base sm:mb-8">
        Hello {user.name}! Here are your upcoming events.
      </p>

      {/* ✅ Loading — spinner instead of plain text */}
      {loading ? (
        <div className="py-16 text-center sm:py-20">
          <div className="w-10 h-10 mx-auto border-4 border-orange-200 rounded-full border-t-orange-500 animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">Loading your tasks…</p>
        </div>

      ) : myTasks.length === 0 ? (
        <div className="px-4 py-16 text-center border border-gray-100 sm:py-20 bg-gray-50 rounded-2xl">
          <p className="mb-3 text-5xl">✅</p>
          <h3 className="text-lg font-semibold text-gray-700 sm:text-xl">No tasks assigned yet</h3>
          <p className="mt-2 text-xs text-gray-400 sm:text-sm">Check back later</p>
        </div>

      ) : (
        <div className="space-y-8 sm:space-y-10">

          {/* Active Tasks */}
          <section>
            <SectionHeader title="Active Tasks" count={activeTasks.length} countLabel="task(s)" />
            {activeTasks.length === 0 ? (
              <div className="p-5 text-xs text-gray-500 bg-white border border-gray-100 sm:p-6 sm:text-sm rounded-2xl">
                No active tasks right now.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeTasks.map((task) => (
                  <TaskCard key={task._id} task={task} showComplete={true} />
                ))}
              </div>
            )}
          </section>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <section>
              <SectionHeader title="Completed Tasks" count={completedTasks.length} countLabel="completed" />
              <div className="space-y-3 sm:space-y-4">
                {completedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} cardClass="bg-green-50 border-green-100" />
                ))}
              </div>
            </section>
          )}

          {/* Cancelled Tasks */}
          {cancelledTasks.length > 0 && (
            <section>
              <SectionHeader title="Cancelled Tasks" count={cancelledTasks.length} countLabel="cancelled" />
              <div className="space-y-3 sm:space-y-4">
                {cancelledTasks.map((task) => (
                  <TaskCard key={task._id} task={task} cardClass="bg-red-50 border-red-100" />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}