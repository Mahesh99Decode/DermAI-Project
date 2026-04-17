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
