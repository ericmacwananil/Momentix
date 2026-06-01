// At the top of EventsPage.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import EventCard from "../components/EventCard";
import { events as mockData } from "../utils/mockData";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("default");
  const [type, setType] = useState(searchParams.get("type") || "");

  const sortEvents = (items) => {
    const sorted = [...items];
    if (sort === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  };

  const applyFiltersAndSort = (items) => {
    // All Events: show all events
    if (!type) {
      return sortEvents(items);
    }

    // Type selected: show all subevents for that type.
    const filteredEvents = items.filter((e) => e.eventType === type);
    return sortEvents(filteredEvents);
  };

  const mergeByTitle = (serverEvents, localEvents) => {
    const localByTitle = new Map(
      (localEvents || []).map((e) => [
        (e.title || "").trim().toLowerCase(),
        e,
      ])
    );

    const mergedServer = (serverEvents || []).map((e) => {
      const key = (e.title || "").trim().toLowerCase();
      const localMatch = localByTitle.get(key);

      const hasServerImages = Array.isArray(e.images) && e.images.length > 0;
      const hasLocalImages = localMatch && Array.isArray(localMatch.images) && localMatch.images.length > 0;

      // Prefer backend values, but borrow images/reviews/features from local when missing.
      return {
        ...(localMatch || {}),
        ...e,
        images: hasServerImages ? e.images : (hasLocalImages ? localMatch.images : []),
        reviews: e.reviews ?? e.reviewCount ?? localMatch?.reviews ?? 0,
        features: Array.isArray(e.features) && e.features.length > 0 ? e.features : (localMatch?.features || []),
      };
    });

    const seen = new Set(mergedServer.map((e) => (e.title || "").trim().toLowerCase()).filter(Boolean));

    const extras = (localEvents || []).filter((e) => {
      const key = (e.title || "").trim().toLowerCase();
      return key && !seen.has(key);
    });

    return [...mergedServer, ...extras];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const start = Date.now();
      try {
        setLoading(true);
        const res = await api.get("/events");
        const serverEvents = res.data.data || [];
        const mergedEvents = mergeByTitle(serverEvents, mockData);
        setEvents(applyFiltersAndSort(mergedEvents));
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents(applyFiltersAndSort(mockData));
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
        setLoading(false);
      }
    };
    fetchEvents();
  }, [type, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Browse Events</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Find the perfect decoration for your special occasion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Event Type Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm"
              >
                <option value="">All Events</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-block">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-xl sm:text-2xl text-gray-500">No events found</p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}