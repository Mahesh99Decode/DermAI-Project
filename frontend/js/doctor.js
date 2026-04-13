// 🔐 Logout function
function logout() {
  localStorage.removeItem("dermAI_doctorName");
  localStorage.removeItem("role"); // 🔥 important

  window.location.href = "index.html";
}

// 🚀 On Page Load
document.addEventListener('DOMContentLoaded', () => {

  // 🔐 Protect doctor page
  const role = localStorage.getItem("role");
  if (role !== "doctor") {
    window.location.href = "index.html";
    return;
  }

  // 📅 Set current date
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // 👨‍⚕️ Load doctor name
  const storedName = localStorage.getItem("dermAI_doctorName");

  if (storedName) {
    const profileName = document.getElementById("profileNameDisplay");
    const welcomeMessage = document.getElementById("welcomeMessageDisplay");

    if (profileName) profileName.innerText = storedName;
    if (welcomeMessage) welcomeMessage.innerText =
      "Welcome back, " + storedName + "!";
  }

});

// 🎥 Start Consultation
function startConsultation() {
  const btn = document.querySelector('.join-btn');
  const originalHtml = btn.innerHTML;

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

  setTimeout(() => {
    alert("Starting secure video consultation...\n\n(This is a demo)");
    btn.innerHTML = originalHtml;
  }, 1000);
}