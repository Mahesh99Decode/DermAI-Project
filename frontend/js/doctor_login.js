function handleLogin(e) {
  e.preventDefault();

  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  // Dummy check for doctor credentials
  if (email === "doctor@gmail.com" && password === "pass123") {
    const name = "Dr. Emily Smith";
    localStorage.setItem("dermAI_doctorName", name);
    window.location.href = "doctor.html";
  } else {
    alert("Invalid credentials.\n\nHint: Try\nEmail: doctor@test.com\nPassword: pass123");
  }
}
