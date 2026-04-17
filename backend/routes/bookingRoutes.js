const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Booking routes
router.post("/bookings", bookingController.createBooking);

module.exports = router;
