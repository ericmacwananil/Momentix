// src/pages/AdminManageEventsPage.jsx
// Full CRUD — Add / Edit / Delete events from the admin panel

import { useEffect, useState } from "react";
import api from "../utils/api";
import AdminShell from "../components/AdminShell";

// ─── Empty form template ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  title:        "",
  eventType:    "birthday",
  description:  "",
  price:        "",
  rating:       "4.5",
  reviewCount:  "0",      // matches Event model field name
  duration:     "",
  teamSize:     "",
  availability: true,
  features:     "",       // comma-separated → array on save
  images:       "",       // one URL per line → array on save
};

const EVENT_TYPES = ["birthday", "wedding", "corporate", "other"];

const TYPE_COLORS = {
  birthday:  "bg-pink-500/20  text-pink-300  border-pink-500/30",
  wedding:   "bg-rose-500/20  text-rose-300  border-rose-500/30",
  corporate: "bg-blue-500/20  text-blue-300  border-blue-500/30",
  other:     "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

// ─── Tiny reusable UI pieces ──────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-semibold text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
const inputCls = "w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition";
const Input    = (props) => <input    {...props} className={inputCls} />;
const Textarea = (props) => <textarea {...props} className={`${inputCls} resize-none`} />;
const Select   = ({ children, ...props }) => (
  <select {...props} className={inputCls}>{children}</select>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminManageEventsPage() {
  const [events,        setEvents]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(null);
  const [showForm,      setShowForm]      = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [search,        setSearch]        = useState("");
  const [filterType,    setFilterType]    = useState("");
  const [toast,         setToast]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data.data || []);
    } catch {
      showToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchEvents(); }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Upload image to Cloudinary ────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success && res.data.url) {
        // Add new image to form
        setForm((f) => ({
          ...f,
          images: f.images ? `${f.images}\n${res.data.url}` : res.data.url,
        }));
        showToast("Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      showToast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Open add form ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Open edit form ────────────────────────────────────────────────────────
  const openEdit = (ev) => {
    setEditingId(ev._id || ev.id);
    setForm({
      title:        ev.title        || "",
      eventType:    ev.eventType    || "birthday",
      description:  ev.description  || "",
      price:        String(ev.price || ""),
      rating:       String(ev.rating || "4.5"),
      reviewCount:  String(ev.reviewCount ?? ev.reviews ?? 0), // handle both field names
      duration:     ev.duration     || "",
      teamSize:     String(ev.teamSize || ""),
      availability: ev.availability !== false,
      features:     Array.isArray(ev.features) ? ev.features.join(", ") : "",
      images:       Array.isArray(ev.images)   ? ev.images.join("\n")   : (ev.image || ""),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // ── Build API payload — field names match Event model exactly ─────────────
  const buildPayload = () => ({
    title:        form.title.trim(),
    eventType:    form.eventType,
    description:  form.description.trim(),
    price:        Number(form.price)       || 0,
    rating:       Number(form.rating)      || 4.5,
    reviewCount:  Number(form.reviewCount) || 0,   // ← matches model field
    duration:     form.duration.trim(),
    teamSize:     Number(form.teamSize)    || 0,
    availability: form.availability,
    features:     form.features.split(",").map((f) => f.trim()).filter(Boolean),
    images:       form.images.split("\n").map((u) => u.trim()).filter(Boolean),
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required", "error");  return; }
    if (!form.price)         { showToast("Price is required", "error"); return; }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
        showToast("Event updated ✓");
      } else {
        await api.post("/events", payload);
        showToast("Event created ✓");
      }
      setShowForm(false);
      setEditingId(null);
      await fetchEvents();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save event";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((ev) => (ev._id || ev.id) !== id));
      showToast("Event deleted");
    } catch {
      showToast("Failed to delete event", "error");
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = events.filter((ev) => {
    const matchSearch = !search     || (ev.title || "").toLowerCase().includes(search.toLowerCase());
    const matchType   = !filterType || ev.eventType === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    total:     events.length,
    available: events.filter((e) => e.availability !== false).length,
    booked:    events.filter((e) => e.availability === false).length,
    types:     [...new Set(events.map((e) => e.eventType))].length,
  };

  return (
    <AdminShell title="Manage Events" subtitle="Add, edit or remove event packages visible to customers.">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm p-6 border shadow-2xl bg-slate-900 border-white/10 rounded-3xl">
            <p className="mb-2 text-lg font-bold text-white">Delete this event?</p>
            <p className="mb-6 text-sm text-slate-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm font-semibold transition border rounded-xl border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting === deleteConfirm}
                className="flex-1 py-2 text-sm font-semibold text-white transition bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60"
              >
                {deleting === deleteConfirm ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total Events",  value: stats.total,     tone: "from-orange-500 to-amber-500"  },
            { label: "Available",     value: stats.available, tone: "from-emerald-500 to-green-600" },
            { label: "Booked Out",    value: stats.booked,    tone: "from-rose-500 to-red-600"      },
            { label: "Event Types",   value: stats.types,     tone: "from-slate-600 to-slate-700"   },
          ].map((c) => (
            <div key={c.label} className={`rounded-2xl p-4 bg-gradient-to-br ${c.tone} shadow-lg`}>
              <p className="text-xs font-medium text-white/70">{c.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">{c.value}</p>
            </div>
          ))}
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="p-5 border shadow-2xl bg-slate-900/80 border-white/10 rounded-3xl md:p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "✏️ Edit Event" : "➕ Add New Event"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center justify-center text-xl transition rounded-full text-slate-400 hover:text-white w-9 h-9 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Title */}
              <div className="md:col-span-2">
                <Field label="Event Title *">
                  <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Royal Wedding Stage Decor" required />
                </Field>
              </div>

              {/* Type */}
              <Field label="Event Type *">
                <Select name="eventType" value={form.eventType} onChange={handleChange}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </Select>
              </Field>

              {/* Price */}
              <Field label="Price (₹) *">
                <Input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="e.g. 4999" required />
              </Field>

              {/* Duration */}
              <Field label="Setup Duration">
                <Input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3-4 hours setup" />
              </Field>

              {/* Team Size */}
              <Field label="Team Size">
                <Input name="teamSize" type="number" min="0" value={form.teamSize} onChange={handleChange} placeholder="e.g. 4" />
              </Field>

              {/* Rating */}
              <Field label="Rating (0 – 5)">
                <Input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} placeholder="4.5" />
              </Field>

              {/* Review Count */}
              <Field label="Review Count">
                <Input name="reviewCount" type="number" min="0" value={form.reviewCount} onChange={handleChange} placeholder="0" />
              </Field>

              {/* Availability */}
              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={form.availability}
                  onChange={handleChange}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="availability" className="text-sm font-medium cursor-pointer text-slate-300">
                  Available for booking
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Field label="Description">
                  <Textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Describe what's included in this package…" />
                </Field>
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <Field label="Features / Inclusions" hint="Separate each item with a comma — e.g.  200+ Balloons, LED Lights, Custom Banner">
                  <Input name="features" value={form.features} onChange={handleChange} placeholder="200+ Balloons, LED Lights, Custom Banner, Flower Arch" />
                </Field>
              </div>

              {/* Images Upload + URLs */}
              <div className="md:col-span-2">
                <Field label="Event Images" hint="Upload images directly or paste URLs">
                  {/* File Upload */}
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-slate-400
                        file:mr-3 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-500 file:text-white
                        hover:file:bg-orange-600
                        file:cursor-pointer"
                    />
                    {uploading && <p className="text-xs text-orange-300 mt-2">Uploading image…</p>}
                  </div>

                  {/* Image URLs Textarea */}
                  <Textarea
                    name="images"
                    rows={4}
                    value={form.images}
                    onChange={handleChange}
                    placeholder={"https://images.unsplash.com/photo-xxx?w=800&auto=format\nhttps://images.unsplash.com/photo-yyy?w=800&auto=format"}
                  />
                </Field>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Search bar + Add button ── */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap flex-1 gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400 transition min-w-[180px]"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm text-white transition border outline-none bg-slate-800 border-white/10 rounded-xl focus:border-orange-400"
            >
              <option value="">All Types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={openAdd}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/25 flex items-center gap-2 whitespace-nowrap"
          >
            + Add New Event
          </button>
        </div>

        {/* ── Events list ── */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading events…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border text-slate-400 bg-white/5 rounded-3xl border-white/10">
            {events.length === 0
              ? "No events yet. Click \"+ Add New Event\" to get started."
              : "No events match your search."}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ev) => {
              const evId = ev._id || ev.id;
              const img  = Array.isArray(ev.images) && ev.images.length ? ev.images[0] : ev.image || null;

              return (
                <div key={evId} className="overflow-hidden border shadow-xl bg-slate-900/80 border-white/10 rounded-3xl">
                  <div className="flex flex-col sm:flex-row">

                    {/* Thumbnail */}
                    {img && (
                      <div className="h-40 overflow-hidden sm:w-44 sm:flex-shrink-0 sm:h-auto">
                        <img
                          src={img}
                          alt={ev.title}
                          className="object-cover w-full h-full"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-col flex-1 gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border capitalize ${TYPE_COLORS[ev.eventType] || TYPE_COLORS.other}`}>
                            {ev.eventType}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            ev.availability !== false
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}>
                            {ev.availability !== false ? "Available" : "Booked Out"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold leading-tight text-white line-clamp-1">{ev.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-2">{ev.description}</p>

                        <div className="flex flex-wrap mt-3 text-xs gap-x-4 gap-y-1 text-slate-400">
                          <span>💰 <strong className="text-orange-300">₹{(ev.price || 0).toLocaleString()}</strong></span>
                          <span>⏱ {ev.duration || "—"}</span>
                          <span>👷 {ev.teamSize || "—"} members</span>
                          <span>⭐ {ev.rating || "—"} ({ev.reviewCount ?? ev.reviews ?? 0} reviews)</span>
                        </div>

                        {Array.isArray(ev.features) && ev.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {ev.features.slice(0, 4).map((f) => (
                              <span key={f} className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                                {f}
                              </span>
                            ))}
                            {ev.features.length > 4 && (
                              <span className="text-[11px] text-orange-400 font-medium">+{ev.features.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 sm:flex-col sm:flex-shrink-0">
                        <button
                          onClick={() => openEdit(ev)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-slate-200 hover:text-orange-300 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(evId)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-300 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}