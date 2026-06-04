// src/pages/TeamDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import sleep from "../utils/sleep";

export default function TeamDashboard() {
  const { user } = useAuth();
  const [myTasks, setMyTasks]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [completing, setCompleting] = useState(null); // task id being marked done

  const activeTasks    = myTasks.filter((t) => t.status !== "cancelled" && t.status !== "completed");
  const completedTasks = myTasks.filter((t) => t.status === "completed");
  const cancelledTasks = myTasks.filter((t) => t.status === "cancelled");

  // ── Fetch my tasks ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMyTasks = async () => {
      const start = Date.now();
      try {
        const res = await api.post("/bookings/my-tasks", { userId: user._id });
        setMyTasks(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        // fallback mock
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

  // ── Mark task as completed ────────────────────────────────────────────────
  const markCompleted = async (taskId) => {
    setCompleting(taskId);
    try {
      await api.put(`/bookings/${taskId}/status`, { status: "completed" });
      // update locally so UI reflects immediately
      setMyTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: "completed" } : t))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to mark task as completed. Please try again.");
    } finally {
      setCompleting(null);
    }
  };

  // ── Tag colors ────────────────────────────────────────────────────────────
  const typeTag = (type) => {
    const map = {
      birthday:  "bg-pink-100 text-pink-700",
      wedding:   "bg-rose-100 text-rose-700",
      corporate: "bg-blue-100 text-blue-700",
    };
    return map[type] || "bg-gray-100 text-gray-700";
  };

  // ── Task card ─────────────────────────────────────────────────────────────
  const TaskCard = ({ task, showComplete = false, cardClass = "bg-white border-gray-100" }) => (
    <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${cardClass}`}>
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="text-base font-bold text-gray-800 sm:text-lg">
              {task.eventId?.title || task.eventTitle || "Event"}
            </h3>
            <StatusBadge status={task.status} />
          </div>
          <div className="mt-1 space-y-1 text-sm text-gray-600">
            <p>👤 <strong>Customer:</strong> {task.customerName}</p>
            <p>📞 <strong>Phone:</strong> {task.customerPhone}</p>
            <p>📅 <strong>Date:</strong> {
              task.eventDate
                ? new Date(task.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—"
            }</p>
            <p>📍 <strong>Venue:</strong> {task.venueAddress}</p>
            {task.remarks && (
              <p className="px-3 py-2 mt-2 font-medium text-orange-600 rounded-lg bg-orange-50">
                💬 Admin note: {task.remarks}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-3 md:flex-col md:items-end md:justify-start md:gap-3">
          <div className="text-right">
            <p className="text-xl font-bold text-orange-500 sm:text-2xl">
              ₹{(task.price || 0).toLocaleString()}
            </p>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${typeTag(task.eventType)}`}>
              {task.eventType}
            </span>
          </div>

          {/* Mark as Completed button */}
          {showComplete && (
            <button
              onClick={() => markCompleted(task._id)}
              disabled={completing === task._id}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-green-500 shadow-md hover:bg-green-600 disabled:opacity-60 rounded-xl shadow-green-200 whitespace-nowrap"
            >
              {completing === task._id ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl px-4 py-8 mx-auto sm:py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-800 sm:text-3xl">🔧 My Assigned Tasks</h1>
      <p className="mb-8 text-sm text-gray-500 sm:text-base">
        Hello {user.name}! Here are your upcoming events.
      </p>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading your tasks…</div>
      ) : myTasks.length === 0 ? (
        <div className="py-20 text-center border border-gray-100 bg-gray-50 rounded-2xl">
          <p className="mb-4 text-5xl">✅</p>
          <h3 className="text-xl font-semibold text-gray-700">No tasks assigned yet</h3>
          <p className="mt-2 text-sm text-gray-400">Check back later</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Active Tasks ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Active Tasks</h2>
              <span className="text-sm text-gray-500">{activeTasks.length} task(s)</span>
            </div>

            {activeTasks.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 bg-white border border-gray-100 rounded-2xl">
                No active tasks right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <TaskCard key={task._id} task={task} showComplete={true} />
                ))}
              </div>
            )}
          </section>

          {/* ── Completed Tasks ── */}
          {completedTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Completed Tasks</h2>
                <span className="text-sm text-gray-500">{completedTasks.length} completed</span>
              </div>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} cardClass="bg-green-50 border-green-100" />
                ))}
              </div>
            </section>
          )}

          {/* ── Cancelled Tasks ── */}
          {cancelledTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Cancelled Tasks</h2>
                <span className="text-sm text-gray-500">{cancelledTasks.length} cancelled</span>
              </div>
              <div className="space-y-4">
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