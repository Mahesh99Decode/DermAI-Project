// function handleLogin(e) {
//   e.preventDefault();

//   const email = e.target.querySelector('input[type="email"]').value;
//   const password = e.target.querySelector('input[type="password"]').value;

//   // Dummy check for doctor credentials
//   if (email === "doctor@gmail.com" && password === "pass123") {
//     const name = "Dr. Emily Smith";
//     localStorage.setItem("dermAI_doctorName", name);
//     window.location.href = "doctor.html";
//   } else {
//     alert("Invalid credentials.\n\nHint: Try\nEmail: doctor@test.com\nPassword: pass123");
//   }
// }

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

      // ✅ Check doctor role
      if (data.success && data.user.role === "doctor") {

        localStorage.setItem("dermAI_doctorName", data.user.name);
        localStorage.setItem("role", "doctor");

        window.location.href = "doctor.html";

      } else {
        alert("Invalid Doctor credentials ❌");
      }

    })
    .catch(err => {
      console.log(err);
      alert("Server error ❌");
    });
}
