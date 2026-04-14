const db = require("../config/db");
const fetch = require("node-fetch");
const fs = require("fs");

exports.analyzeImage = async (req, res) => {
  const { user_id, image_url } = req.body;

  try {
    // Convert image to base64 (if local)
    const imageBase64 = fs.readFileSync(image_url, {
      encoding: "base64",
    });

    // 🔥 Gemini Vision API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this skin image and identify possible skin condition. Also give summary and recommendation.",
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No result";

    // 🔥 Save in DB
    const sql = `
      INSERT INTO reports (user_id, image_url, description)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [user_id || 1, image_url, resultText], (err, resultDB) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      res.json({
        success: true,
        analysis: resultText,
        report_id: resultDB.insertId,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gemini API failed",
    });
  }
};