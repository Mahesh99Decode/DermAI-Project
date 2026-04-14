function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const specialization = document.getElementById('signupSpecialization').value.trim();

  // Validate name
  if (!name) {
    alert("Name is required ❌");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    alert("Please enter a valid email address ❌");
    return;
  }

  // Validate password
  if (!password || password.length < 6) {
    alert("Password must be at least 6 characters ❌");
    return;
  }

  // Validate specialization
  if (!specialization) {
    alert("Specialization is required ❌");
    return;
  }

  fetch("http://localhost:5000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password, role: "doctor", specialization })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success || data.message === "User registered successfully") {
        // Auto-login logic
        localStorage.setItem("dermAI_doctorName", name);
        localStorage.setItem("role", "doctor");
        
        alert("Doctor Registration successful! Welcome to the secure dashboard.");
        window.location.href = "doctor.html";
      } else {
        alert("Registration failed: " + (data.message || JSON.stringify(data)));
      }
    })
    .catch(err => {
      console.log(err);
      alert("Server error ❌");
    });
}
