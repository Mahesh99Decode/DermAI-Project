const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Booking routes
router.post("/bookings", bookingController.createBooking);
router.get("/bookings", bookingController.getAllBookings);
router.delete("/bookings/:id", bookingController.deleteBooking);

module.exports = router;
