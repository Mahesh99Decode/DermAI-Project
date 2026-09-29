const Report = require("../models/Report");

exports.analyzeImage = async (req, res) => {
  const { user_id, image_url } = req.body;

  try {
    const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

    const pythonResponse = await fetch("https://dermai-project.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url }),
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

    const report = await Report.create({
      user_id: user_id || 1,
      image_url: image_url || "",
      prediction: predictedDisease,
      confidence,
      Disease_Condition: predictedDisease,
    });

    return res.json({
      success: true,
      prediction: predictedDisease,
      confidence,
      report_id: report._id,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Analysis failed",
    });
  }
};
