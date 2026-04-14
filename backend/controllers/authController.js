const db = require("../config/db");

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation function (min 6 chars)
const validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  if (!email || !validateEmail(email)) {
    return res.json({
      success: false,
      message: "Invalid email format"
    });
  }

  // Validate password
  if (!password || !validatePassword(password)) {
    return res.json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

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

  // Validate required fields
  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "Name, email, and password are required"
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.json({
      success: false,
      message: "Invalid email format"
    });
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return res.json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  // Check if email already exists
  const checkSql = "SELECT * FROM users WHERE email=?";
  db.query(checkSql, [email], (err, result) => {
    if (err) return res.send(err);

    if (result.length > 0) {
      return res.json({
        success: false,
        message: "Email already registered"
      });
    }

    // Insert new user
    const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [name, email, password, role || "user"], (err, result) => {
      if (err) return res.send(err);

      res.json({
        success: true,
        message: "User registered successfully"
      });
    });
  });
};