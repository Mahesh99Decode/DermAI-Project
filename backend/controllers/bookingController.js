const db = require("../config/db");

exports.createBooking = (req, res) => {
  const {
    user_id,
    doctor_name,
    specialist_type,
    consultation_mode,
    appointment_date,
    time_slot,
    reason
  } = req.body;

  if (!user_id || !appointment_date || !time_slot) {
    return res.status(400).json({
      success: false,
      message: "Please provide user_id, appointment_date, and time_slot"
    });
  }

  const sql = `
    INSERT INTO bookings 
    (user_id, doctor_name, specialist_type, consultation_mode, appointment_date, time_slot, reason) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user_id,
    doctor_name,
    specialist_type,
    consultation_mode,
    appointment_date,
    time_slot,
    reason
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database Insert Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to book appointment",
        error: err.message
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      bookingId: result.insertId
    });
  });
};

exports.getAllBookings = (req, res) => {
  const sql = `
    SELECT b.*, u.name as patient_name 
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.appointment_date ASC, b.time_slot ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

exports.deleteBooking = (req, res) => {
  const bookingId = req.params.id;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: "Booking ID required" });
  }

  const sql = "DELETE FROM bookings WHERE id = ?";
  
  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error("Database Delete Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel booking",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });
  });
};
