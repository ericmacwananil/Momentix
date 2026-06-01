// src/context/BookingContext.jsx
import { createContext, useContext, useState } from "react";
import api from "../utils/api";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);

  const fetchMyBookings = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const res = await api.post("/bookings/my-bookings", { userId: user?._id });
    setBookings(res.data.data);
  };

  const fetchAllBookings = async () => {
    const res = await api.get("/bookings");
    setBookings(res.data.data);
  };

  const fetchAssignedBookings = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const res = await api.post("/bookings/my-tasks", { userId: user?._id });
    setBookings(res.data.data);
  };

  const addBooking = async (bookingData) => {
    const res = await api.post("/bookings", bookingData);
    return res.data.data;
  };

  const updateStatus = async (bookingId, status, assignedMember = null) => {
    const body = { status };
    if (assignedMember) body.assignedMember = assignedMember;
    await api.put(`/bookings/${bookingId}/status`, body);
    fetchAllBookings();
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      fetchMyBookings,
      fetchAllBookings,
      fetchAssignedBookings,
      addBooking,
      updateStatus,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}