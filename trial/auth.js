// ROLE SWITCH (User / Doctor)
let currentRole = "user";

function switchRole(role) {
  currentRole = role;

  document.querySelectorAll(".role-toggle button").forEach(btn =>
    btn.classList.remove("active")
  );

  event.target.classList.add("active");

  document.getElementById("loginTitle").innerText =
    role === "doctor" ? "Doctor Login" : "User Login";

  document.getElementById("signupTitle").innerText =
    role === "doctor"
      ? "Create Doctor Account"
      : "Create User Account";
}

// FORM SWITCH (Login / Signup)
function switchForm(type) {
  document.querySelectorAll(".form-toggle button").forEach(btn =>
    btn.classList.remove("active")
  );

  event.target.classList.add("active");

  document.getElementById("loginForm").classList.toggle("active-form", type === "login");
  document.getElementById("signupForm").classList.toggle("active-form", type === "signup");
}

// HANDLE LOGIN
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert(currentRole + " logged in!");
});

// HANDLE SIGNUP
document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert(currentRole + " account created!");
});