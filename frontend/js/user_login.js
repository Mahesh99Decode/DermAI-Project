function handleLogin(e) {
  e.preventDefault();

  const email = e.target.querySelector('input[type="email"]').value.trim();
  const password = e.target.querySelector('input[type="password"]').value;

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

  fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {

      // ✅ Check user role
      if (data.success && data.user.role === "user") {

        localStorage.setItem("dermAI_userName", data.user.name);
        localStorage.setItem("role", "user");

        window.location.href = "dashboard.html";

      } else {
        alert("Invalid User credentials ❌");
      }

    })
    .catch(err => {
      console.log(err);
      alert("Server error ❌");
    });
}
