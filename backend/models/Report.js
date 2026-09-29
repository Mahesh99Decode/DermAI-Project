const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: Number, default: 0 },
    user_name: { type: String, default: "" },
    image_url: { type: String, default: "" },
    prediction: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
    Disease_Condition: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
