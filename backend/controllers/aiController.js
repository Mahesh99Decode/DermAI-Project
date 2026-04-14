const db = require("../config/db");

exports.analyzeImage = (req, res) => {
  const { user_id, image_url, description } = req.body;

  // Simulate AI Processing Logic
  const conditions = ["Eczema Suspected", "Melanoma (Low Risk)", "Contact Dermatitis", "Psoriasis", "Acne Vulgaris", "Healthy Skin"];
  const prediction = conditions[Math.floor(Math.random() * conditions.length)];
  const confidence = (Math.random() * 20 + 75).toFixed(1); // 75.0% to 95.0%

  // Truncate image_url to save space in the db, avoiding storing mega base64 strings explicitly in this prototype
  const safeImageUrl = image_url ? image_url.substring(0, 100) + '...' : 'No Image';

  const sql = "INSERT INTO reports (user_id, image_url, prediction, confidence) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [user_id || 1, safeImageUrl, prediction, parseFloat(confidence)], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed to create report." });
    }

    res.json({
      success: true,
      prediction,
      confidence,
      report_id: result.insertId
    });
  });
};
