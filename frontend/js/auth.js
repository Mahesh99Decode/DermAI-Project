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

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation function
const validatePassword = (password) => {
  return password && password.length >= 6;
};

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

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validate email format
  if (!email || !validateEmail(email)) {
    alert("Please enter a valid email address ❌");
    return;
  }

  // Validate password
  if (!validatePassword(password)) {
    alert("Password must be at least 6 characters ❌");
    return;
  }

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
    const nameInput = document.getElementById("name")?.value.trim();
    if (!nameInput) {
      alert("Name is required ❌");
      return;
    }

    fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: nameInput,
        email,
        password,
        role: role.toLowerCase()
      })
    })
    .then(res => res.text())
    .then(data => {
      alert(data);
      if (data.includes("successfully")) {
        window.location.href = "dashboard.html";
      }
    });
  }
});