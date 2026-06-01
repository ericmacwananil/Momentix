/* =====================================================
   backend/controllers/bookingController.js
   ===================================================== */
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

const createBooking = async (req, res) => {
  try {
    const { eventId, eventDate, venueAddress, notes, userId, customerName, customerPhone } = req.body;
    console.log(`📝 Creating booking with data:`, { eventId, eventDate, venueAddress, notes, userId });

    const eventCatalog = {
      "1": {
        title: "Premium Birthday Balloon Decor",
        eventType: "birthday",
        description: "Transform any space into a magical birthday paradise. Includes 200+ balloons, LED lights, personalized banner, and flower arrangements.",
        price: 4999,
      },
      "2": {
        title: "Royal Wedding Stage Decor",
        eventType: "wedding",
        description: "Luxury wedding decoration with royal mandap, floral stage, LED lighting, and premium draping.",
        price: 49999,
      },
      "3": {
        title: "Corporate Event Setup",
        eventType: "corporate",
        description: "Professional corporate event decoration with stage, backdrop, branding elements, and premium seating.",
        price: 24999,
      },
      "4": {
        title: "Baby Shower Decoration",
        eventType: "birthday",
        description: "Sweet and adorable baby shower setup with pastel balloons, cute photo props, dessert table display.",
        price: 3999,
      },
      "5": {
        title: "Anniversary Gold Theme Decor",
        eventType: "wedding",
        description: "Elegant gold and white anniversary decoration with floral centerpieces and candle lighting.",
        price: 12999,
      },
      "6": {
        title: "Kids Birthday Party Package",
        eventType: "birthday",
        description: "Super fun kids party with themed decorations, cartoon characters setup, game zone, and colorful balloons.",
        price: 5999,
      },
    };

    const resolvedEventId = mongoose.Types.ObjectId.isValid(eventId)
      ? eventId
      : null;

    let eventDoc = resolvedEventId ? await Event.findById(resolvedEventId) : null;
    if (!eventDoc && eventCatalog[eventId]) {
      eventDoc = await Event.findOne({ title: eventCatalog[eventId].title });
      if (!eventDoc) {
        eventDoc = await Event.create(eventCatalog[eventId]);
      }
    }

    if (!eventDoc) {
      return res.status(404).json({ message: "Selected event was not found in MongoDB" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required to create a booking" });
    }

    const booking = await Booking.create({
      userId,
      eventId: eventDoc._id,
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "",
      eventDate: new Date(eventDate),
      venueAddress,
      notes: notes || "",
      remarks: "",
      price: eventDoc.price,
      status: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("eventId", "title eventType images")
      .populate("userId", "name phone")
      .populate("assignedMember", "name phone");

    console.log(`✅ Booking created in MongoDB:`, populatedBooking._id);
    
    res.status(201).json({ success: true, data: populatedBooking });
  } catch (e) { 
    console.error(`❌ Booking Error:`, e.message);
    res.status(500).json({ message: e.message }); 
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`📱 Fetching bookings for user: ${userId}`);

    const bookings = await Booking.find({ userId })
      .populate("eventId","title eventType images")
      .populate("assignedMember","name phone")
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);
    res.json({ success: true, data: bookings });
  } catch (e) { 
    console.error(`❌ Error fetching bookings:`, e.message);
    res.status(500).json({ message: e.message }); 
  }
};
 
const getAssignedBookings = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await require("../models/User").findById(userId).select("name");
    const matchValues = [userId];
    if (user?.name) matchValues.push(user.name);

    console.log(`👤 Fetching assigned tasks for team member: ${userId}`, matchValues);

    const bookings = await Booking.find({ assignedMember: { $in: matchValues } })
      .populate("eventId","title eventType")
      .populate("userId","name phone")
      .sort({ eventDate: 1 });
    
    console.log(`✅ Found ${bookings.length} assigned tasks`);
    res.json({ success: true, data: bookings });
  } catch (e) { 
    console.error(`❌ Error fetching tasks:`, e.message);
    res.status(500).json({ message: e.message }); 
  }
};
 
const getAllBookings = async (req, res) => {
  try {
    console.log(`👑 Fetching all bookings for admin`);

    const bookings = await Booking.find()
      .populate("eventId","title eventType price")
      .populate("userId","name email phone")
      .populate("assignedMember","name phone")
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${bookings.length} total bookings`);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (e) { 
    console.error(`❌ Error fetching all bookings:`, e.message);
    res.status(500).json({ message: e.message }); 
  }
};
 
const updateBookingStatus = async (req, res) => {
  try {
    const { status, assignedMember, remarks } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status,
        ...(assignedMember !== undefined && { assignedMember }),
        ...(remarks !== undefined && { remarks }),
      },
      { new: true }
    ).populate("userId","name phone").populate("eventId","title").populate("assignedMember","name");
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
 
const cancelBooking = async (req, res) => {
  try {
    const { userId } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const bookingUserId = booking.userId?.toString?.() || String(booking.userId || "");
    if (bookingUserId !== userId && req.body.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    if (booking.status === "completed")
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    
    booking.status = "cancelled";
    booking.cancelledBy = req.body.role === "admin" ? "admin" : "customer";
    booking.updatedAt = new Date();
    await booking.save();
    console.log(`✅ Booking cancelled:`, booking._id);
    res.json({ success: true, message: "Booking cancelled", data: booking });
  } catch (e) { 
    console.error(`❌ Cancel error:`, e.message);
    res.status(500).json({ message: e.message }); 
  }
};
 
module.exports = { createBooking, getMyBookings, getAssignedBookings, getAllBookings, updateBookingStatus, cancelBooking };