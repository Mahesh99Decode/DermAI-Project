CREATE DATABASE dermai_db;
USE dermai_db;

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100),
  role ENUM('user','doctor')
);
INSERT INTO users (name, email, password, role)
VALUES 
('Mahesh', 'user@gmail.com', '1234', 'user'),
('Dr Smith', 'doctor@gmail.com', '1234', 'doctor');

-- DOCTORS
CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  specialization VARCHAR(100)
);
INSERT INTO doctors (name, email, specialization)
VALUES ('Dr Smith', 'doctor@gmail.com', 'MBBS');

-- REPORTS
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  image_url TEXT,
  prediction VARCHAR(100),
  confidence FLOAT
);

-- BOOKINGS
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  doctor_id INT,
  appointment_date DATETIME
);

SELECT * FROM users;
SELECT * FROM doctors;


/*
http://localhost:5000/test-users

*/