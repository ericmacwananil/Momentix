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
    wedding:  "bg-rose-100 text-rose-700",
    corporate:"bg-blue-100 text-blue-700",
    other:    "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-7xl">
            🎉
          </div>
        )}

        {/* Availability badge */}
        {!event.availability && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
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
      <div className="p-5">
        <h3 className="font-bold text-base text-gray-800 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-sm ${i <= Math.floor(event.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{event.rating}</span>
          <span className="text-gray-400 text-xs">({reviewCount})</span>
        </div>

        {/* Features preview */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {features.slice(0, 3).map((f) => (
            <span key={f} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {f}
            </span>
          ))}
          {features.length > 3 && (
            <span className="text-xs text-orange-500 font-medium">+{features.length - 3} more</span>
          )}
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-xl font-bold text-orange-500">₹{event.price.toLocaleString()}</p>
          </div>
          <Button to={`/events/${event._id || event.id}`} variant="primary" size="md" className="text-sm">View Details →</Button>
        </div>
      </div>
    </div>
  );
}