const { connectDB } = require("./config/db");

connectDB();

module.exports = { connectDB };