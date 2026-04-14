const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 🔥 REPLACE HERE
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

app.use("/api", authRoutes);
app.use("/api", aiRoutes);

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});