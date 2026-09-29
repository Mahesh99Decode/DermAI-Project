const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
      maxlength: 30,
      trim: true,
    },
    specialistType: {
      type: String,
      trim: true,
    },
    consultationMode: {
      type: String,
      required: true,
      maxlength: 30,
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
