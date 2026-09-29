const express = require("express");
const router = express.Router();
const { analyzeImage } = require("../controllers/aiController");
const Report = require("../models/Report");

router.post("/analyze", analyzeImage);

router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    return res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const { user_name, image_url, prediction, confidence } = req.body;
    const report = await Report.create({
      user_name,
      image_url,
      prediction,
      confidence,
      Disease_Condition: prediction,
    });

    return res.json({ success: true, message: "Report saved", id: report._id });
  } catch (error) {
    console.error("Error inserting report:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
});

module.exports = router;
