// src/pages/EventDetailPage.jsx
// UPDATED: Fixed duplicate imports and Lightbox modal click-outside-to-close behavior

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { events as mockEvents } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import api from "../utils/api";
import {Camera} from "lucide-react";

// ─── Lightbox Modal ───────────────────────────────────────────────────────────
function ImageGallery({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/96 flex flex-col">
      {/* Invisible backdrop layer that hooks the close action safely */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between flex-shrink-0 px-5 py-3 border-b border-white/10 bg-black/20">
        <span className="text-sm font-medium tracking-wide text-white/60">
          {current + 1} &nbsp;/&nbsp; {images.length}
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center text-xl font-bold transition rounded-full text-white/60 hover:text-white w-9 h-9 hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* Main image container (Triggers close when clicking the left/right empty tracks) */}
      <div 
        className="relative z-10 flex items-center justify-center flex-1 min-h-0 py-4 px-14"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <button
          onClick={prev}
          className="absolute z-20 flex items-center justify-center text-2xl text-white transition -translate-y-1/2 rounded-full select-none left-3 top-1/2 w-11 h-11 bg-white/10 hover:bg-white/25"
        >
          ‹
        </button>

        <img
          key={current}
          src={images[current]}
          alt={`Photo ${current + 1}`}
          className="relative z-10 object-contain max-w-full max-h-full shadow-2xl rounded-2xl"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format";
          }}
        />

        <button
          onClick={next}
          className="absolute z-20 flex items-center justify-center text-2xl text-white transition -translate-y-1/2 rounded-full select-none right-3 top-1/2 w-11 h-11 bg-white/10 hover:bg-white/25"
        >
          ›
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="relative z-10 flex justify-center flex-shrink-0 gap-2 px-4 py-3 overflow-x-auto border-t border-white/10 bg-black/20">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              current === i ? "border-orange-400 scale-110 opacity-100" : "border-transparent opacity-40 hover:opacity-75"
            }`}
          >
            <img src={img} alt="" className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Curated photo banks (6 per type, used when backend has fewer images) ────
const PHOTO_BANK = {
  birthday: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558636508-e0969431e349?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502634881401-73bded46a16c?w=800&auto=format&fit=crop",
  ],
  wedding: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop",
  ],
  corporate: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop",
  ],
  other: [
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
  ],
};

const MIN_PHOTOS = 5;

/** Always returns at least MIN_PHOTOS deduplicated images */
function buildImageList(raw) {
  const seen = new Set();
  const result = [];

  const add = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    result.push(url);
  };

  // 1. Backend images
  (raw.images || []).forEach(add);
  if (raw.image) add(raw.image);

  // 2. Matching mock event images (by title or id)
  const mockMatch = mockEvents.find(
    (e) =>
      e.id === raw._id || e._id === raw._id || e.id === raw.id ||
      (e.title || "").trim().toLowerCase() === (raw.title || "").trim().toLowerCase()
  );
  if (mockMatch) {
    (mockMatch.images || []).forEach(add);
    if (mockMatch.image) add(mockMatch.image);
  }

  // 3. Fill remaining from type-based photo bank
  const type = (raw.eventType || raw.type || "other").toLowerCase();
  const bank = PHOTO_BANK[type] || PHOTO_BANK.other;
  for (const url of bank) {
    if (result.length >= MIN_PHOTOS) break;
    add(url);
  }

  return result;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  const normalize = (raw) => {
    if (!raw) return null;
    return {
      id: raw._id || raw.id || "",
      title: raw.title || raw.name || "",
      eventType: raw.eventType || raw.type || "",
      description: raw.description || raw.desc || "",
      price: raw.price || raw.cost || 0,
      rating: raw.rating || raw.avgRating || 0,
      reviews: raw.reviews || raw.reviewCount || 0,
      images: buildImageList(raw),
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
    setActiveImg(0);

    api.get(`/events/${id}`)
      .then((res) => {
        if (!mounted) return;
        if (res.data?.success && res.data?.data) setEvent(normalize(res.data.data));
        else setError("Event not found");
      })
      .catch(() => {
        const found = mockEvents.find((e) => e.id === id || e._id === id);
        if (found) setEvent(normalize(found));
        else setError("Event not found");
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  const openGallery = (index = 0) => { setGalleryStart(index); setGalleryOpen(true); };

  if (loading) return <div className="py-20 text-center text-gray-500">Loading...</div>;
  if (error || !event) return (
    <div className="py-20 text-center">
      <p className="mb-4 text-5xl">🤷</p>
      <p className="text-xl text-gray-600">Event not found</p>
      <Link to="/events" className="inline-block mt-4 text-orange-500">← Back to Events</Link>
    </div>
  );

  const tagColors = {
    birthday: "bg-pink-100 text-pink-700",
    wedding: "bg-rose-100 text-rose-700",
    corporate: "bg-blue-100 text-blue-700",
  };

  return (
    <>
      {galleryOpen && (
        <ImageGallery images={event.images} startIndex={galleryStart} onClose={() => setGalleryOpen(false)} />
      )}

      <div className="max-w-6xl px-4 py-6 mx-auto sm:py-10">
        <Link to="/events" className="flex items-center gap-1 mb-6 text-sm text-orange-500 hover:underline">
          ← Back to Services
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-10">

          {/* ── LEFT: IMAGES ── */}
          <div>
            {/* Hero image */}
            <div
              className="relative rounded-2xl overflow-hidden h-56 sm:h-72 md:h-[360px] bg-gray-100 shadow-lg cursor-pointer group"
              onClick={() => openGallery(activeImg)}
            >
              <img
                src={event.images[activeImg]}
                alt={event.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format";
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center transition-colors bg-black/0 group-hover:bg-black/25">
                <div className="px-4 py-2 text-sm font-semibold text-gray-800 transition-opacity rounded-full shadow opacity-0 group-hover:opacity-100 bg-white/90">
                  🔍 Click to enlarge
                </div>
              </div>
              {/* Badge */}
              <div className="absolute bottom-3 right-3 bg-black/55 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                📷 {event.images.length} photos
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 pb-1 mt-3 overflow-x-auto">
              {event.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i
                      ? "border-orange-500 scale-105 shadow-md"
                      : "border-transparent opacity-55 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>

            {/* View All button */}
            <button
              onClick={() => openGallery(0)}
              className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-sm py-2.5 rounded-xl transition-all"
            >
              <Camera size={18} className="text-black"/> View All {event.images.length} Photos
            </button>
          </div>

          {/* ── RIGHT: DETAILS ── */}
          <div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${tagColors[event.eventType] || "bg-gray-100 text-gray-700"}`}>
              {event.eventType}
            </span>

            <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-800 sm:text-3xl md:text-4xl">
              {event.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-base ${i <= Math.floor(event.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{event.rating}</span>
              <span className="text-xs text-gray-400 sm:text-sm">({event.reviews} reviews)</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
              {event.description}
            </p>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                { label: "Setup Duration", value: event.duration, icon: "⏱️" },
                { label: "Team Size", value: `${event.teamSize} Members`, icon: "👷" },
              ].map((m) => (
                <div key={m.label} className="p-3 border border-gray-100 bg-gray-50 rounded-xl sm:p-4">
                  <p className="mb-1 text-base">{m.icon}</p>
                  <p className="text-xs text-gray-400">{m.label}</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>

            {!event.availability && (
              <div className="flex items-center gap-2 p-3 mt-4 text-sm font-medium text-red-600 border border-red-100 bg-red-50 rounded-xl">
                ⚠️ This package is currently fully booked. Check back soon.
              </div>
            )}

            {/* Price & Book */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Starting from</p>
                <p className="text-3xl font-bold text-orange-500 sm:text-4xl">
                  ₹{event.price.toLocaleString()}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">All inclusive, no hidden charges</p>
              </div>
              {event.availability ? (
                user
                  ? <Button to={`/booking/${event.id}`} variant="primary" size="lg" className="shadow-md shadow-orange-200">Book Now →</Button>
                  : <Button to="/login" variant="primary" size="lg" className="shadow-md shadow-orange-200">Login to Book</Button>
              ) : (
                <Button disabled variant="secondary" size="lg">Unavailable</Button>
              )}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="mt-12">
          <h2 className="mb-5 text-xl font-bold text-gray-800 sm:text-2xl">
            What's Included in this Package
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {event.features.map((f) => (
              <div key={f} className="flex items-center gap-3 p-4 border border-green-100 bg-green-50 rounded-xl">
                <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-600 bg-green-100 rounded-full w-7 h-7">✓</div>
                <span className="text-sm font-medium text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PHOTO GALLERY GRID ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">📸 Event Photos</h2>
            <button
              onClick={() => openGallery(0)}
              className="text-sm font-semibold text-orange-500 hover:underline"
            >
              View all →
            </button>
          </div>

          {/* Bento grid — first photo large, rest fill in */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[160px]">
            {event.images.map((img, i) => (
              <button
                key={i}
                onClick={() => openGallery(i)}
                className={`relative overflow-hidden rounded-2xl bg-gray-100 group ${
                  i === 0 ? "row-span-2 col-span-2 sm:col-span-1" : ""
                }`}
              >
                <img
                  src={img}
                  alt={`Photo ${i + 1}`}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center transition-colors bg-black/0 group-hover:bg-black/35">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    🔍 View
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => openGallery(0)}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 text-sm font-semibold text-gray-500 transition-all border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 rounded-xl"
          >
          <Camera size={18} />
          Open full-screen gallery &nbsp;({event.images.length} photos)
          </button>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="flex flex-col items-center justify-between gap-6 p-6 mt-12 border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl sm:p-8 md:flex-row">
          <div>
            <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Have questions about this package?</h3>
            <p className="mt-1 text-sm text-gray-600">
              Call us: <strong className="text-orange-600">+91 98765 43210</strong> or book directly!
            </p>
          </div>
          {event.availability && (
            user
              ? <Button to={`/booking/${event.id}`} variant="primary" size="md" className="whitespace-nowrap">Book This Package</Button>
              : <Button to="/login" variant="primary" size="md" className="whitespace-nowrap">Login to Book</Button>
          )}
        </div>
      </div>
    </>
  );
}