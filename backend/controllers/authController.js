const User = require("../models/User");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.json({ success: false, message: "Invalid email format" });
  }

  if (!password || !validatePassword(password)) {
    return res.json({ success: false, message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ email, password }).lean();

    if (user) {
      return res.json({ success: true, user });
    }

    return res.json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Name, email, and password are required" });
  }

  if (!validateEmail(email)) {
    return res.json({ success: false, message: "Invalid email format" });
  }

  if (!validatePassword(password)) {
    return res.json({ success: false, message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};