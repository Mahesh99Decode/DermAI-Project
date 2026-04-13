function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  fetch("http://localhost:5000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password, role: "user" })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success || data.message === "User registered successfully") {
        // Auto-login logic
        localStorage.setItem("dermAI_userName", name);
        localStorage.setItem("role", "user");
        
        alert("Registration successful! Redirecting to your dashboard...");
        window.location.href = "dashboard.html";
      } else {
        alert("Registration failed: " + (data.message || JSON.stringify(data)));
      }
    })
    .catch(err => {
      console.log(err);
      alert("Server error ❌");
    });
}
