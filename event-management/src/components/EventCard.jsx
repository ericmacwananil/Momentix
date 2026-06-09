// src/components/EventCard.jsx
// UPDATED: Real images + better hover effects + improved design

import { Link } from "react-router-dom";
import Button from "./Button";

export default function EventCard({ event }) {
  const imageUrl = Array.isArray(event.images) && event.images.length > 0
    ? event.images[0]
    : event.image || null;

  const fallbackImageByType = {
    birthday: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&fit=crop",
    wedding: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop",
    corporate: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
    other: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop",
  };
  const fallbackImage = fallbackImageByType[event.eventType] || fallbackImageByType.other;
  const reviewCount = event.reviews ?? event.reviewCount ?? 0;
  const features = Array.isArray(event.features) ? event.features : [];

  const tagColors = {
    birthday: "bg-pink-100 text-pink-700",
    wedding: "bg-rose-100 text-rose-700",
    corporate: "bg-blue-100 text-blue-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl group">

      {/* Image */}
      {/* ✅ h-44 on mobile, h-48 on sm+ — slightly smaller on tiny screens */}
      <div className="relative flex-shrink-0 overflow-hidden h-44 sm:h-48">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              if (e.target.dataset.fallbackApplied === "true") {
                e.target.style.display = "none";
                return;
              }
              e.target.dataset.fallbackApplied = "true";
              e.target.src = fallbackImage;
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-orange-100 to-orange-200 sm:text-7xl">
            🎉
          </div>
        )}

        {/* Booked Out badge */}
        {!event.availability && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-3 right-3">
            Booked Out
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize backdrop-blur-sm ${tagColors[event.eventType] || tagColors.other}`}>
            {event.eventType}
          </span>
        </div>
      </div>

      {/* Content */}
      {/* ✅ flex flex-col flex-1 so card stretches evenly in a grid row */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="text-sm font-bold leading-snug text-gray-800 transition-colors sm:text-base line-clamp-2 group-hover:text-orange-600">
          {event.title}
        </h3>

        <p className="text-gray-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-sm ${i <= Math.floor(event.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700 sm:text-sm">{event.rating}</span>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>

        {/* Features preview */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {features.slice(0, 3).map((f) => (
            <span key={f} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {f}
            </span>
          ))}
          {features.length > 3 && (
            <span className="text-xs font-medium text-orange-500">+{features.length - 3} more</span>
          )}
        </div>

        {/* ✅ Price + Button — pushed to bottom, flex-wrap so button never overflows */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-auto border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-lg font-bold text-orange-500 sm:text-xl">
              ₹{event.price.toLocaleString()}
            </p>
          </div>
          <Button
            to={`/events/${event._id || event.id}`}
            variant="primary"
            size="sm"
            className="text-xs sm:text-sm"
          >
            View Details →
          </Button>
        </div>
      </div>
    </div>
  );
}