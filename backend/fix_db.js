const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Pass@1234',
  database: 'dermai_db',
  multipleStatements: true
});

const sql = `
  DROP TABLE IF EXISTS bookings;
  CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    doctor_name VARCHAR(100),
    specialist_type VARCHAR(100),
    consultation_mode VARCHAR(50),
    appointment_date DATE,
    time_slot VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

db.query(sql, (err, result) => {
  if (err) {
    console.error("Error formatting database:", err);
  } else {
    console.log("Bookings table recreated successfully with updated schema!");
  }
  process.exit();
});
