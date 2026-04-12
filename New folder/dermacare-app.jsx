
import { useState, useEffect, useRef, useCallback } from "react";

// ── STORAGE HELPERS ──────────────────────────────────────────────────────────
const STORAGE_KEY = "dermacare_v1";
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
};
const save = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

const DEFAULT_DOCTORS = [
  { id: "doc1", name: "Dr. Rahul Mehta", spec: "MBBS, MD Dermatology", exp: "8 yrs", fee: 800, rating: 4.9, slots: ["9:00 AM","10:30 AM","2:00 PM","4:00 PM"], avatar: "RM" },
  { id: "doc2", name: "Dr. Kavita Sharma", spec: "MBBS, DVD Dermatology", exp: "12 yrs", fee: 1000, rating: 4.8, slots: ["10:00 AM","11:30 AM","3:00 PM"], avatar: "KS" },
  { id: "doc3", name: "Dr. Arjun Nair", spec: "MBBS, MD Skin & VD", exp: "5 yrs", fee: 700, rating: 4.7, slots: ["8:30 AM","1:00 PM","5:00 PM"], avatar: "AN" },
];

function initStorage() {
  const existing = load();
  if (existing) return existing;
  const data = {
    users: [
      { id: "u1", role: "patient", name: "Priya Kulkarni", email: "priya@example.com", password: "demo123", age: 28, gender: "Female" },
      { id: "u2", role: "doctor", name: "Dr. Rahul Mehta", email: "dr.mehta@clinic.com", password: "demo123", doctorId: "doc1" },
    ],
    scans: [],
    appointments: [],
    payments: [],
  };
  save(data);
  return data;
}

// ── CLAUDE API ────────────────────────────────────────────────────────────────
async function analyzeWithClaude(imageBase64, description, symptoms) {
  const prompt = `You are a professional dermatologist AI assistant. Analyze this skin condition image and the patient's description.

Patient description: ${description || "No description provided"}
Selected symptoms: ${symptoms.length ? symptoms.join(", ") : "None specified"}

Respond ONLY with a valid JSON object (no markdown, no backticks) in this exact format:
{
  "condition": "Condition name",
  "confidence": 82,
  "severity": "mild|moderate|severe",
  "description": "2-3 sentence clinical description of what you see",
  "remedies": [
    {"title": "Remedy name", "detail": "How to use it and why it helps"},
    {"title": "Remedy name", "detail": "How to use it and why it helps"},
    {"title": "Remedy name", "detail": "How to use it and why it helps"},
    {"title": "Remedy name", "detail": "How to use it and why it helps"}
  ],
  "needsDoctor": true,
  "doctorNote": "One sentence on why a doctor consultation is recommended or not"
}`;

  const messages = imageBase64
    ? [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
        { type: "text", text: prompt }
      ]}]
    : [{ role: "user", content: prompt }];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages }),
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      condition: "Analysis Complete",
      confidence: 75,
      severity: "moderate",
      description: text.slice(0, 200) || "Please consult a dermatologist for proper diagnosis.",
      remedies: [
        { title: "Keep area clean", detail: "Gently wash with mild soap twice daily." },
        { title: "Avoid irritants", detail: "Stop using new skincare products." },
        { title: "Moisturize", detail: "Apply fragrance-free moisturizer after washing." },
        { title: "Cold compress", detail: "Apply for 15 min to reduce inflammation." },
      ],
      needsDoctor: true,
      doctorNote: "Professional evaluation is recommended for accurate diagnosis.",
    };
  }
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --sage:#3D6B5E;--sage-l:#5A9080;--sage-d:#243F38;
    --cream:#FAF7F2;--warm:#FDF9F4;--white:#FFFFFF;
    --border:#E5DDD4;--border2:#D4C9BC;
    --text:#1E1E1E;--muted:#7A7268;--hint:#A89F95;
    --skin:#EDD9C8;--gold:#C08A2E;
    --ok-bg:#E8F5EC;--ok-txt:#1B5E30;
    --warn-bg:#FFF3CD;--warn-txt:#7A4E00;
    --info-bg:#E3EEF9;--info-txt:#1A3F6F;
    --danger-bg:#FDEAEA;--danger-txt:#7A1F1F;
    --r:14px;--r2:20px;--r3:28px;
    --shadow:0 2px 12px rgba(0,0,0,0.07);
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  body{background:var(--cream);color:var(--text);min-height:100vh;overflow-x:hidden}
  h1,h2,h3,.serif{font-family:'Playfair Display',serif}
  button{cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif}
  input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

  .fade{animation:fadeUp .35s ease both}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .spin{animation:spin 1s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .pulse{animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}

  /* LANDING */
  .landing{min-height:100vh;background:var(--sage-d);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;position:relative;overflow:hidden}
  .landing-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .landing-bg::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;border:1px solid rgba(255,255,255,.04);top:-150px;right:-150px}
  .landing-bg::after{content:'';position:absolute;width:400px;height:400px;border-radius:50%;border:1px solid rgba(255,255,255,.04);bottom:-100px;left:-100px}
  .landing-brand{text-align:center;margin-bottom:3.5rem;position:relative}
  .landing-brand .icon{width:80px;height:80px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 1.5rem}
  .landing-brand h1{font-size:3rem;color:#fff;letter-spacing:-1px;line-height:1}
  .landing-brand p{color:rgba(255,255,255,.45);font-size:.95rem;margin-top:.6rem;font-weight:300}
  .landing-cards{display:grid;grid-template-columns:1fr 1fr;gap:1rem;width:100%;max-width:480px}
  .l-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:var(--r2);padding:2rem 1.5rem;text-align:center;cursor:pointer;transition:all .3s}
  .l-card:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.25);transform:translateY(-4px)}
  .l-card .ico{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto .9rem}
  .l-card.pat .ico{background:rgba(237,217,200,.15)}
  .l-card.doc .ico{background:rgba(93,176,156,.12)}
  .l-card h3{color:#fff;font-size:1rem;font-weight:600;margin-bottom:.25rem}
  .l-card p{color:rgba(255,255,255,.4);font-size:.8rem;font-weight:300}
  .demo-hint{margin-top:2rem;color:rgba(255,255,255,.3);font-size:.78rem;text-align:center;line-height:1.6}
  .demo-hint span{color:rgba(255,255,255,.6);font-weight:500}

  /* AUTH */
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:var(--cream)}
  .auth-box{background:var(--white);border:1px solid var(--border);border-radius:var(--r3);padding:2.5rem;width:100%;max-width:400px;box-shadow:var(--shadow)}
  .auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:2rem}
  .auth-logo .dot{width:34px;height:34px;background:var(--sage-d);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px}
  .auth-logo span{font-size:1.15rem}
  .auth-box h2{font-size:1.75rem;margin-bottom:.25rem}
  .auth-sub{color:var(--muted);font-size:.88rem;margin-bottom:1.75rem}
  .field{margin-bottom:1rem}
  .field label{display:block;font-size:.78rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.4rem}
  .field input{width:100%;padding:.75rem 1rem;border:1.5px solid var(--border);border-radius:var(--r);background:var(--cream);font-size:.93rem;outline:none;transition:border-color .2s,background .2s;color:var(--text)}
  .field input:focus{border-color:var(--sage);background:#fff}
  .field .err{color:#C0392B;font-size:.78rem;margin-top:.3rem}
  .btn{width:100%;padding:.85rem;border:none;border-radius:var(--r);font-size:.95rem;font-weight:600;transition:all .2s;margin-top:.4rem}
  .btn-sage{background:var(--sage-d);color:#fff}.btn-sage:hover{background:var(--sage)}
  .btn-outline{background:transparent;border:1.5px solid var(--border);color:var(--text)}.btn-outline:hover{border-color:var(--sage);color:var(--sage)}
  .auth-switch{text-align:center;margin-top:1.2rem;font-size:.85rem;color:var(--muted)}
  .auth-switch span{color:var(--sage-d);font-weight:600;cursor:pointer}
  .back-link{text-align:center;margin-top:.75rem;font-size:.83rem;color:var(--hint);cursor:pointer}
  .back-link:hover{color:var(--muted)}
  .error-box{background:var(--danger-bg);color:var(--danger-txt);border-radius:var(--r);padding:.7rem 1rem;font-size:.85rem;margin-bottom:1rem}
  .success-box{background:var(--ok-bg);color:var(--ok-txt);border-radius:var(--r);padding:.7rem 1rem;font-size:.85rem;margin-bottom:1rem}

  /* NAV */
  .nav{background:var(--white);border-bottom:1px solid var(--border);padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:58px;position:sticky;top:0;z-index:50;box-shadow:0 1px 8px rgba(0,0,0,.04)}
  .nav-brand{display:flex;align-items:center;gap:8px}
  .nav-brand .ndot{width:30px;height:30px;background:var(--sage-d);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px}
  .nav-brand .nname{font-size:1.05rem}
  .nav-tabs{display:flex;gap:2px}
  .ntab{padding:6px 14px;border-radius:10px;font-size:.83rem;font-weight:500;cursor:pointer;color:var(--muted);border:none;background:transparent;transition:all .2s}
  .ntab.on{background:var(--cream);color:var(--text)}
  .ntab:hover{background:var(--cream)}
  .nav-right{display:flex;align-items:center;gap:10px}
  .nav-avatar{width:32px;height:32px;border-radius:50%;background:var(--skin);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--sage-d)}
  .nav-name{font-size:.83rem;font-weight:500;color:var(--muted)}
  .logout{font-size:.8rem;color:var(--hint);cursor:pointer;padding:5px 8px;border-radius:8px;border:none;background:transparent;transition:background .2s}
  .logout:hover{background:var(--cream);color:var(--muted)}

  /* CONTENT */
  .content{max-width:860px;margin:0 auto;padding:1.5rem}
  .section{animation:fadeUp .3s ease}

  /* SCAN */
  .scan-hero{background:var(--sage-d);border-radius:var(--r2);padding:2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
  .scan-hero::after{content:'🔬';position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);font-size:72px;opacity:.1}
  .scan-hero h2{font-size:1.7rem;color:#fff;margin-bottom:.3rem}
  .scan-hero p{color:rgba(255,255,255,.5);font-size:.88rem;max-width:280px;line-height:1.6}
  .upload-area{border:2px dashed var(--border);border-radius:var(--r2);padding:2.5rem;text-align:center;background:var(--warm);cursor:pointer;transition:all .3s;margin-bottom:1rem;position:relative}
  .upload-area:hover{border-color:var(--sage);background:#EDF5F2}
  .upload-area.drag{border-color:var(--sage);background:#EDF5F2;transform:scale(1.01)}
  .upload-area.has-img{border-style:solid;border-color:var(--sage)}
  .upload-preview{max-height:220px;border-radius:12px;object-fit:cover;max-width:100%}
  .upload-area .u-icon{font-size:40px;margin-bottom:.75rem}
  .upload-area h3{font-size:1rem;font-weight:600;margin-bottom:.3rem}
  .upload-area p{font-size:.82rem;color:var(--muted)}
  .upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem}
  .ubtn{padding:.85rem;border:1.5px solid var(--border);border-radius:var(--r);background:#fff;display:flex;align-items:center;justify-content:center;gap:8px;font-size:.88rem;font-weight:500;transition:all .2s;color:var(--text)}
  .ubtn:hover{border-color:var(--sage);background:#EDF5F2;color:var(--sage-d)}
  .ubtn.cam{background:var(--sage-d);color:#fff;border-color:var(--sage-d)}.ubtn.cam:hover{background:var(--sage)}
  .sym-wrap{display:flex;flex-wrap:wrap;gap:8px;margin:.75rem 0 1rem}
  .sym{padding:6px 14px;border-radius:20px;background:var(--cream);border:1.5px solid var(--border);font-size:.82rem;cursor:pointer;transition:all .2s;font-weight:500}
  .sym.on{background:var(--sage-d);color:#fff;border-color:var(--sage-d)}
  .sym:hover:not(.on){border-color:var(--sage);color:var(--sage-d)}
  .section-label{font-size:.88rem;font-weight:600;color:var(--text);margin-bottom:.65rem}
  textarea{width:100%;padding:.85rem 1rem;border:1.5px solid var(--border);border-radius:var(--r);background:var(--cream);font-size:.9rem;resize:none;outline:none;line-height:1.7;color:var(--text);transition:border-color .2s}
  textarea:focus{border-color:var(--sage);background:#fff}
  .analyze-btn{width:100%;padding:1rem;background:var(--sage-d);color:#fff;border:none;border-radius:var(--r2);font-size:1rem;font-weight:600;transition:all .2s;margin-top:.75rem;display:flex;align-items:center;justify-content:center;gap:8px}
  .analyze-btn:hover:not(:disabled){background:var(--sage)}
  .analyze-btn:disabled{opacity:.6;cursor:not-allowed}
  .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%}

  /* RESULTS */
  .result-card{background:#fff;border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;margin-bottom:1rem;box-shadow:var(--shadow)}
  .result-head{padding:1.25rem 1.5rem;background:var(--warm);border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:12px}
  .cond-name{font-size:1.2rem;font-weight:700}
  .cond-desc{font-size:.83rem;color:var(--muted);margin-top:3px;line-height:1.5}
  .conf-pill{padding:4px 12px;border-radius:20px;font-size:.78rem;font-weight:600;white-space:nowrap;flex-shrink:0}
  .sev-mild{background:var(--ok-bg);color:var(--ok-txt)}
  .sev-moderate{background:var(--warn-bg);color:var(--warn-txt)}
  .sev-severe{background:var(--danger-bg);color:var(--danger-txt)}
  .result-body{padding:1.5rem}
  .remedy-grid{display:flex;flex-direction:column;gap:0;margin:1rem 0}
  .remedy-row{display:flex;gap:12px;padding:.85rem 0;border-bottom:1px solid var(--border)}
  .remedy-row:last-child{border-bottom:none}
  .rnum{width:26px;height:26px;background:var(--skin);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--sage-d);flex-shrink:0;margin-top:1px}
  .remedy-row strong{font-size:.9rem;display:block;margin-bottom:2px}
  .remedy-row span{font-size:.83rem;color:var(--muted);line-height:1.6}
  .ask-banner{background:linear-gradient(135deg,var(--sage-d),#1a3a34);border-radius:var(--r2);padding:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.5rem}
  .ask-banner h4{font-size:1.05rem;color:#fff;margin-bottom:.2rem}
  .ask-banner p{font-size:.82rem;color:rgba(255,255,255,.55)}
  .ask-btn{white-space:nowrap;padding:.65rem 1.2rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:10px;color:#fff;font-size:.85rem;font-weight:600;transition:all .2s}
  .ask-btn:hover{background:rgba(255,255,255,.25)}
  .back-btn{display:flex;align-items:center;gap:6px;font-size:.88rem;color:var(--muted);background:none;border:none;margin-bottom:1.25rem;padding:0;cursor:pointer}
  .back-btn:hover{color:var(--text)}

  /* HISTORY */
  .hist-item{background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:1.25rem;margin-bottom:.75rem;display:flex;gap:12px;box-shadow:var(--shadow);cursor:pointer;transition:all .2s}
  .hist-item:hover{border-color:var(--sage-l);transform:translateY(-1px)}
  .hist-thumb{width:56px;height:56px;border-radius:12px;background:var(--cream);flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px}
  .hist-thumb img{width:100%;height:100%;object-fit:cover}
  .hist-info h4{font-size:.93rem;font-weight:600;margin-bottom:2px}
  .hist-info p{font-size:.8rem;color:var(--muted)}
  .hist-badge{display:inline-block;padding:3px 10px;border-radius:10px;font-size:.72rem;font-weight:600;margin-top:5px}
  .bh{background:var(--ok-bg);color:var(--ok-txt)}
  .bd{background:var(--info-bg);color:var(--info-txt)}
  .hist-date{margin-left:auto;font-size:.75rem;color:var(--hint);white-space:nowrap}
  .empty-state{text-align:center;padding:3rem 1rem;color:var(--muted)}
  .empty-state .ei{font-size:40px;margin-bottom:.75rem}
  .empty-state h3{font-size:1rem;font-weight:600;margin-bottom:.3rem}
  .empty-state p{font-size:.85rem}

  /* MODAL */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;z-index:200;animation:fadeUp .2s}
  .sheet{background:#fff;border-radius:var(--r3) var(--r3) 0 0;padding:1.75rem;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;animation:slideUp .3s ease}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .handle{width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 1.5rem}
  .sheet h3{font-size:1.4rem;margin-bottom:.25rem}
  .sheet-sub{color:var(--muted);font-size:.85rem;margin-bottom:1.5rem}
  .doc-list{display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.25rem;max-height:260px;overflow-y:auto}
  .doc-row{border:1.5px solid var(--border);border-radius:var(--r);padding:1rem;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:all .2s}
  .doc-row.sel,.doc-row:hover{border-color:var(--sage);background:#EDF5F2}
  .doc-ava{width:44px;height:44px;border-radius:12px;background:var(--skin);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;color:var(--sage-d);flex-shrink:0}
  .doc-row h4{font-size:.9rem;font-weight:600}
  .doc-row p{font-size:.78rem;color:var(--muted);margin-top:1px}
  .slots{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
  .slot{padding:3px 10px;background:var(--cream);border:1px solid var(--border);border-radius:6px;font-size:.72rem;font-weight:500;cursor:pointer;transition:all .2s}
  .slot.on{background:var(--sage-d);color:#fff;border-color:var(--sage-d)}
  .slot:hover:not(.on){border-color:var(--sage)}
  .doc-fee{margin-left:auto;font-size:.88rem;font-weight:700;color:var(--sage-d);white-space:nowrap;text-align:right}
  .star{color:#D4A017;font-size:.78rem}
  .price-box{background:var(--cream);border-radius:var(--r);padding:1rem;margin-bottom:1.25rem}
  .price-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.88rem}
  .price-row.total{border-top:1px solid var(--border);margin-top:8px;padding-top:10px;font-weight:700;font-size:.95rem}
  .pay-btn{width:100%;padding:1rem;background:var(--sage-d);color:#fff;border:none;border-radius:var(--r);font-size:.95rem;font-weight:700;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:8px}
  .pay-btn:hover:not(:disabled){background:var(--sage)}
  .pay-btn:disabled{opacity:.6;cursor:not-allowed}
  .cancel-txt{text-align:center;margin-top:.85rem;font-size:.83rem;color:var(--hint);cursor:pointer}
  .cancel-txt:hover{color:var(--muted)}
  .confirm-big{font-size:48px;margin-bottom:1rem;text-align:center}
  .confirm-info{background:var(--cream);border-radius:var(--r);padding:1.1rem;margin:1.25rem 0}
  .ci-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem}
  .ci-row .lbl{color:var(--muted)}
  .ci-row .val{font-weight:600}

  /* DOCTOR DASH */
  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1.5rem}
  .stat-c{background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:1.1rem;text-align:center;box-shadow:var(--shadow)}
  .stat-n{font-size:2rem;font-weight:700;color:var(--sage-d);line-height:1;font-family:'Playfair Display',serif}
  .stat-l{font-size:.75rem;color:var(--muted);margin-top:4px;font-weight:500}
  .tab-bar{display:flex;gap:2px;background:var(--cream);border-radius:var(--r);padding:3px;margin-bottom:1.5rem}
  .dtab{flex:1;text-align:center;padding:8px;border-radius:11px;font-size:.82rem;font-weight:600;cursor:pointer;color:var(--muted);border:none;background:transparent;transition:all .2s}
  .dtab.on{background:#fff;color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .appt-card{background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:1.1rem;display:flex;align-items:center;gap:12px;margin-bottom:.65rem;box-shadow:var(--shadow)}
  .time-box{background:var(--sage-d);color:#fff;border-radius:10px;padding:8px 12px;text-align:center;flex-shrink:0;min-width:62px}
  .time-box .t{font-size:.88rem;font-weight:700}
  .time-box .p{font-size:.68rem;opacity:.65}
  .appt-info h4{font-size:.9rem;font-weight:600}
  .appt-info p{font-size:.78rem;color:var(--muted);margin-top:1px}
  .status-pill{padding:4px 10px;border-radius:8px;font-size:.72rem;font-weight:600;margin-left:auto;white-space:nowrap}
  .s-ok{background:var(--ok-bg);color:var(--ok-txt)}
  .s-pend{background:var(--warn-bg);color:var(--warn-txt)}
  .s-done{background:var(--info-bg);color:var(--info-txt)}
  .pat-card{background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:1.25rem;margin-bottom:.75rem;box-shadow:var(--shadow)}
  .pat-head{display:flex;align-items:center;gap:12px;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)}
  .pat-ava{width:46px;height:46px;border-radius:12px;background:var(--skin);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;color:var(--sage-d);flex-shrink:0}
  .pat-head h4{font-size:.98rem;font-weight:600}
  .pat-head p{font-size:.8rem;color:var(--muted);margin-top:1px}
  .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .detail-cell{background:var(--cream);border-radius:8px;padding:8px 10px}
  .detail-cell .dl{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
  .detail-cell .dv{font-size:.86rem;font-weight:600;margin-top:2px}
  .pay-row{display:flex;justify-content:space-between;align-items:center;padding:.85rem 0;border-bottom:1px solid var(--border)}
  .pay-row:last-child{border-bottom:none}
  .pay-row h4{font-size:.88rem;font-weight:600}
  .pay-row p{font-size:.78rem;color:var(--muted);margin-top:2px}
  .pay-amt{font-weight:700;color:var(--sage-d)}
  .scan-detail-card{background:#fff;border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;margin-bottom:1rem}
  .sd-head{padding:1rem 1.25rem;background:var(--warm);border-bottom:1px solid var(--border)}
  .sd-body{padding:1.25rem}
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const initials = (name) => name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "??";
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
};
const todayStr = () => new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function Spinner({ small }) {
  return <div className="spinner spin" style={small ? {width:14,height:14} : {}} />;
}

function StatusPill({ status }) {
  const map = { confirmed:"s-ok", pending:"s-pend", completed:"s-done" };
  return <span className={`status-pill ${map[status] || "s-pend"}`}>{status}</span>;
}

// ── PATIENT SCAN TAB ──────────────────────────────────────────────────────────
function ScanTab({ user, db, refreshDb, onScanDone }) {
  const [imgData, setImgData] = useState(null);
  const [desc, setDesc] = useState("");
  const [syms, setSyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();
  const cameraRef = useRef();
  const ALL_SYMS = ["Itching","Redness","Flaking","Swelling","Pain","Burning","Discharge","Dry skin","Bumps"];

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setImgData(e.target.result);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const base64 = imgData ? imgData.split(",")[1] : null;
      const result = await analyzeWithClaude(base64, desc, syms);
      const scan = {
        id: "scan_" + Date.now(),
        userId: user.id,
        date: new Date().toISOString(),
        imageData: imgData,
        description: desc,
        symptoms: syms,
        result,
        consultBooked: false,
      };
      const newDb = { ...db, scans: [scan, ...db.scans] };
      save(newDb);
      refreshDb(newDb);
      onScanDone(scan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="scan-hero">
        <h2>Skin Analysis</h2>
        <p>Upload a photo for AI-powered diagnosis and home remedy suggestions</p>
      </div>
      <div
        className={`upload-area ${drag?"drag":""} ${imgData?"has-img":""}`}
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
        onClick={()=>!imgData && fileRef.current.click()}
      >
        {imgData
          ? <><img src={imgData} alt="Uploaded" className="upload-preview" /><p style={{marginTop:"0.6rem",fontSize:".8rem",color:"var(--sage)"}}>✓ Image ready · click to change</p></>
          : <><div className="u-icon">📤</div><h3>Drop image here or click to browse</h3><p>JPG, PNG, HEIC · Max 10MB</p></>
        }
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
      </div>
      <div className="upload-grid">
        <button className="ubtn cam" onClick={()=>cameraRef.current.click()}>📷 &nbsp;Camera scan</button>
        <button className="ubtn" onClick={()=>fileRef.current.click()}>🖼 &nbsp;Upload image</button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
      </div>
      <div className="section-label">Select symptoms (optional)</div>
      <div className="sym-wrap">
        {ALL_SYMS.map(s=>(
          <span key={s} className={`sym ${syms.includes(s)?"on":""}`} onClick={()=>setSyms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}>{s}</span>
        ))}
      </div>
      <div className="section-label">Describe your condition</div>
      <textarea rows={4} placeholder="When did it start? Any triggers (food, weather, new products)? How does it feel?" value={desc} onChange={e=>setDesc(e.target.value)} />
      <button className="analyze-btn" onClick={analyze} disabled={loading}>
        {loading ? <><Spinner /> Analyzing with AI...</> : "✨ Analyze with AI →"}
      </button>
    </div>
  );
}

// ── RESULT VIEW ───────────────────────────────────────────────────────────────
function ResultView({ scan, onBack, onAskDoctor }) {
  const r = scan.result;
  const sevClass = { mild:"sev-mild", moderate:"sev-moderate", severe:"sev-severe" }[r.severity] || "sev-moderate";
  return (
    <div className="section">
      <button className="back-btn" onClick={onBack}>← Back to scan</button>
      <div className="result-card">
        <div className="result-head">
          <div>
            <div style={{fontSize:".72rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:"2px"}}>Condition detected</div>
            <div className="cond-name">{r.condition}</div>
            <div className="cond-desc">{r.description}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"5px",alignItems:"flex-end",flexShrink:0,marginLeft:"auto"}}>
            <span className={`conf-pill ${sevClass}`}>{r.confidence}% match</span>
            <span className={`conf-pill ${sevClass}`} style={{fontSize:".72rem"}}>{r.severity}</span>
          </div>
        </div>
        <div className="result-body">
          <div style={{fontWeight:600,fontSize:".9rem",marginBottom:".25rem"}}>🌿 Home remedies (temporary relief)</div>
          <div className="remedy-grid">
            {r.remedies.map((rem,i)=>(
              <div key={i} className="remedy-row">
                <div className="rnum">{i+1}</div>
                <div><strong>{rem.title}</strong><span>{rem.detail}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {r.needsDoctor && (
        <div className="ask-banner">
          <div>
            <h4>Need a professional opinion?</h4>
            <p>{r.doctorNote}</p>
          </div>
          <button className="ask-btn" onClick={onAskDoctor}>Ask a Doctor</button>
        </div>
      )}
    </div>
  );
}

// ── HISTORY TAB ───────────────────────────────────────────────────────────────
function HistoryTab({ user, db, onView }) {
  const scans = db.scans.filter(s => s.userId === user.id);
  if (!scans.length) return (
    <div className="section empty-state">
      <div className="ei">🔬</div>
      <h3>No scans yet</h3>
      <p>Your scan history will appear here after your first analysis.</p>
    </div>
  );
  return (
    <div className="section">
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",marginBottom:"1.1rem"}}>Your scan history</div>
      {scans.map(s => (
        <div key={s.id} className="hist-item" onClick={()=>onView(s)}>
          <div className="hist-thumb">
            {s.imageData ? <img src={s.imageData} alt="" /> : "🔴"}
          </div>
          <div className="hist-info">
            <h4>{s.result?.condition || "Analysis"}</h4>
            <p>{s.symptoms?.length ? s.symptoms.join(", ") : "No symptoms selected"}</p>
            <span className={`hist-badge ${s.consultBooked?"bd":"bh"}`}>
              {s.consultBooked ? "Doctor consulted" : "Home remedies suggested"}
            </span>
          </div>
          <div className="hist-date">{fmtDate(s.date)}</div>
        </div>
      ))}
    </div>
  );
}

// ── BOOK DOCTOR MODAL ─────────────────────────────────────────────────────────
function BookModal({ user, db, scan, refreshDb, onClose }) {
  const [selDoc, setSelDoc] = useState(DEFAULT_DOCTORS[0]);
  const [selSlot, setSelSlot] = useState(DEFAULT_DOCTORS[0].slots[0]);
  const [step, setStep] = useState("select"); // select | confirm
  const [loading, setLoading] = useState(false);

  const fee = selDoc.fee + 50;

  const book = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const appt = {
      id: "appt_" + Date.now(),
      patientId: user.id,
      patientName: user.name,
      doctorId: selDoc.id,
      doctorName: selDoc.name,
      scanId: scan?.id,
      slot: selSlot,
      date: new Date().toISOString(),
      status: "confirmed",
      condition: scan?.result?.condition || "General consultation",
    };
    const payment = {
      id: "pay_" + Date.now(),
      patientId: user.id,
      patientName: user.name,
      doctorId: selDoc.id,
      doctorName: selDoc.name,
      amount: fee,
      date: new Date().toISOString(),
      apptId: appt.id,
    };
    const updatedScans = db.scans.map(s => s.id === scan?.id ? {...s, consultBooked:true} : s);
    const newDb = { ...db, appointments:[appt,...db.appointments], payments:[payment,...db.payments], scans:updatedScans };
    save(newDb);
    refreshDb(newDb);
    setLoading(false);
    setStep("confirmed");
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="handle" />
        {step === "select" && <>
          <h3>Consult a Dermatologist</h3>
          <p className="sheet-sub">Select a doctor and choose your preferred slot</p>
          <div className="doc-list">
            {DEFAULT_DOCTORS.map(d => (
              <div key={d.id} className={`doc-row ${selDoc.id===d.id?"sel":""}`} onClick={()=>{setSelDoc(d);setSelSlot(d.slots[0])}}>
                <div className="doc-ava">{d.avatar}</div>
                <div style={{flex:1}}>
                  <h4>{d.name}</h4>
                  <p>{d.spec} · {d.exp}</p>
                  <div className="slots">
                    {d.slots.map(sl=>(
                      <span key={sl} className={`slot ${selDoc.id===d.id&&selSlot===sl?"on":""}`}
                        onClick={e=>{e.stopPropagation();setSelDoc(d);setSelSlot(sl)}}>{sl}</span>
                    ))}
                  </div>
                </div>
                <div className="doc-fee">₹{d.fee}<br/><span className="star">★ {d.rating}</span></div>
              </div>
            ))}
          </div>
          <div className="price-box">
            <div className="price-row"><span>Consultation fee</span><span>₹{selDoc.fee}</span></div>
            <div className="price-row"><span>Platform fee</span><span>₹50</span></div>
            <div className="price-row total"><span>Total</span><span style={{color:"var(--sage-d)"}}>₹{fee}</span></div>
          </div>
          <button className="pay-btn" onClick={book} disabled={loading}>
            {loading ? <><Spinner small /> Processing...</> : `Pay ₹${fee} & Book →`}
          </button>
          <div className="cancel-txt" onClick={onClose}>Cancel</div>
        </>}
        {step === "confirmed" && <>
          <div className="confirm-big">✅</div>
          <h3 style={{textAlign:"center",marginBottom:".3rem"}}>Booking confirmed!</h3>
          <p className="sheet-sub" style={{textAlign:"center"}}>Your appointment has been booked successfully.</p>
          <div className="confirm-info">
            <div className="ci-row"><span className="lbl">Doctor</span><span className="val">{selDoc.name}</span></div>
            <div className="ci-row"><span className="lbl">Slot</span><span className="val">{selSlot}</span></div>
            <div className="ci-row"><span className="lbl">Date</span><span className="val">{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span></div>
            <div className="ci-row"><span className="lbl">Mode</span><span className="val">Video call</span></div>
            <div className="ci-row"><span className="lbl">Amount paid</span><span className="val" style={{color:"var(--sage-d)"}}>₹{fee}</span></div>
          </div>
          <button className="pay-btn" onClick={onClose}>Done</button>
        </>}
      </div>
    </div>
  );
}

// ── PATIENT APP ───────────────────────────────────────────────────────────────
function PatientApp({ user, db, refreshDb, onLogout }) {
  const [tab, setTab] = useState("scan");
  const [activeScan, setActiveScan] = useState(null);
  const [viewScan, setViewScan] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [bookScan, setBookScan] = useState(null);

  const handleScanDone = (scan) => { setActiveScan(scan); setTab("result"); };
  const handleAskDoctor = () => { setBookScan(activeScan); setShowBook(true); };
  const handleViewHist = (scan) => { setViewScan(scan); setTab("hist-detail"); };

  return (
    <>
      <div className="nav">
        <div className="nav-brand"><div className="ndot">🌿</div><span className="nname">DermaCare</span></div>
        <div className="nav-tabs">
          {["scan","history"].map(t=>(
            <button key={t} className={`ntab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <div className="nav-avatar">{initials(user.name)}</div>
          <span className="nav-name" style={{display:"none"}}>{user.name.split(" ")[0]}</span>
          <button className="logout" onClick={onLogout}>Log out</button>
        </div>
      </div>
      <div className="content">
        {tab==="scan" && <ScanTab user={user} db={db} refreshDb={refreshDb} onScanDone={handleScanDone} />}
        {tab==="result" && activeScan && <ResultView scan={activeScan} onBack={()=>setTab("scan")} onAskDoctor={handleAskDoctor} />}
        {tab==="history" && <HistoryTab user={user} db={db} onView={handleViewHist} />}
        {tab==="hist-detail" && viewScan && (
          <div className="section">
            <button className="back-btn" onClick={()=>setTab("history")}>← Back to history</button>
            <ResultView scan={viewScan} onBack={()=>setTab("history")} onAskDoctor={()=>{setBookScan(viewScan);setShowBook(true)}} />
          </div>
        )}
      </div>
      {showBook && <BookModal user={user} db={db} scan={bookScan} refreshDb={refreshDb} onClose={()=>setShowBook(false)} />}
    </>
  );
}

// ── DOCTOR APP ────────────────────────────────────────────────────────────────
function DoctorApp({ user, db, refreshDb, onLogout }) {
  const [tab, setTab] = useState("appointments");
  const docId = user.doctorId;
  const myAppts = db.appointments.filter(a => a.doctorId === docId);
  const myPayments = db.payments.filter(p => p.doctorId === docId);
  const patientIds = [...new Set(myAppts.map(a => a.patientId))];
  const patients = db.users.filter(u => patientIds.includes(u.id));
  const total = myPayments.reduce((s,p)=>s+p.amount, 0);
  const todayAppts = myAppts.filter(a => fmtDate(a.date)==="Today");

  return (
    <>
      <div className="nav">
        <div className="nav-brand"><div className="ndot">🌿</div><span className="nname">DermaCare</span></div>
        <div className="nav-right" style={{gap:8}}>
          <div className="nav-avatar" style={{background:"var(--sage-d)",color:"#fff"}}>{initials(user.name)}</div>
          <span className="nav-name">{user.name}</span>
          <button className="logout" onClick={onLogout}>Log out</button>
        </div>
      </div>
      <div className="content">
        <div className="stat-grid">
          <div className="stat-c"><div className="stat-n">{todayAppts.length || myAppts.length}</div><div className="stat-l">Appointments</div></div>
          <div className="stat-c"><div className="stat-n">{patients.length || patientIds.length}</div><div className="stat-l">Patients</div></div>
          <div className="stat-c"><div className="stat-n">₹{total.toLocaleString("en-IN")}</div><div className="stat-l">Total earnings</div></div>
        </div>
        <div className="tab-bar">
          {["appointments","patients","payments"].map(t=>(
            <button key={t} className={`dtab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {tab==="appointments" && (
          <div className="section">
            <div style={{fontSize:".83rem",color:"var(--muted)",marginBottom:"1rem"}}>{todayStr()}</div>
            {myAppts.length === 0 ? (
              <div className="empty-state"><div className="ei">📅</div><h3>No appointments yet</h3><p>Appointments booked by patients will appear here.</p></div>
            ) : myAppts.map(a => (
              <div key={a.id} className="appt-card">
                <div className="time-box"><div className="t">{a.slot?.split(" ")[0]||"--"}</div><div className="p">{a.slot?.split(" ")[1]||""}</div></div>
                <div className="appt-info"><h4>{a.patientName}</h4><p>{a.condition} · Video call</p></div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        )}

        {tab==="patients" && (
          <div className="section">
            {patients.length === 0 ? (
              <div className="empty-state"><div className="ei">👥</div><h3>No patients yet</h3><p>Your patients will appear here once they book a consultation.</p></div>
            ) : patients.map(p => {
              const patAppts = myAppts.filter(a=>a.patientId===p.id);
              const patScans = db.scans.filter(s=>s.userId===p.id);
              return (
                <div key={p.id} className="pat-card">
                  <div className="pat-head">
                    <div className="pat-ava">{initials(p.name)}</div>
                    <div><h4>{p.name}</h4><p>{p.age || "—"} yrs · {p.gender || "—"} · Patient</p></div>
                    <span className="status-pill s-ok" style={{marginLeft:"auto"}}>Active</span>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-cell"><div className="dl">Condition</div><div className="dv">{patAppts[0]?.condition || "—"}</div></div>
                    <div className="detail-cell"><div className="dl">Last visit</div><div className="dv">{fmtDate(patAppts[0]?.date) || "—"}</div></div>
                    <div className="detail-cell"><div className="dl">Consultations</div><div className="dv">{patAppts.length}</div></div>
                    <div className="detail-cell"><div className="dl">AI scans</div><div className="dv">{patScans.length}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="payments" && (
          <div className="section">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",marginBottom:"1.1rem"}}>Payment history</div>
            {myPayments.length === 0 ? (
              <div className="empty-state"><div className="ei">💳</div><h3>No payments yet</h3><p>Payment records will appear here once patients book consultations.</p></div>
            ) : (
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:"var(--r2)",padding:"1.1rem",boxShadow:"var(--shadow)"}}>
                {myPayments.map(p=>(
                  <div key={p.id} className="pay-row">
                    <div><h4>{p.patientName}</h4><p>Video consultation · {fmtDate(p.date)}</p></div>
                    <div className="pay-amt">₹{p.amount.toLocaleString("en-IN")}</div>
                  </div>
                ))}
                <div className="pay-row" style={{borderTop:"2px solid var(--border)",marginTop:"4px",paddingTop:"12px",borderBottom:"none"}}>
                  <div style={{fontWeight:700,fontSize:".95rem"}}>Total earnings</div>
                  <div className="pay-amt" style={{fontSize:"1.05rem"}}>₹{total.toLocaleString("en-IN")}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthPage({ role, db, onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"", age:"", gender:"Female" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleLogin = () => {
    setErr("");
    const u = db.users.find(u => u.email===form.email && u.password===form.password && u.role===role);
    if (!u) { setErr("Invalid email or password."); return; }
    onLogin(u);
  };

  const handleSignup = () => {
    setErr("");
    if (!form.name||!form.email||!form.password) { setErr("Please fill all fields."); return; }
    if (db.users.find(u=>u.email===form.email)) { setErr("Email already registered."); return; }
    const u = {
      id: "u_"+Date.now(), role, name:form.name, email:form.email,
      password:form.password, age:form.age||null, gender:form.gender||null,
      ...(role==="doctor"?{doctorId:"doc1"}:{}),
    };
    const newDb = {...db, users:[...db.users, u]};
    save(newDb);
    setOk("Account created! You can now log in.");
    setMode("login");
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box fade">
        <div className="auth-logo">
          <div className="dot">🌿</div>
          <span className="serif" style={{fontSize:"1.1rem"}}>DermaCare</span>
        </div>
        <h2>{mode==="login" ? (role==="patient"?"Welcome back":"Doctor portal") : "Create account"}</h2>
        <p className="auth-sub">{mode==="login" ? `Sign in to your ${role} account` : `Register as a new ${role}`}</p>
        {err && <div className="error-box">{err}</div>}
        {ok && <div className="success-box">{ok}</div>}
        {mode==="signup" && <>
          <div className="field"><label>Full name</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your full name" /></div>
          {role==="patient" && <>
            <div className="field"><label>Age</label><input type="number" value={form.age} onChange={e=>set("age",e.target.value)} placeholder="Your age" /></div>
            <div className="field"><label>Gender</label>
              <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={{width:"100%",padding:".75rem 1rem",border:"1.5px solid var(--border)",borderRadius:"var(--r)",background:"var(--cream)",fontSize:".93rem",outline:"none",color:"var(--text)"}}>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </div>
          </>}
        </>}
        <div className="field"><label>Email address</label><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com" /></div>
        <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" /></div>
        <button className="btn btn-sage" onClick={mode==="login"?handleLogin:handleSignup}>
          {mode==="login" ? "Sign in →" : "Create account →"}
        </button>
        <div className="auth-switch">
          {mode==="login" ? <>Don't have an account? <span onClick={()=>{setMode("signup");setErr("");setOk("")}}>Sign up</span></> : <>Already have an account? <span onClick={()=>{setMode("login");setErr("");setOk("")}}>Sign in</span></>}
        </div>
        <div className="back-link" onClick={onBack}>← Back to home</div>
        {mode==="login" && <div style={{marginTop:".75rem",textAlign:"center",fontSize:".75rem",color:"var(--hint)"}}>Demo: priya@example.com / demo123 (patient) &nbsp;|&nbsp; dr.mehta@clinic.com / demo123 (doctor)</div>}
      </div>
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function Landing({ onSelect }) {
  return (
    <div className="landing fade">
      <div className="landing-bg" />
      <div className="landing-brand">
        <div className="icon">🌿</div>
        <h1>DermaCare</h1>
        <p>AI-powered skin health, at your fingertips</p>
      </div>
      <div className="landing-cards">
        <div className="l-card pat" onClick={()=>onSelect("patient")}>
          <div className="ico">👤</div>
          <h3>Patient</h3>
          <p>Scan & get AI remedies</p>
        </div>
        <div className="l-card doc" onClick={()=>onSelect("doctor")}>
          <div className="ico">🩺</div>
          <h3>Doctor</h3>
          <p>Manage your patients</p>
        </div>
      </div>
      <div className="demo-hint">Try demo accounts: &nbsp;<span>priya@example.com</span> (patient) &nbsp;·&nbsp; <span>dr.mehta@clinic.com</span> (doctor) &nbsp;·&nbsp; password: <span>demo123</span></div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [db, setDb] = useState(() => initStorage());
  const [screen, setScreen] = useState("landing"); // landing | patient-auth | doctor-auth | patient-app | doctor-app
  const [currentUser, setCurrentUser] = useState(null);

  const refreshDb = useCallback((newDb) => { setDb(newDb); }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setScreen(user.role + "-app");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen("landing");
  };

  return (
    <>
      <style>{S}</style>
      {screen === "landing" && <Landing onSelect={r => setScreen(r+"-auth")} />}
      {screen === "patient-auth" && <AuthPage role="patient" db={db} onLogin={handleLogin} onBack={()=>setScreen("landing")} />}
      {screen === "doctor-auth" && <AuthPage role="doctor" db={db} onLogin={handleLogin} onBack={()=>setScreen("landing")} />}
      {screen === "patient-app" && currentUser && <PatientApp user={currentUser} db={db} refreshDb={refreshDb} onLogout={handleLogout} />}
      {screen === "doctor-app" && currentUser && <DoctorApp user={currentUser} db={db} refreshDb={refreshDb} onLogout={handleLogout} />}
    </>
  );
}
