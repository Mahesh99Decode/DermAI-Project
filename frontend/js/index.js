function goToApp() {
  alert("Redirecting to dashboard...");
  // later: window.location.href = "dashboard.html";
}

// Login button
document.querySelector(".login-btn").addEventListener("click", () => {
 //alert("Open Login Page"); 
  location.href = "user_login.html"; 
});

// Signup button
document.querySelector(".signup-btn").addEventListener("click", () => {
  //alert("Open Signup Page");
  location.href = "user_signup.html";
});