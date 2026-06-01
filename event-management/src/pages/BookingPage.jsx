// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { events as mockEvents } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import Button from "../components/Button";
import api from "../utils/api";

// Multi-step booking form — 3 steps
export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useBooking();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    eventDate: "",
    venueAddress: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const normalize = (raw) => {
    if (!raw) return null;
    return {
      id: raw._id || raw.id || "",
      title: raw.title || raw.name || "",
      eventType: raw.eventType || raw.type || "",
      price: raw.price || raw.cost || 0,
      images: Array.isArray(raw.images) && raw.images.length ? raw.images : (raw.image ? [raw.image] : []),
      description: raw.description || raw.desc || "",
      features: raw.features || [],
      duration: raw.duration || "",
      teamSize: raw.teamSize || 0,
      availability: typeof raw.availability === "boolean" ? raw.availability : true,
    };
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    api.get(`/events/${id}`)
      .then((res) => {
        if (!mounted) return;
        if (res.data?.success && res.data?.data) {
          setEvent(normalize(res.data.data));
          return;
        }
        throw new Error("Event not found");
      })
      .catch(() => {
        const found = mockEvents.find((e) => e.id === id || e._id === id);
        if (mounted && found) setEvent(normalize(found));
        else if (mounted) setError("Event not found");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">Loading booking details...</div>;
  }

  if (!event || error) return <p className="text-center py-20 text-gray-600">Event not found</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirm = async () => {
    console.log(`📝 Creating booking for user: ${user.name} (ID: ${user._id})`);
    
    const bookingData = {
      userId: user._id,
      customerName: user.name,
      customerPhone: user.phone || "",
      eventId: event.id,
      eventDate: new Date(form.eventDate),
      venueAddress: form.venueAddress,
      notes: form.notes,
    };
    
    console.log(`📤 Sending to backend:`, bookingData);
    
    try {
      const result = await addBooking(bookingData);
      console.log(`✅ Booking saved to MongoDB:`, result);
      setSubmitted(true);
    } catch (err) {
      console.error(`❌ Booking failed:`, err.message);
      alert("Failed to create booking. Please try again.");
    }
  };

  // Minimum date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-6xl sm:text-7xl mb-3 sm:mb-4">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">Your booking request has been received. We'll confirm within 24 hours.</p>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="primary"
          size="lg"
          className="mt-6 sm:mt-8"
        >
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Book Your Event</h1>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-1 sm:gap-2 flex-1">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              step >= s ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {s}
            </div>
            <div className={`text-xs font-medium hidden sm:block ${step >= s ? "text-orange-500" : "text-gray-400"}`}>
              {s === 1 ? "Details" : s === 2 ? "Venue" : "Confirm"}
            </div>
            {s < 3 && <div className={`h-1 flex-1 rounded ${step > s ? "bg-orange-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        {/* STEP 1: Date & Event info */}
        {step === 1 && (
          <div>
            <h2 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-800">Select Event Date</h2>
            
            {/* Selected Package Summary */}
            <div className="bg-orange-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 border border-orange-100">
              <p className="text-orange-700 font-semibold text-sm sm:text-base">{event.title}</p>
              <p className="text-orange-500 font-bold text-lg sm:text-xl mt-1">₹{event.price.toLocaleString()}</p>
            </div>

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Event Date *</label>
            <input
              type="date"
              name="eventDate"
              min={minDate}
              value={form.eventDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-sm"
            />

            <Button
              onClick={() => form.eventDate && setStep(2)}
              disabled={!form.eventDate}
              variant="primary"
              size="full"
              className="mt-4 sm:mt-6"
            >
              Next: Venue Details →
            </Button>
          </div>
        )}

        {/* STEP 2: Venue */}
        {step === 2 && (
          <div>
            <h2 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-800">Venue Details</h2>

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Venue Address *</label>
            <textarea
              name="venueAddress"
              value={form.venueAddress}
              onChange={handleChange}
              rows={3}
              placeholder="Enter full venue address where decoration is needed..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-sm"
            />

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 mt-3 sm:mt-4">Special Notes (Optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any special requests or instructions..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-400 text-sm"
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button onClick={() => setStep(1)} variant="secondary" size="md" className="flex-1">← Back</Button>
              <Button onClick={() => form.venueAddress && setStep(3)} disabled={!form.venueAddress} variant="primary" size="md" className="flex-1">Review Booking →</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-800">Review & Confirm</h2>

            <div className="space-y-2 sm:space-y-3">
              {[
                { label: "Package", value: event.title },
                { label: "Event Date", value: form.eventDate },
                { label: "Venue", value: form.venueAddress },
                { label: "Customer", value: user.name },
                { label: "Phone", value: user.phone || "Not provided" },
                { label: "Total Amount", value: `₹${event.price.toLocaleString()}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 sm:py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm">{item.label}</span>
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm text-right max-w-xs">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button onClick={() => setStep(2)} variant="secondary" size="md" className="flex-1">← Back</Button>
              <Button onClick={handleConfirm} variant="success" size="md" className="flex-1">✓ Confirm Booking</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}