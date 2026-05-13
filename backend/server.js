require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ ROOT ROUTE (ADD THIS)
app.get("/", (req, res) => {
  res.send("Aura Derm Backend Running 🚀");
});

// test route
app.get("/test-users", (req, res) => {
  console.log("Route hit");

  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// routes
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const bookingRoutes = require("./routes/bookingRoutes"); // Add routing

app.use("/api", authRoutes);
app.use("/api", aiRoutes);
app.use("/api", bookingRoutes); // Mount booking endpoints

const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});