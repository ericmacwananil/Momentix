// src/components/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const styles = {
    pending:   "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    assigned:  "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}