// =====================================================
//  DermAI — History Page JavaScript
//  Features: History list, Live Doctors, Stats, Modal
// =====================================================

/* ==================== DATA ====================
   Mock doctor pool — toggle isLive randomly on init
   and refresh every 30s to simulate real-time status
   ==================================================*/



const HEALTH_TIPS = [
  "Apply SPF 30+ sunscreen every morning — even on cloudy days. UV exposure is the #1 cause of premature skin aging.",
  "Drink at least 8 glasses of water daily. Hydration is the most under-rated skincare routine.",
  "Never sleep with makeup on. It clogs pores and accelerates skin ageing overnight.",
  "Wash your pillowcase at least once a week. Bacteria and oil build-up causes breakouts.",
  "Eat a diet rich in antioxidants — berries, spinach, and nuts help fight skin inflammation.",
  "Do a monthly self-skin exam. Look for any new moles or changes in existing ones.",
  "Avoid hot showers — they strip your skin of its natural protective oils. Use lukewarm water.",
  "Moisturize within 3 minutes of showering to lock in hydration while skin is still damp.",
  "Stress triggers cortisol spikes that cause acne and flare-ups. Prioritize sleep and mindfulness.",
  "Pat your face dry — never rub. Rubbing causes micro-tears in delicate facial skin.",
];

// Condition presets for mock history display
const CONDITION_META = {
  "Melanoma (Malignant)": {
    risk: "high",
    summary: "Characteristics detected are often associated with malignant skin conditions. This requires immediate professional evaluation.",
    prescription: "ACTION REQUIRED: Please book a consultation with a dermatologist immediately. Do NOT attempt home remedies.",
    icon: "fa-triangle-exclamation",
    iconBg: "rgba(239,68,68,0.1)",
    iconColor: "#ef4444",
  },
  "Basal Cell Carcinoma": {
    risk: "high",
    summary: "Signs consistent with Basal Cell Carcinoma — the most common form of skin cancer. Typically slow-growing but requires clinical confirmation.",
    prescription: "Schedule an urgent dermatology appointment. Avoid sun exposure on the affected area.",
    icon: "fa-triangle-exclamation",
    iconBg: "rgba(239,68,68,0.1)",
    iconColor: "#ef4444",
  },
  "Contact Dermatitis": {
    risk: "moderate",
    summary: "Visible characteristics align with an allergic or irritant contact reaction. Typically triggered by soaps, metals, or plants.",
    prescription: "Identify and remove the irritant. Apply OTC hydrocortisone cream and keep the area moisturized.",
    icon: "fa-droplet",
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "#f59e0b",
  },
  "Eczema": {
    risk: "moderate",
    summary: "Findings suggest common inflammatory skin condition (eczema) often triggered by allergens or dry skin environments.",
    prescription: "Regular emollients and topical corticosteroids. Avoid harsh soaps and hot showers.",
    icon: "fa-wind",
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "#f59e0b",
  },
  "Benign Nevus": {
    risk: "low",
    summary: "Assessment indicates typical features of a benign mole or non-cancerous growth. Normal symmetry and borders detected.",
    prescription: "No immediate action required. Continue with SPF 30+ sun protection and routine self-monitoring monthly.",
    icon: "fa-circle-check",
    iconBg: "rgba(16,185,129,0.1)",
    iconColor: "#10b981",
  },
};

// State
let allHistory = [];
let tipIndex = 0;

/* ==================== INIT ==================== */
document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  loadHistory();
  renderStats();
  renderTip();
});

/* ==================== USER ==================== */
function loadUserInfo() {
  const name = localStorage.getItem("dermAI_userName") || "Patient";
  const profileEl = document.getElementById("profileNameDisplay");
  const welcomeEl = document.getElementById("welcomeMessageDisplay");
  const avatarEl  = document.getElementById("avatarImg");

  if (profileEl) profileEl.textContent = name;
  if (welcomeEl) welcomeEl.textContent = `Welcome back, ${name}! Here's your scan timeline.`;
  if (avatarEl)  avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=80`;
}

function logout() {
  localStorage.removeItem("dermAI_userName");
  window.location.href = "index.html";
}

/* ==================== HISTORY ==================== */
function loadHistory() {
  // Try fetching from backend first, fallback to localStorage
  fetch("http://localhost:5000/api/reports")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        allHistory = data.map(r => ({
          id: r.id || Date.now(),
          prediction: r.prediction || "Unknown",
          confidence: r.confidence || "—",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN"),
          timestamp: r.created_at || new Date().toISOString(),
        }));
      } else {
        allHistory = getLocalHistory();
      }
      renderHistory(allHistory);
      renderStats();
    })
    .catch(() => {
      // Backend offline — use localStorage mock data
      allHistory = getLocalHistory();
      if (allHistory.length === 0) {
        allHistory = getMockHistory(); // seed demo data for showcase
      }
      renderHistory(allHistory);
      renderStats();
    });
}

function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem("dermAI_history") || "[]");
  } catch {
    return [];
  }
}

function getMockHistory() {
  // Demo data so the page isn't empty on first visit
  return [
    { id: 1, prediction: "Benign Nevus", confidence: "92.4", date: "14 Apr 2026", timestamp: "2026-04-14T10:30:00" },
    { id: 2, prediction: "Contact Dermatitis", confidence: "87.1", date: "12 Apr 2026", timestamp: "2026-04-12T15:20:00" },
    { id: 3, prediction: "Eczema", confidence: "89.5", date: "9 Apr 2026",  timestamp: "2026-04-09T09:00:00" },
    { id: 4, prediction: "Melanoma (Malignant)", confidence: "78.2", date: "5 Apr 2026",  timestamp: "2026-04-05T18:45:00" },
    { id: 5, prediction: "Benign Nevus", confidence: "94.8", date: "1 Apr 2026",  timestamp: "2026-04-01T11:10:00" },
  ];
}

function renderHistory(items) {
  const list      = document.getElementById("historyList");
  const empty     = document.getElementById("emptyState");
  const noResults = document.getElementById("noResults");

  list.innerHTML = "";

  if (!items || items.length === 0) {
    list.classList.add("hidden");
    empty.classList.remove("hidden");
    return;
  }

  list.classList.remove("hidden");
  empty.classList.add("hidden");

  items.forEach((item, index) => {
    const meta   = CONDITION_META[item.prediction] || CONDITION_META["Benign Nevus"];
    const riskCls = meta.risk === "high" ? "high-risk" : meta.risk === "moderate" ? "moderate" : "benign";
    const badgeCls = meta.risk === "high" ? "badge-high" : meta.risk === "moderate" ? "badge-mod" : "badge-low";
    const badgeTxt = meta.risk === "high" ? "⚠ High Risk" : meta.risk === "moderate" ? "Moderate" : "✓ Benign";

    const li = document.createElement("li");
    li.className = `history-item ${riskCls}`;
    li.style.animationDelay = `${index * 0.05}s`;
    li.innerHTML = `
      <div class="history-item-icon" style="background:${meta.iconBg}; color:${meta.iconColor};">
        <i class="fa-solid ${meta.icon}"></i>
      </div>
      <div class="history-item-body">
        <div class="history-item-title">${item.prediction}</div>
        <div class="history-item-meta">
          <span class="history-item-date"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
          <span class="history-item-conf"><i class="fa-solid fa-gauge-high"></i> ${item.confidence}% confidence</span>
        </div>
      </div>
      <span class="risk-badge ${badgeCls}">${badgeTxt}</span>
      <button class="view-btn" onclick="openModal(${index}, event)">
        <i class="fa-solid fa-eye"></i> View
      </button>
    `;
    list.appendChild(li);
  });
}

/* ---- Filter / Search ---- */
function filterHistory() {
  const query     = document.getElementById("searchInput").value.toLowerCase().trim();
  const riskFilter = document.getElementById("filterRisk").value;
  const sortOrder  = document.getElementById("filterSort").value;

  let filtered = [...allHistory];

  // Search
  if (query) {
    filtered = filtered.filter(i => i.prediction.toLowerCase().includes(query));
  }

  // Risk filter
  if (riskFilter !== "all") {
    filtered = filtered.filter(i => {
      const meta = CONDITION_META[i.prediction] || { risk: "low" };
      if (riskFilter === "high")   return meta.risk === "high";
      if (riskFilter === "normal") return meta.risk !== "high";
      return true;
    });
  }

  // Sort
  filtered.sort((a, b) => {
    const da = new Date(a.timestamp), db = new Date(b.timestamp);
    return sortOrder === "newest" ? db - da : da - db;
  });

  renderHistory(filtered);
}

/* ---- Clear History ---- */
function clearHistory() {
  if (!confirm("Are you sure you want to clear all history? This cannot be undone.")) return;
  localStorage.removeItem("dermAI_history");
  allHistory = [];
  renderHistory([]);
  renderStats();
}

/* ==================== STATS ==================== */
function renderStats() {
  document.getElementById("statTotal").textContent = allHistory.length;

  const benign = allHistory.filter(i => {
    const meta = CONDITION_META[i.prediction];
    return meta && meta.risk === "low";
  }).length;

  const highRisk = allHistory.filter(i => {
    const meta = CONDITION_META[i.prediction];
    return meta && meta.risk === "high";
  }).length;

  document.getElementById("statBenign").textContent  = benign;
  document.getElementById("statHighRisk").textContent = highRisk;

  // Last scan date — pick newest
  if (allHistory.length > 0) {
    const sorted = [...allHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const last = new Date(sorted[0].timestamp);
    document.getElementById("statLast").textContent = last.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } else {
    document.getElementById("statLast").textContent = "—";
  }
}

/* ==================== MODAL ==================== */
let currentItems = [];  // holds filtered or full list at render time

function openModal(index, e) {
  if (e) e.stopPropagation();

  // Grab what's currently rendered
  const renderedItems = getCurrentRenderedItems();
  if (index >= renderedItems.length) return;

  const item = renderedItems[index];
  const meta = CONDITION_META[item.prediction] || CONDITION_META["Benign Nevus"];

  // Populate modal
  document.getElementById("modalTitle").textContent       = item.prediction;
  document.getElementById("modalDate").textContent        = `Scanned on ${item.date}`;
  document.getElementById("modalConfidence").textContent  = `${item.confidence}%`;
  document.getElementById("modalSummary").textContent     = meta.summary;
  document.getElementById("modalPrescription").textContent = meta.prescription;
  document.getElementById("modalIcon").style.background   = meta.iconBg;
  document.getElementById("modalIcon").style.color        = meta.iconColor;
  document.getElementById("modalIcon").innerHTML          = `<i class="fa-solid ${meta.icon}"></i>`;

  const riskTxt  = meta.risk === "high" ? "⚠ High Risk" : meta.risk === "moderate" ? "Moderate" : "✓ Benign";
  document.getElementById("modalRisk").textContent = riskTxt;

  document.getElementById("reportModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("reportModal").classList.add("hidden");
  document.body.style.overflow = "";
}

// Close modal on overlay click
document.getElementById("reportModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* Get items currently shown in the list */
function getCurrentRenderedItems() {
  const query      = document.getElementById("searchInput").value.toLowerCase().trim();
  const riskFilter = document.getElementById("filterRisk").value;
  const sortOrder  = document.getElementById("filterSort").value;

  let filtered = [...allHistory];
  if (query) filtered = filtered.filter(i => i.prediction.toLowerCase().includes(query));
  if (riskFilter !== "all") {
    filtered = filtered.filter(i => {
      const meta = CONDITION_META[i.prediction] || { risk: "low" };
      if (riskFilter === "high")   return meta.risk === "high";
      if (riskFilter === "normal") return meta.risk !== "high";
      return true;
    });
  }
  filtered.sort((a, b) => {
    const da = new Date(a.timestamp), db = new Date(b.timestamp);
    return sortOrder === "newest" ? db - da : da - db;
  });
  return filtered;
}



/* ==================== HEALTH TIPS ==================== */
function renderTip() {
  const el = document.getElementById("tipText");
  if (el) {
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = HEALTH_TIPS[tipIndex % HEALTH_TIPS.length];
      el.style.transition = "opacity 0.4s ease";
      el.style.opacity = "1";
    }, 200);
  }
}

function nextTip() {
  tipIndex = (tipIndex + 1) % HEALTH_TIPS.length;
  renderTip();
}

// Auto-rotate tips every 15 seconds
setInterval(() => {
  tipIndex = (tipIndex + 1) % HEALTH_TIPS.length;
  renderTip();
}, 15000);
