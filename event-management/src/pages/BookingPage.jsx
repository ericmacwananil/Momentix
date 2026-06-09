// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { events as mockEvents } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import Button from "../components/Button";
import api from "../utils/api";
import { loadRazorpay } from "../utils/loadRazorpay";


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
    return <div className="max-w-2xl px-4 py-20 mx-auto text-center text-gray-500">Loading booking details...</div>;
  }

  if (!event || error) return <p className="py-20 text-center text-gray-600">Event not found</p>;

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

    // 1) Create booking first (current behavior)
    let createdBooking;
    try {
      const result = await addBooking(bookingData);
      createdBooking = result;
      console.log(`✅ Booking saved to MongoDB:`, result);
    } catch (err) {
      console.error(`❌ Booking failed:`, err.message);
      alert("Failed to create booking. Please try again.");
      return;
    }

    // 2) Open Razorpay checkout
    try {
      const amount = Number(event?.price || 0);
      if (!amount || amount <= 0) throw new Error("Invalid amount for payment");

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) throw new Error("Failed to load Razorpay checkout script");
      if (!window.Razorpay) throw new Error("Razorpay not available on window");

      // backend will create an order with amount in paise
      const { data } = await api.post("/payments/create-order", { amount });


      if (!data?.success || !data?.order?.id) throw new Error(data?.message || "Failed to create Razorpay order");

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || window.RAZORPAY_KEY_ID || "" ,
        amount: order.amount,
        currency: order.currency,
        name: "Momentix",
        description: `Event booking: ${event.title}`,
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          contact: user?.phone || "",
          email: user?.email || "",
        },
        notes: {
          bookingId: createdBooking?._id || "",
        },
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: createdBooking?._id,
            });

            if (!verifyRes.data?.success) {
              throw new Error(verifyRes.data?.message || "Payment verification failed");
            }

            console.log("✅ Payment verified");
            setSubmitted(true);
          } catch (verifyErr) {
            console.error("❌ Payment verification failed:", verifyErr?.message || verifyErr);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            // Don’t mark as submitted if payment is not completed
            console.log("Razorpay modal dismissed");
          },
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    } catch (err) {
      console.error("❌ Razorpay error:", err.message);
      alert(err.message || "Payment failed. Please try again.");
    }
  };


  // Minimum date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="max-w-lg px-4 py-12 mx-auto text-center sm:py-20">
        <div className="mb-3 text-6xl sm:text-7xl sm:mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Booking Confirmed!</h2>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">Your booking request has been received. We'll confirm within 24 hours.</p>
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
    <div className="max-w-2xl px-4 py-6 mx-auto sm:py-10">
      <h1 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl sm:mb-6">Book Your Event</h1>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-1 mb-6 sm:gap-2 sm:mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 gap-1 sm:gap-2">
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

      <div className="p-4 bg-white shadow-md rounded-2xl sm:p-6">
        {/* STEP 1: Date & Event info */}
        {step === 1 && (
          <div>
            <h2 className="mb-3 text-base font-bold text-gray-800 sm:text-lg sm:mb-4">Select Event Date</h2>
            
            {/* Selected Package Summary */}
            <div className="p-3 mb-4 border border-orange-100 rounded-lg bg-orange-50 sm:p-4 sm:mb-5">
              <p className="text-sm font-semibold text-orange-700 sm:text-base">{event.title}</p>
              <p className="mt-1 text-lg font-bold text-orange-500 sm:text-xl">₹{event.price.toLocaleString()}</p>
            </div>

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Event Date *</label>
            <input
              type="date"
              name="eventDate"
              min={minDate}
              value={form.eventDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-orange-400"
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
            <h2 className="mb-3 text-base font-bold text-gray-800 sm:text-lg sm:mb-4">Venue Details</h2>

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Venue Address *</label>
            <textarea
              name="venueAddress"
              value={form.venueAddress}
              onChange={handleChange}
              rows={3}
              placeholder="Enter full venue address where decoration is needed..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-orange-400"
            />

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 mt-3 sm:mt-4">Special Notes (Optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any special requests or instructions..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-orange-400"
            />

            <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:gap-3 sm:mt-6">
              <Button onClick={() => setStep(1)} variant="secondary" size="md" className="flex-1">← Back</Button>
              <Button onClick={() => form.venueAddress && setStep(3)} disabled={!form.venueAddress} variant="primary" size="md" className="flex-1">Review Booking →</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="mb-3 text-base font-bold text-gray-800 sm:text-lg sm:mb-4">Review & Confirm</h2>

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
                  <span className="text-xs text-gray-500 sm:text-sm">{item.label}</span>
                  <span className="max-w-xs text-xs font-semibold text-right text-gray-800 sm:text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:gap-3 sm:mt-6">
              <Button onClick={() => setStep(2)} variant="secondary" size="md" className="flex-1">← Back</Button>
              <Button onClick={handleConfirm} variant="success" size="md" className="flex-1">✓ Confirm Booking</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}