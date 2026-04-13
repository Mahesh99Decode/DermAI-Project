const db = require("../config/db");

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.send(err);

    if (result.length > 0) {
      res.json({
        success: true,
        user: result[0]
      });
    } else {
      res.json({
        success: false,
        message: "Invalid credentials"
      });
    }
  });
};

exports.register = (req, res) => {
  const { name, email, password, role } = req.body;
  // Fallback for Doctor specialization can be added directly to the query if the db schema has the column
  // For now, securely inserting standard required columns

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.json({ success: false, message: "Email already exists" });
      }
      return res.status(500).json({ success: false, message: "Database Error: " + err.message, error: err });
    }

    res.json({
      success: true,
      message: "User registered successfully",
      insertId: result.insertId
    });
  });
};