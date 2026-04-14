const express = require("express");
const router = express.Router();
const { analyzeImage } = require("../controllers/aiController");

router.post("/analyze", analyzeImage);

module.exports = router;

router.get("/reports", (req, res) => {
  const db = require("../config/db");

  db.query("SELECT * FROM reports", (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});