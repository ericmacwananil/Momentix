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

  const activeTasks = myTasks.filter((task) => task.status !== "cancelled");
  const cancelledTasks = myTasks.filter((task) => task.status === "cancelled");

  useEffect(() => {
    const fetchMyTasks = async () => {
      const start = Date.now();
      try {
        console.log(`👤 Fetching tasks for team member: ${user.name} (ID: ${user._id})`);
        const res = await api.post("/bookings/my-tasks", { userId: user._id });
        console.log(`✅ Tasks fetched:`, res.data.data);
        setMyTasks(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        console.log("⚠️ Using fallback mock data...");
        // Fallback to mock data
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">🔧 My Assigned Tasks</h1>
      <p className="text-gray-500 mb-8">Hello {user.name}! Here are your upcoming events.</p>

      {loading ? (
        <div className="text-center py-20">Loading your tasks...</div>
      ) : myTasks.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-5xl mb-4">✅</p>
          <h3 className="text-xl font-semibold text-gray-700">No tasks assigned yet</h3>
          <p className="text-gray-400 mt-2">Check back later</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Active Tasks</h2>
              <span className="text-sm text-gray-500">{activeTasks.length} task(s)</span>
            </div>
            {activeTasks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-500">
                No active tasks right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">{task.eventTitle}</h3>
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>👤 <strong>Customer:</strong> {task.customerName}</p>
                          <p>📞 <strong>Phone:</strong> {task.customerPhone}</p>
                          <p>📅 <strong>Date:</strong> {task.eventDate}</p>
                          <p>📍 <strong>Venue:</strong> {task.venueAddress}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">₹{task.price.toLocaleString()}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          task.eventType === "birthday" ? "bg-pink-100 text-pink-700" :
                          task.eventType === "wedding" ? "bg-rose-100 text-rose-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {task.eventType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Cancelled Tasks</h2>
              <span className="text-sm text-gray-500">{cancelledTasks.length} cancelled</span>
            </div>
            {cancelledTasks.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-gray-500">
                No cancelled tasks.
              </div>
            ) : (
              <div className="space-y-4">
                {cancelledTasks.map((task) => (
                  <div key={task._id} className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">{task.eventTitle}</h3>
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>👤 <strong>Customer:</strong> {task.customerName}</p>
                          <p>📞 <strong>Phone:</strong> {task.customerPhone}</p>
                          <p>📅 <strong>Date:</strong> {task.eventDate}</p>
                          <p>📍 <strong>Venue:</strong> {task.venueAddress}</p>
                          <p className="text-red-600 font-medium">This task was cancelled.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-500">₹{task.price.toLocaleString()}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          task.eventType === "birthday" ? "bg-pink-100 text-pink-700" :
                          task.eventType === "wedding" ? "bg-rose-100 text-rose-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {task.eventType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}