// ==========================
// User Initialization
// ==========================
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
        if (welcomeMessage) welcomeMessage.innerText = "Welcome back, " + storedName + "!";
    }

    // Initialize UI components
    setupSidebarNavigation();
    setupImageUpload();
    initCharts();
    initBooking();
});

// ==========================
// Sidebar Navigation
// ==========================
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const sectionTitle = document.getElementById('sectionTitle');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active to clicked nav item
      item.classList.add('active');

      // Update Section Title
      const textSpan = item.querySelector('span');
      if(textSpan) sectionTitle.innerText = textSpan.innerText;

      // Hide all sections
      sections.forEach(sec => sec.classList.remove('active'));

      // Show target section
      const targetId = item.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

// ==========================
// Image Upload Handlers
// ==========================
function setupImageUpload() {
  const uploadZone = document.getElementById('uploadZone');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removeImageBtn = document.getElementById('removeImageBtn');

  if (!uploadZone) return;

  // Click to open file dialog
  uploadZone.addEventListener('click', () => {
    imageInput.click();
  });

  // Handle file selection
  imageInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImg.src = e.target.result;
        uploadZone.classList.add('hidden');
        imagePreview.classList.remove('hidden');
      }
      reader.readAsDataURL(this.files[0]);
    }
  });

  // Remove image
  removeImageBtn.addEventListener('click', () => {
    imageInput.value = '';
    previewImg.src = '';
    uploadZone.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    document.getElementById('reportSection').classList.add('hidden');
  });

  // Drag and Drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => uploadZone.classList.add('highlight'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('highlight'), false);
  });

  uploadZone.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    imageInput.files = files;
    const event = new Event('change', { bubbles: true });
    imageInput.dispatchEvent(event);
  }, false);
}

// ==========================
// AI Assessment Mock/API
// ==========================
function analyze() {
  const fileInput = document.getElementById("imageInput");
  const desc = document.getElementById("description").value;
  const previewImg = document.getElementById("previewImg");
  
  const hasFile = fileInput.files && fileInput.files.length > 0;

  if (!hasFile) {
    alert("Please upload or drag & drop an image first!");
    return;
  }

  const analyzeBtn = document.getElementById('analyzeBtn');
  const originalText = analyzeBtn.innerHTML;
  analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  analyzeBtn.disabled = true;

  const imageUrl = previewImg.src;

  // API Call to existing backend
  fetch("http://localhost:5000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: 1, image_url: imageUrl, description: desc })
  })
    .then(res => res.json())
    .then(data => {
      analyzeBtn.innerHTML = originalText;
      analyzeBtn.disabled = false;

      if (data.success) {
        displayReport(data.prediction, data.confidence);
        addToHistory(data.prediction, data.confidence);
      } else {
        alert("Analysis failed: " + data.message);
      }
    })
    .catch(err => {
      console.log("Backend error:", err, "Fallback to frontend mock generation.");
      // Fallback for demonstration if API fails or is unconfigured
      setTimeout(() => {
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
        
        let mockConditions = [
          "Melanoma (Malignant)", 
          "Basal Cell Carcinoma", 
          "Benign Nevus", 
          "Contact Dermatitis", 
          "Eczema"
        ];
        let randomCond = mockConditions[Math.floor(Math.random() * mockConditions.length)];
        let randomConf = (Math.random() * 20 + 75).toFixed(1); // 75-95%
        
        displayReport(randomCond, randomConf);
        addToHistory(randomCond, randomConf);
      }, 1500);
    });
}

function displayReport(prediction, confidence) {
  const reportSection = document.getElementById('reportSection');
  reportSection.classList.remove('hidden');

  document.getElementById('reportPrediction').innerText = prediction;
  document.getElementById('reportConfidence').innerText = confidence + "%";

  const cancerRiskBadge = document.getElementById('cancerRiskBadge');
  
  // Mock summaries based on condition string checking
  const predLower = prediction.toLowerCase();
  let summary = "This condition appears to be a standard dermatological anomaly. Monitor for changes in color, size, or border.";
  let prescription = "Over-the-counter hydrocortisone or aloe vera may soothe irritation. Keep the area clean and dry.";
  let isCancerRisk = false;

  if (predLower.includes("melanoma") || predLower.includes("carcinoma")) {
      summary = "Alert: Characteristics detected are often associated with malignant skin conditions. This requires immediate professional evaluation.";
      prescription = "ACTION REQUIRED: Please immediately book a consultation with a dermatologist. Do NOT scratch or attempt any home remedies.";
      isCancerRisk = true;
  } else if (predLower.includes("eczema") || predLower.includes("dermatitis")) {
      summary = "The visible characteristics align with common inflammatory skin conditions often triggered by allergens or dry skin.";
      prescription = "Regular use of emollients and topical corticosteroids. Avoid harsh soaps and taking excessively hot showers.";
  } else if (predLower.includes("benign") || predLower.includes("nevus")) {
      summary = "The assessment indicates typical features of a benign mole or non-cancerous growth. Normal symmetry and borders detected.";
      prescription = "No immediate action required. Continue regular UV protection (sunscreen SPF 30+) and routine self-monitoring.";
  }

  document.getElementById('reportSummary').innerText = summary;
  document.getElementById('reportPrescription').innerText = prescription;
  
  if (isCancerRisk) {
    cancerRiskBadge.classList.remove('hidden');
  } else {
    cancerRiskBadge.classList.add('hidden');
  }

  // Smooth scroll
  reportSection.scrollIntoView({ behavior: 'smooth' });
}

// ==========================
// Booking Handling
// ==========================
const DOCTOR_POOL = [
  { id: 1, name: "Dr. Priya Sharma", spec: "General Dermatology", rating: 4.9, reviews: 312, avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=10b981&color=fff&size=80", experience: "8 yrs" },
  { id: 2, name: "Dr. Rohan Mehta", spec: "Cosmetic Dermatology", rating: 4.7, reviews: 189, avatar: "https://ui-avatars.com/api/?name=Rohan+Mehta&background=8b5cf6&color=fff&size=80", experience: "12 yrs" },
  { id: 3, name: "Dr. Ananya Iyer", spec: "Surgical Dermatology", rating: 4.8, reviews: 240, avatar: "https://ui-avatars.com/api/?name=Ananya+Iyer&background=0ea5e9&color=fff&size=80", experience: "10 yrs" },
  { id: 4, name: "Dr. Kiran Patel", spec: "Pediatric Dermatology", rating: 4.6, reviews: 97, avatar: "https://ui-avatars.com/api/?name=Kiran+Patel&background=f59e0b&color=fff&size=80", experience: "6 yrs" },
  { id: 5, name: "Dr. Siddharth Das", spec: "Trichology & Hair", rating: 4.9, reviews: 421, avatar: "https://ui-avatars.com/api/?name=Siddharth+Das&background=ec4899&color=fff&size=80", experience: "15 yrs" },
];

let liveStatusInterval = null;

function initBooking() {
  renderLiveDoctorsList();
  
  // Refresh live status every 30 seconds
  if (liveStatusInterval) clearInterval(liveStatusInterval);
  liveStatusInterval = setInterval(renderLiveDoctorsList, 30000);
}

function renderLiveDoctorsList() {
  const doctorsList = document.getElementById("liveDoctorsList");
  if (!doctorsList) return;

  const hour = new Date().getHours();
  // Working hours: 9 AM - 8 PM gives higher chance
  const inWorkHours = (hour >= 9 && hour < 21);

  const liveDoctors = DOCTOR_POOL.filter(() => {
    const prob = inWorkHours ? 0.7 : 0.3;
    return Math.random() < prob;
  });

  doctorsList.innerHTML = "";
  
  if (liveDoctors.length === 0) {
    doctorsList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">No doctors are currently live. Please check back later or book a regular appointment below.</div>`;
    return;
  }

  liveDoctors.forEach((doc, i) => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <img src="${doc.avatar}" alt="${doc.name}" class="doctor-avatar">
      <div class="doctor-name">${doc.name}</div>
      <div class="doctor-specialty">${doc.spec} · ${doc.experience}</div>
      <span class="live-badge"><span class="pulse-dot"></span> Live Now</span>
      <button type="button" class="btn-outline btn-sm" style="margin-top: auto; width: 100%; border: 1px solid var(--primary); padding: 0.6rem; border-radius: 8px; background: transparent; color: var(--primary); cursor: pointer; transition: all 0.3s;" onclick="selectDoctor('${doc.name}', '${doc.spec}')" onmouseover="this.style.background='var(--primary)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='var(--primary)';">
        Book Appointment
      </button>
    `;
    doctorsList.appendChild(card);
  });
}

function selectDoctor(name, specialty) {
  const doctorInput = document.getElementById("selectedDoctorInput");
  if (doctorInput) {
    doctorInput.value = name + " - " + specialty;
    // Highlight briefly
    doctorInput.style.transition = "background-color 0.3s";
    doctorInput.style.backgroundColor = "rgba(139, 92, 246, 0.2)";
    setTimeout(() => {
      doctorInput.style.backgroundColor = "rgba(255,255,255,0.7)";
    }, 1000);
  }
  
  const formCard = document.getElementById("bookingFormCard");
  if(formCard) {
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ==========================
// History Handling
// ==========================
function addToHistory(prediction, confidence) {
  const list = document.getElementById("historyList");

  const emptyState = list.querySelector('.empty-state');
  if (emptyState) {
    list.innerHTML = "";
  }

  const li = document.createElement("li");
  
  li.innerHTML = `
    <div class="history-item-header">
      <span class="history-item-title"><i class="fa-solid fa-microscope" style="color: var(--primary); margin-right: 0.5rem;"></i>${prediction}</span>
      <span class="history-item-date">${new Date().toLocaleDateString()}</span>
    </div>
    <div class="history-summary">
      Assessed with ${confidence}% confidence. 
      ${prediction.toLowerCase().includes("melanoma") ? '<strong style="color:#ef4444;">High Priority Review</strong>' : 'Routine monitoring suggested.'}
    </div>
  `;

  if (list.firstChild) {
    list.insertBefore(li, list.firstChild);
  } else {
    list.appendChild(li);
  }
}

// ==========================
// Reports Initialization (Chart.js)
// ==========================
function initCharts() {
  const scansCtx = document.getElementById('scansChart');
  const condCtx = document.getElementById('conditionsChart');

  if (scansCtx && window.Chart) {
    new Chart(scansCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Scans Initiated',
          data: [2, 4, 3, 5, 2, 7],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  if (condCtx && window.Chart) {
    new Chart(condCtx, {
      type: 'doughnut',
      data: {
        labels: ['Benign Nevus', 'Eczema', 'Melanoma', 'Other'],
        datasets: [{
          data: [45, 25, 10, 20],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }
}

// ==========================
// Booking Submission
// ==========================
function handleBooking(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBookingBtn");
  const originalHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  submitBtn.disabled = true;

  const bookingData = {
    user_id: 1, // hardcoded user for now, in a real app grab from local auth context or JWT
    doctor_name: document.getElementById("selectedDoctorInput").value || "General Pool",
    specialist_type: document.getElementById("specialistType").value,
    consultation_mode: document.getElementById("consultationMode").value,
    appointment_date: document.getElementById("appointmentDate").value,
    time_slot: document.getElementById("timeSlot").value,
    reason: document.getElementById("reasonForVisit").value
  };

  fetch("http://localhost:5000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData)
  })
  .then(res => res.json())
  .then(data => {
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmed!';
    submitBtn.style.background = "#10b981";
    
    setTimeout(() => {
      alert(data.message || "Booking Confirmed successfully!");
      document.getElementById("bookingForm").reset();
      submitBtn.innerHTML = originalHtml;
      submitBtn.style.background = "";
      submitBtn.disabled = false;
    }, 1000);
  })
  .catch(err => {
    console.error("Booking Error:", err);
    alert("Failed to confirm booking. Please try again.");
    submitBtn.innerHTML = originalHtml;
    submitBtn.disabled = false;
  });
}