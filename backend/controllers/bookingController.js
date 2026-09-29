const Booking = require("../models/BookingDB");

exports.createBooking = async (req, res) => {
  const {
    user_id,
    doctor_name,
    specialist_type,
    consultation_mode,
    appointment_date,
    time_slot,
    reason,
  } = req.body;

  if (!user_id || !appointment_date || !time_slot) {
    return res.status(400).json({
      success: false,
      message: "Please provide user_id, appointment_date, and time_slot",
    });
  }

  try {
    const bookingPayload = {
      user_id: Number(user_id),
      doctorName: doctor_name,
      specialistType: specialist_type,
      consultationMode: consultation_mode,
      appointmentDate: new Date(appointment_date),
      reason,
    };

    if (time_slot.startTime || time_slot.endTime) {
      bookingPayload.timeSlot = {
        startTime: new Date(time_slot.startTime || appointment_date),
        endTime: new Date(time_slot.endTime || appointment_date),
      };
    }

    const booking = await Booking.create(bookingPayload);

    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Database Insert Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ appointmentDate: 1 });
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

exports.deleteBooking = async (req, res) => {
  const bookingId = req.params.id;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: "Booking ID required" });
  }

  try {
    const deleted = await Booking.findByIdAndDelete(bookingId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Database Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};
