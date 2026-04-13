function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const specialization = document.getElementById('signupSpecialization').value;

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
