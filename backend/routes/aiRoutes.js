const express = require("express");
const router = express.Router();
const { analyzeImage } = require("../controllers/aiController");

router.post("/analyze", analyzeImage);

module.exports = router;
