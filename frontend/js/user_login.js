function handleLogin(e) {
  e.preventDefault();

  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  // Dummy check for user credentials
  if (email === "user@gmail.com" && password === "pass123") {
    // Extract a mock name or get it from email
    const name = "Alex User";
    localStorage.setItem("dermAI_userName", name);
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials.\n\nHint: Try\nEmail: user@test.com\nPassword: pass123");
  }
}
