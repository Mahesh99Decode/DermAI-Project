function handleLogin(e) {
  e.preventDefault();

  alert("Login successful!");
  window.location.href = "dashboard.html";
}

//*/


let role = "User";
let mode = "login";

// Elements
const userBtn = document.getElementById("userBtn");
const doctorBtn = document.getElementById("doctorBtn");
const title = document.getElementById("title");
const submitBtn = document.getElementById("submitBtn");
const switchText = document.getElementById("switchText");
const form = document.getElementById("authForm");

// ROLE SWITCH
userBtn.addEventListener("click", () => setRole("User"));
doctorBtn.addEventListener("click", () => setRole("Doctor"));

function setRole(r) {
  role = r;

  userBtn.classList.remove("active");
  doctorBtn.classList.remove("active");

  if (r === "User") {
    userBtn.classList.add("active");
  } else {
    doctorBtn.classList.add("active");
  }

  updateUI();
}

// LOGIN / SIGNUP SWITCH
switchText.addEventListener("click", () => {
  mode = mode === "login" ? "signup" : "login";
  updateUI();
});

// UPDATE UI
function updateUI() {
  title.innerText = role + " " + (mode === "login" ? "Login" : "Signup");

  submitBtn.innerText =
    mode === "login" ? "Login" : "Create Account";

  switchText.innerText =
    mode === "login"
      ? "Don't have an account? Create Account"
      : "Already have an account? Login";
}

// SUBMIT (CONNECT BACKEND HERE)
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (mode === "login") {
    // LOGIN API
    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.text())
    .then(data => {
      alert(data);
      window.location.href = "dashboard.html";
    });

  } else {
    // REGISTER API
    fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "User",
        email,
        password,
        role: role.toLowerCase()
      })
    })
    .then(res => res.text())
    .then(data => alert(data));
  }
});