function logout() {
  localStorage.removeItem("dermAI_userName");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const storedName = localStorage.getItem("dermAI_userName");
    if (storedName) {
        const profileName = document.getElementById("profileNameDisplay");
        const welcomeMessage = document.getElementById("welcomeMessageDisplay");
        if (profileName) profileName.innerText = storedName;
        if (welcomeMessage) welcomeMessage.innerText = "Welcome, " + storedName + "!";
    }
});

// AI ANALYSIS
function analyze() {
  const fileInput = document.getElementById("imageInput");
  const desc = document.getElementById("description").value;
  
  // Use imagePreview source if a file was dropped or selected
  const hasFile = fileInput.files && fileInput.files.length > 0;

  if (!hasFile) {
    alert("Please upload or drag & drop an image first!");
    return;
  }

  // Simulate analysis process...
  const analyzeBtn = document.querySelector('.btn-primary');
  const originalText = analyzeBtn.innerHTML;
  analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
  analyzeBtn.disabled = true;

  setTimeout(() => {
    // Dummy result
    const conditions = ["Eczema Detected", "Melanoma (Low Risk)", "Contact Dermatitis", "Psoriasis Indication"];
    const result = conditions[Math.floor(Math.random() * conditions.length)] + " (Confidence: " + (Math.floor(Math.random() * 20) + 80) + "%)";

    addToHistory(result);
    // Reset file upload state
    document.getElementById('removeImageBtn').click();
    document.getElementById('description').value = '';

    // Reset button
    analyzeBtn.innerHTML = originalText;
    analyzeBtn.disabled = false;
    
    // Smooth scroll to history
    document.querySelector('.history-card').scrollIntoView({ behavior: 'smooth' });
    
  }, 1500);
}

// HISTORY
function addToHistory(text) {
  const list = document.getElementById("historyList");

  // Check if it's the empty state
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) {
    list.innerHTML = "";
  }

  const li = document.createElement("li");
  
  // Create stylized history item
  li.innerHTML = `
    <div class="history-item">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
        <i class="fa-solid fa-clipboard-check" style="color: var(--primary);"></i>
        <span class="history-text">${text}</span>
      </div>
      <span class="history-date"><i class="fa-regular fa-clock"></i> ${new Date().toLocaleString()}</span>
    </div>
  `;

  // Insert at top of list
  if (list.firstChild) {
    list.insertBefore(li, list.firstChild);
  } else {
    list.appendChild(li);
  }
}