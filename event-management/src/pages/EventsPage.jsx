// At the top of EventsPage.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import EventCard from "../components/EventCard";
import { events as mockData } from "../utils/mockData";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState("default");
  const [type, setType] = useState(searchParams.get("type") || "");

  const sortEvents = (items) => {
    const sorted = [...items];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  };

  const applyFiltersAndSort = (items) => {
    if (!type) return sortEvents(items);
    return sortEvents(items.filter((e) => e.eventType === type));
  };

  const mergeByTitle = (serverEvents, localEvents) => {
    const localByTitle = new Map((localEvents || []).map((e) => [(e.title || "").trim().toLowerCase(), e]));
    const mergedServer = (serverEvents || []).map((e) => {
      const key = (e.title || "").trim().toLowerCase();
      const localMatch = localByTitle.get(key);
      const hasServerImages = Array.isArray(e.images) && e.images.length > 0;
      const hasLocalImages = localMatch && Array.isArray(localMatch.images) && localMatch.images.length > 0;
      return {
        ...(localMatch || {}), ...e,
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

      {/* ✅ Header — removed sticky (conflicts with Navbar) */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-5 mx-auto max-w-7xl sm:py-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">Browse Events</h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">Find the perfect decoration for your special occasion</p>
        </div>
      </div>

      <div className="px-4 py-6 mx-auto max-w-7xl sm:py-8">
        {/* Filters */}
        <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl sm:p-6 sm:mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm bg-white"
              >
                <option value="">All Events</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm bg-white"
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
          <div className="py-16 text-center sm:py-20">
            <div className="w-10 h-10 mx-auto border-4 border-orange-200 rounded-full sm:w-12 sm:h-12 border-t-orange-500 animate-spin"></div>
            <p className="mt-3 text-sm text-gray-500 sm:mt-4 sm:text-base">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center sm:py-20">
            <p className="mb-3 text-4xl">🔍</p>
            <p className="text-lg text-gray-500 sm:text-2xl">No events found</p>
            <p className="mt-2 text-sm text-gray-400 sm:text-base">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}