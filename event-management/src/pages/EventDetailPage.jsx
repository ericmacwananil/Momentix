// src/pages/EventDetailPage.jsx
// UPDATED: Real image, image gallery, better layout

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { events as mockEvents } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import api from "../utils/api";

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalize = (raw) => {
    if (!raw) return null;
    return {
      id: raw._id || raw.id || raw._id?.toString(),
      title: raw.title || raw.name || "",
      eventType: raw.eventType || raw.type || "",
      description: raw.description || raw.desc || "",
      price: raw.price || raw.cost || 0,
      rating: raw.rating || raw.avgRating || 0,
      reviews: raw.reviews || raw.reviewCount || 0,
      images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : (raw.image ? [raw.image] : []),
      features: raw.features || raw.includes || [],
      duration: raw.duration || raw.setup || "",
      teamSize: raw.teamSize || raw.team || 0,
      availability: typeof raw.availability === "boolean" ? raw.availability : true,
    };
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    // Try backend first, fallback to mock data
    api.get(`/events/${id}`)
      .then((res) => {
        if (!mounted) return;
        if (res.data && res.data.success && res.data.data) {
          setEvent(normalize(res.data.data));
        } else {
          setError("Event not found");
        }
      })
      .catch(() => {
        // fallback: search mock events by id or title
        const found = mockEvents.find((e) => e.id === id || e._id === id);
        if (found) setEvent(normalize(found));
        else setError("Event not found");
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="text-center py-12 sm:py-20 text-sm sm:text-base">Loading...</div>;
  if (error || !event)
    return (
      <div className="text-center py-12 sm:py-20">
        <p className="text-4xl sm:text-5xl mb-3 sm:mb-4">🤷</p>
        <p className="text-lg sm:text-xl text-gray-600">Event not found</p>
        <Link to="/events" className="text-orange-500 mt-3 sm:mt-4 inline-block text-sm sm:text-base">← Back to Events</Link>
      </div>
    );

  const tagColors = {
    birthday: "bg-pink-100 text-pink-700",
    wedding:  "bg-rose-100 text-rose-700",
    corporate:"bg-blue-100 text-blue-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Back */}
      <Link to="/events" className="text-orange-500 hover:underline text-xs sm:text-sm flex items-center gap-1 mb-4 sm:mb-6">
        ← Back to Services
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">

        {/* ===== LEFT: IMAGE GALLERY ===== */}
        <div>
          {/* Main image */}
          <div className="rounded-2xl overflow-hidden h-48 sm:h-64 md:h-80 bg-gray-100 shadow-md">
            <img
              src={event.images[activeImg]}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format"; }}
            />
          </div>

          {/* Thumbnail strip */}
          {event.images.length > 1 && (
            <div className="flex gap-2 mt-2 sm:mt-3 overflow-x-auto pb-2">
              {event.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? "border-orange-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== RIGHT: DETAILS ===== */}
        <div>
          {/* Badge + Title */}
          <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${tagColors[event.eventType] || "bg-gray-100 text-gray-700"}`}>
            {event.eventType}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-2 sm:mt-3 leading-tight">{event.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={`text-sm sm:text-base ${i <= Math.floor(event.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
              ))}
            </div>
            <span className="font-semibold text-gray-700 text-sm">{event.rating}</span>
            <span className="text-gray-400 text-xs sm:text-sm">({event.reviews} reviews)</span>
          </div>

          <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">{event.description}</p>

          {/* Meta boxes */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-5">
            {[
              { label: "Setup Duration", value: event.duration, icon: "⏱️" },
              { label: "Team Size", value: `${event.teamSize} Members`, icon: "👷" },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
                <p className="text-base sm:text-lg mb-1">{m.icon}</p>
                <p className="text-xs text-gray-400">{m.label}</p>
                <p className="font-semibold text-gray-800 text-xs sm:text-sm mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Availability note */}
          {!event.availability && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm font-medium">
              ⚠️ This package is currently fully booked. Check back soon.
            </div>
          )}

          {/* Price & Book */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-gray-400 text-xs">Starting from</p>
              <p className="text-4xl font-bold text-orange-500">₹{event.price.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-0.5">All inclusive, no hidden charges</p>
            </div>

            {event.availability ? (
              user ? (
                <Button to={`/booking/${event.id}`} variant="primary" size="lg" className="shadow-md shadow-orange-200">Book Now →</Button>
              ) : (
                <Button to="/login" variant="primary" size="lg" className="shadow-md shadow-orange-200">Login to Book</Button>
              )
            ) : (
              <Button
                disabled
                variant="secondary"
                size="lg"
              >
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">What's Included in this Package</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {event.features.map((f) => (
            <div key={f} className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">
                ✓
              </div>
              <span className="text-gray-700 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== BOTTOM CTA ===== */}
      <div className="mt-12 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Have questions about this package?</h3>
          <p className="text-gray-600 text-sm mt-1">Call us: <strong className="text-orange-600">+91 98765 43210</strong> or book directly!</p>
        </div>
        {event.availability && (
          user ? (
            <Button to={`/booking/${event.id}`} variant="primary" size="md" className="whitespace-nowrap">Book This Package</Button>
          ) : (
            <Button to="/login" variant="primary" size="md" className="whitespace-nowrap">Login to Book</Button>
          )
        )}
      </div>
    </div>
  );
}