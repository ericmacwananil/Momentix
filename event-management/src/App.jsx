// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminTeamPage from "./pages/AdminTeamPage";
import AdminManageEventsPage from "./pages/AdminManageEventsPage";
import TeamDashboard from "./pages/TeamDashboard";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideFooter =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    isAdminRoute;

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/"           element={<HomePage />} />
          <Route path="/events"     element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />

          {/* Protected — customer */}
          <Route path="/booking/:id" element={
            <PrivateRoute><BookingPage /></PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><CustomerDashboard /></PrivateRoute>
          } />

          {/* Protected — admin */}
          <Route path="/admin" element={
            <PrivateRoute role="admin"><AdminEventsPage /></PrivateRoute>
          } />
          <Route path="/admin/team" element={
            <PrivateRoute role="admin"><AdminTeamPage /></PrivateRoute>
          } />
          <Route path="/admin/events" element={
            <PrivateRoute role="admin"><AdminManageEventsPage /></PrivateRoute>
          } />

          {/* Protected — team member */}
          <Route path="/team" element={
            <PrivateRoute role="team_member"><TeamDashboard /></PrivateRoute>
          } />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}