// src/pages/HomePage.jsx
// UPDATED: Real hero image, testimonials, better sections

import { Link } from "react-router-dom";
import Button from "../components/Button";
import { events } from "../utils/mockData";
import EventCard from "../components/EventCard";

const TESTIMONIALS = [
  {
    name: "Priya Desai",
    event: "Birthday Party",
    text: "Absolutely stunning decoration! The team arrived on time and transformed our hall completely. My daughter was in tears of joy!",
    rating: 5,
    avatar: "https://i.pravatar.cc/60?img=47",
  },
  {
    name: "Arjun Mehta",
    event: "Wedding",
    text: "Best wedding decorator in Gujarat. The royal mandap was beyond our expectations. Every guest was taking photos!",
    rating: 5,
    avatar: "https://i.pravatar.cc/60?img=12",
  },
  {
    name: "Sneha Kapoor",
    event: "Corporate Event",
    text: "Very professional team. They set up our entire conference hall in just half a day. Will definitely book again.",
    rating: 5,
    avatar: "https://i.pravatar.cc/60?img=32",
  },
];

export default function HomePage() {
  const featuredEvents = events.filter(e => e.availability).slice(0, 3);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen sm:min-h-[88vh] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&auto=format&fit=crop&q=80"
          alt="Event decoration"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />

        <div className="relative z-10 flex items-center justify-start w-full px-4 py-16 sm:px-6 md:px-12 lg:px-24 sm:py-20">
          <div className="max-w-2xl text-left">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white uppercase bg-orange-500 rounded-full sm:text-sm sm:mb-5">
              ✨ Gujarat's #1 Event Decorator
            </span>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Your Dream Event,<br />
              <span className="text-orange-400">Perfectly Decorated</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-200 sm:text-base md:text-lg sm:mt-5">
              From intimate birthdays to grand weddings — our expert team handles every detail so you can enjoy every moment.
            </p>

            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:mt-8">
              <Button to="/events" variant="primary" size="md" className="justify-center w-full shadow-lg shadow-orange-500/30 sm:w-auto">
                Browse Services →
              </Button>
              <Button to="/register" variant="secondary" size="md" className="justify-center w-full text-white border bg-white/10 backdrop-blur border-white/30 hover:bg-white/20 sm:w-auto">
                Get Started Free
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8 sm:gap-8 sm:mt-10">
              {[["500+", "Events Done"], ["50+", "Expert Staff"], ["4.9★", "Avg Rating"]].map(([n, l]) => (
                <div key={l}>
                  <p className="text-xl font-bold text-orange-400 sm:text-2xl">{n}</p>
                  <p className="text-xs text-gray-300 sm:text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== EVENT TYPES ===== */}
      <section className="px-4 py-12 bg-white sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">We Decorate Every Occasion</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Choose from our wide range of event packages</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {[
              { type: "Birthday", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop", desc: "Kids & adults parties, baby showers, surprise events", emoji: "🎂", filter: "birthday" },
              { type: "Wedding", image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&auto=format&fit=crop", desc: "Royal mandaps, stage decor, anniversary celebrations", emoji: "💒", filter: "wedding" },
              { type: "Corporate", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop", desc: "Conferences, product launches, office celebrations", emoji: "🏢", filter: "corporate" },
            ].map((item) => (
              <Link
                key={item.type}
                to={`/events?type=${item.filter}`}
                className="relative h-48 overflow-hidden transition-shadow shadow-md cursor-pointer group sm:h-56 rounded-2xl hover:shadow-xl"
              >
                <img src={item.image} alt={item.type} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="mb-1 text-2xl">{item.emoji}</div>
                  <h3 className="text-lg font-bold text-white sm:text-xl">{item.type}</h3>
                  <p className="mt-1 text-xs text-gray-300">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-4 py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">How It Works</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Book your perfect event in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-6">
            {[
              { step: "01", icon: "🔍", title: "Browse Services", desc: "Explore our decoration packages and find your perfect match" },
              { step: "02", icon: "📅", title: "Select Date & Venue", desc: "Pick your event date and enter the venue details" },
              { step: "03", icon: "✅", title: "We Confirm", desc: "Our team reviews and confirms your booking within 24hrs" },
              { step: "04", icon: "🎉", title: "Enjoy Your Event!", desc: "We decorate, you celebrate without any stress" },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-orange-100 z-0" />}
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-xl border-2 border-orange-100 shadow-sm sm:w-16 sm:h-16 rounded-2xl bg-orange-50 sm:text-3xl sm:mb-4">
                    {item.icon}
                  </div>
                  <p className="mb-1 text-xs font-bold text-orange-400">{item.step}</p>
                  <h4 className="text-xs font-bold text-gray-800 sm:text-sm">{item.title}</h4>
                  <p className="hidden mt-1 text-xs leading-relaxed text-gray-500 sm:block">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED EVENTS ===== */}
      <section className="px-4 py-12 bg-white sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-end sm:mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">Popular Packages</h2>
              <p className="mt-1 text-sm text-gray-500 sm:text-base">Most loved by our customers</p>
            </div>
            <Link to="/events" className="hidden text-sm font-semibold text-orange-500 hover:underline md:block sm:text-base">
              View All Packages →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/events" className="font-semibold text-orange-500">View All Packages →</Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="px-4 py-12 sm:py-16 md:py-20 bg-orange-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">What Our Customers Say 💬</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">500+ happy customers across Gujarat</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-5 bg-white border border-orange-100 shadow-sm rounded-2xl sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="object-cover border-2 border-orange-100 rounded-full w-11 h-11 sm:w-12 sm:h-12" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-orange-500">{t.event}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, i) => <span key={i} className="text-base text-yellow-400">★</span>)}
                </div>
                <p className="text-sm leading-relaxed text-gray-600">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative px-4 py-12 overflow-hidden sm:py-20">
        <img
          src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop&q=60"
          alt="celebrate"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-orange-600/85" />
        <div className="relative max-w-xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold sm:text-4xl">Ready to Celebrate? 🎊</h2>
          <p className="mt-3 text-sm text-orange-100 sm:text-lg">Book your event decoration today and get a free consultation!</p>
          <div className="flex flex-col justify-center gap-3 mt-6 sm:flex-row sm:gap-4 sm:mt-8">
            <Button to="/events" variant="primary" size="md" className="!bg-white !text-orange-600 shadow-lg w-full sm:w-auto">
              Browse Packages
            </Button>
            <Button to="/register" variant="secondary" size="md" className="!border-white !text-white w-full sm:w-auto">
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}