function logout() {
  window.location.href = "index.html";
}

// Set current date on load
document.addEventListener('DOMContentLoaded', () => {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
});

function startConsultation() {
  const btn = document.querySelector('.join-btn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';
  
  setTimeout(() => {
    alert("Starting secure video consultation room...\n\n(This is a placeholder for actual consultation logic)");
    btn.innerHTML = originalHtml;
  }, 1000);
}
