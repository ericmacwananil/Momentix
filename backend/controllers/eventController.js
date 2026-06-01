
/* =====================================================
   backend/controllers/eventController.js
   ===================================================== */
const Event = require("../models/Event");

const fallbackImagesByTitle = {
  "premium birthday balloon decor": [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop",
  ],
  "royal wedding stage decor": [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop",
  ],
  "corporate event setup": [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
  ],
  "baby shower decoration": [
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop",
  ],
  "anniversary gold theme decor": [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop",
  ],
  "kids birthday party package": [
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&fit=crop",
  ],
};

const fallbackImageByType = {
  birthday: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&fit=crop",
  wedding: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop",
  corporate: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
};

const enrichEventImages = (event) => {
  const plain = event && typeof event.toObject === "function" ? event.toObject() : event;
  if (!plain) return plain;

  const hasImages = Array.isArray(plain.images) && plain.images.length > 0;
  if (hasImages) return plain;

  const titleKey = (plain.title || "").trim().toLowerCase();
  const imagesFromTitle = fallbackImagesByTitle[titleKey];
  const imagesFromType = fallbackImageByType[plain.eventType] ? [fallbackImageByType[plain.eventType]] : [];

  return {
    ...plain,
    images: imagesFromTitle || imagesFromType,
  };
};

// Mock data for when MongoDB is unavailable
const mockEvents = [
  {
    _id: "1",
    title: "Premium Birthday Balloon Decor",
    eventType: "birthday",
    description: "Transform any space into a magical birthday paradise. Includes 200+ balloons, LED lights, personalized banner, and flower arrangements.",
    price: 4999,
    rating: 4.8,
    reviewCount: 124,
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop",
    ],
    features: ["200+ Balloons", "LED Lights", "Custom Banner", "Flower Arch", "Photo Backdrop"],
    duration: "3-4 hours",
    teamSize: 3,
    availability: true,
  },
  {
    _id: "2",
    title: "Royal Wedding Stage Decor",
    eventType: "wedding",
    description: "Luxury wedding decoration with royal mandap, floral stage, LED lighting, and premium draping.",
    price: 49999,
    rating: 4.9,
    reviewCount: 87,
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop",
    ],
    features: ["Royal Mandap", "Floral Stage", "LED Lighting", "Premium Draping", "Flower Shower"],
    duration: "1 day",
    teamSize: 8,
    availability: true,
  },
  {
    _id: "3",
    title: "Corporate Event Setup",
    eventType: "corporate",
    description: "Professional corporate event decoration with stage, backdrop, branding elements, and premium seating.",
    price: 24999,
    rating: 4.7,
    reviewCount: 56,
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
    ],
    features: ["Stage Setup", "Branded Backdrop", "Premium Seating", "AV Support", "Registration Desk"],
    duration: "Half day",
    teamSize: 5,
    availability: true,
  },
  {
    _id: "4",
    title: "Baby Shower Decoration",
    eventType: "birthday",
    description: "Sweet and adorable baby shower setup with pastel balloons, cute photo props, dessert table display.",
    price: 3999,
    rating: 4.6,
    reviewCount: 43,
    images: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop",
    ],
    features: ["Pastel Balloons", "Photo Props", "Dessert Table", "Welcome Banner", "Diaper Cake"],
    duration: "2-3 hours",
    teamSize: 2,
    availability: true,
  },
  {
    _id: "5",
    title: "Anniversary Gold Theme Decor",
    eventType: "wedding",
    description: "Elegant gold and white anniversary decoration with floral centerpieces and candle lighting.",
    price: 12999,
    rating: 4.8,
    reviewCount: 91,
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop",
    ],
    features: ["Gold Balloon Arch", "Floral Centerpieces", "Candle Lighting", "Table Setup", "Couple Frame"],
    duration: "4-5 hours",
    teamSize: 4,
    availability: true,
  },
  {
    _id: "6",
    title: "Kids Birthday Party Package",
    eventType: "birthday",
    description: "Super fun kids party with themed decorations, cartoon characters setup, game zone, and colorful balloons.",
    price: 5999,
    rating: 4.9,
    reviewCount: 210,
    images: [
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&fit=crop",
    ],
    features: ["Theme Decorations", "Cartoon Characters", "Game Zone", "Balloon Art", "Birthday Crown"],
    duration: "3-4 hours",
    teamSize: 4,
    availability: true,
  },
];
 
const getAllEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventType) filter.eventType = req.query.eventType;
    let sort = {};
    if (req.query.sort === "price-low")  sort = { price:  1 };
    if (req.query.sort === "price-high") sort = { price: -1 };
    if (req.query.sort === "rating")     sort = { rating:-1 };
    
    let events;
    try {
      events = await Event.find(filter).sort(sort);
      events = events.map(enrichEventImages);
    } catch {
      // Use mock data if MongoDB fails
      events = mockEvents;
      if (filter.eventType) events = events.filter(e => e.eventType === filter.eventType);
      if (sort.price === 1) events = events.sort((a, b) => a.price - b.price);
      if (sort.price === -1) events = events.sort((a, b) => b.price - a.price);
      if (sort.rating === -1) events = events.sort((a, b) => b.rating - a.rating);
    }
    
    res.json({ success: true, count: events.length, data: events.map(enrichEventImages) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
 
const getEventById = async (req, res) => {
  try {
    let event;
    try {
      event = await Event.findById(req.params.id);
      event = enrichEventImages(event);
    } catch {
      // Use mock data if MongoDB fails
      event = mockEvents.find(e => e._id === req.params.id);
    }
    
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
 
const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (e) { res.status(400).json({ message: e.message }); }
};
 
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (e) { res.status(400).json({ message: e.message }); }
};
 
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ success: true, message: "Event deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
 
module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
 