const db = require("../config/db");

exports.analyzeImage = async (req, res) => {
  const { user_id, image_url } = req.body;

  try {
    // Dynamic import for node-fetch to avoid require issues if it's an ES module
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // Call the Python AI model running on port 5001
    const pythonResponse = await fetch("http://localhost:5001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url })
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      throw new Error(`Python API error: ${pythonResponse.status} ${errorText}`);
    }

    const aiData = await pythonResponse.json();
    
    if (aiData.error) {
      throw new Error(`Model Error: ${aiData.error}`);
    }

    const predictedDisease = aiData.disease;
    const confidence = aiData.confidence;

    const sql = `
      INSERT INTO reports (user_id, image_url, prediction, confidence)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [user_id || 1, image_url || "", predictedDisease, confidence],
      (err, resultDB) => {
        if (err) {
          console.error("Database tracking error:", err);
          return res.status(500).json({ success: false, message: "Database Error" });
        }

        res.json({
          success: true,
          prediction: predictedDisease,
          confidence: confidence,
          report_id: resultDB.insertId,
        });
      }
    );
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Analysis failed",
    });
  }
};