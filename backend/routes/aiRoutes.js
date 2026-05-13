const express = require("express");
const router = express.Router();
const { analyzeImage } = require("../controllers/aiController");
const db = require("../config/db");

router.post("/analyze", analyzeImage);

router.get("/reports", (req, res) => {
  db.query("SELECT * FROM reports", (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

router.post("/reports", (req, res) => {
  const { user_name, image_url, prediction, confidence } = req.body;
  const sql = "INSERT INTO reports (Name, image_url, Disease_Condition, confidence) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [user_name, image_url, prediction, confidence], (err, result) => {
    if (err) {
      console.error("Error inserting report:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, message: "Report saved", id: result.insertId });
  });
});

module.exports = router;
