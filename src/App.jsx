import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// COMPLETE SUBJECT DATABASE — Years 9–12 VCE + IB
// ─────────────────────────────────────────────
const ALL_SUBJECTS = {
  year9: {
    label: "Year 9",
    core: ["English","Mathematics","Science","History","Geography","Health & PE","Arts","Digital Technologies"],
    elective: ["Drama","Music","Visual Arts","Food Technology","Wood/Metal Technology","Media Studies","Japanese","French","Indonesian","Chinese","Italian","LOTE"]
  },
  year10: {
    label: "Year 10",
    core: ["English","Mathematics","Science","History","Geography","Health & PE"],
    elective: ["Drama","Music","Visual Arts","Food Technology","Media Studies","Commerce","Psychology","Philosophy","Japanese","French","Indonesian","Chinese","Computing","Design & Technology"]
  },
  vce: {
    label: "VCE",
    groups: {
      "English & Languages": ["English","English Language","Literature","EAL/D","Japanese SL","French SL","Chinese SL","Indonesian SL","Italian SL","Spanish SL","Latin","Classical Studies"],
      "Mathematics": ["Foundation Maths","General Maths","Maths Methods","Specialist Maths"],
      "Sciences": ["Biology","Chemistry","Physics","Psychology","Environmental Science","Health & Human Development"],
      "Humanities & Social Sciences": ["History: Revolutions","History: Modern","Australian History","Legal Studies","Politics","Sociology","Philosophy","Religion & Society"],
      "Business & Economics": ["Accounting","Business Management","Economics"],
      "Arts & Design": ["Visual Communication Design","Studio Arts","Art — Making & Exhibiting","Media","Music","Drama","Dance","Theatre Studies"],
      "Technology & Computing": ["Applied Computing","Software Development","Systems Engineering","Food Studies"],
      "Physical Education": ["Physical Education","Outdoor & Environmental Studies"],
      "Vocational": ["VET Hospitality","VET Construction","VET Business","VET Nursing","VET IT"]
    }
  },
  ib: {
    label: "IB Diploma",
    groups: {
      "Group 1 — Studies in Language": ["English A: Literature HL","English A: Language & Literature HL","English A: Literature SL","Self-Taught Language A"],
      "Group 2 — Language Acquisition": ["English B HL","French B HL","Japanese B SL","Spanish B SL","Chinese B SL","French ab initio","Spanish ab initio"],
      "Group 3 — Individuals & Societies": ["History HL","History SL","Economics HL","Economics SL","Geography HL","Geography SL","Psychology HL","Psychology SL","Global Politics HL","Business Management HL","Philosophy HL"],
      "Group 4 — Sciences": ["Biology HL","Biology SL","Chemistry HL","Chemistry SL","Physics HL","Physics SL","Environmental Systems SL","Computer Science HL","Sports Science SL"],
      "Group 5 — Mathematics": ["Maths: Analysis & Approaches HL","Maths: Analysis & Approaches SL","Maths: Applications & Interpretation HL","Maths: Applications & Interpretation SL"],
      "Group 6 — Arts": ["Visual Arts HL","Visual Arts SL","Music HL","Music SL","Theatre HL","Theatre SL","Film SL"],
      "Core Requirements": ["Theory of Knowledge (TOK)","Extended Essay (EE)","CAS (Creativity, Activity, Service)"]
    }
  }
};

const SUBJECT_COLORS = {
  "English": "#FF6584", "Mathematics": "#6C63FF", "Maths Methods": "#6C63FF",
  "Specialist Maths": "#4A3FD4", "Chemistry": "#43C6AC", "Physics": "#F7971E",
  "Biology": "#56C785", "Psychology": "#A18CD1", "History": "#FDB99B",
  "Legal Studies": "#FF9A56", "Economics": "#FFD700", "Software Development": "#00D4FF",
  "Applied Computing": "#00B8D4", "Visual Communication Design": "#FF6B9D",
  "Business Management": "#F7B731", "Accounting": "#FC5C7D", "Media": "#A29BFE",
  "English Language": "#FD79A8", "Literature": "#E17055", "Music": "#74B9FF",
  "Drama": "#FDCB6E", "Health & Human Development": "#55EFC4",
  "Environmental Science": "#00B894", "Geography": "#81ECEC",
  "Theory of Knowledge (TOK)": "#6C63FF", "Extended Essay (EE)": "#FF6584",
  "default": "#7C6AF7"
};

const getColor = (subj) => SUBJECT_COLORS[subj] || SUBJECT_COLORS["default"];

const FUTURE_PATHS = [
  { id: "medicine", label: "Medicine / Health Sciences", icon: "🏥", atar: "99+" },
  { id: "law", label: "Law", icon: "⚖️", atar: "95+" },
  { id: "engineering", label: "Engineering", icon: "⚙️", atar: "90+" },
  { id: "cs", label: "Computer Science / IT", icon: "💻", atar: "85+" },
  { id: "business", label: "Business / Commerce", icon: "📊", atar: "80+" },
  { id: "arts_hum", label: "Arts / Humanities", icon: "🎨", atar: "70+" },
  { id: "science", label: "Science / Research", icon: "🔬", atar: "85+" },
  { id: "education", label: "Education / Teaching", icon: "📚", atar: "65+" },
  { id: "creative", label: "Creative Industries", icon: "🎬", atar: "60+" },
  { id: "trade", label: "Trades / Vocational", icon: "🔧", atar: "N/A" },
  { id: "undecided", label: "Not Sure Yet", icon: "🤔", atar: "—" },
];

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const LIGHT_CSS = `
  --bg:#F2EDE4;--bg2:#FBF7F2;--bg3:#EDE6DA;--bg4:#E3D9CC;
  --border:#1A1A1A;--border-light:#E0DBD3;
  --text:#1A1A1A;--text2:#3D3830;
  --muted:#8A8070;--muted2:#B5AFA5;
  --accent:#1A1A1A;--gold:#C8A96E;--gold-light:#F5ECD8;
  --success:#2C7A4B;--success-bg:#E8F5EE;
  --danger:#C0392B;--danger-bg:#FDECEA;
  --shadow:0 2px 12px rgba(26,26,26,0.08);
`;
const DARK_CSS = `
  --bg:#111110;--bg2:#1C1C1A;--bg3:#242422;--bg4:#2E2E2B;
  --border:#3A3A36;--border-light:#2E2E2B;
  --text:#F5F2EC;--text2:#C8C4BA;
  --muted:#8A8070;--muted2:#5A5650;
  --accent:#C8A96E;--gold:#C8A96E;--gold-light:#2A2518;
  --success:#4CAF7D;--success-bg:#0D2018;
  --danger:#E05545;--danger-bg:#200D0A;
  --shadow:0 2px 12px rgba(0,0,0,0.35);
`;

const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{ ${LIGHT_CSS}
  --ff:'Inter',-apple-system,sans-serif;
  --fi:'Georgia',serif;
  --r:14px;--r2:20px;--r3:28px;
}
[data-theme="dark"]{ ${DARK_CSS} }

html,body{background:var(--bg);color:var(--text);font-family:var(--ff);height:100%;-webkit-font-smoothing:antialiased;}

/* SCROLLBAR */
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:4px;}

/* LAYOUT */
.app{display:flex;height:100vh;overflow:hidden;}

/* SIDEBAR */
.sidebar{
  width:238px;min-width:238px;background:var(--bg2);
  border-right:1.5px solid var(--border);
  display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;
}
.logo{padding:18px 16px 14px;border-bottom:1.5px solid var(--border);display:flex;align-items:center;gap:10px;}
.logo-text{font-size:14px;font-weight:900;letter-spacing:-.03em;color:var(--text);}
.logo-sub{display:block;font-size:9px;font-weight:600;color:var(--muted);letter-spacing:.05em;margin-top:1px;text-transform:uppercase;}
.nav-section{padding:10px 8px 0;}
.nav-lbl{font-size:9px;font-weight:800;color:var(--muted2);letter-spacing:.12em;text-transform:uppercase;padding:0 8px;margin-bottom:3px;}
.ni{
  display:flex;align-items:center;gap:9px;padding:9px 12px;
  border-radius:var(--r2);cursor:pointer;font-size:12.5px;font-weight:600;color:var(--muted);
  transition:all .15s;margin-bottom:3px;border:1.5px solid transparent;
  background:transparent;width:100%;text-align:left;font-family:var(--ff);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.ni:hover{background:var(--bg3);color:var(--text);border-color:var(--border-light);}
.ni.active{background:var(--bg3);color:var(--text);font-weight:800;border-color:var(--border-light);border-left:3px solid var(--text);}
[data-theme="dark"] .ni.active{background:var(--bg3);color:var(--accent);font-weight:800;border-color:var(--border);border-left:3px solid var(--accent);}
.ni-icon{font-size:14px;width:20px;text-align:center;flex-shrink:0;}
.ni-badge{margin-left:auto;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;background:var(--gold-light);color:var(--gold);border:1px solid var(--gold);}
.btn-danger{background:var(--danger-bg);color:var(--danger);border-color:var(--danger);}
.btn-danger:hover{opacity:.85;}

.sb-bottom{margin-top:auto;border-top:1.5px solid var(--border);padding:12px 10px;}
.user-row{display:flex;align-items:center;gap:9px;padding:8px;border-radius:var(--r);cursor:pointer;border:1.5px solid transparent;transition:all .15s;}
.user-row:hover{background:var(--bg3);border-color:var(--border-light);}
.av{width:30px;height:30px;border-radius:50%;background:var(--text);color:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;border:1.5px solid var(--border);}
.u-name{font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.u-sub{font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.xp-row{margin-bottom:10px;}
.xp-lbl{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);font-weight:600;margin-bottom:5px;}
.xp-track{height:4px;background:var(--bg4);border-radius:4px;overflow:hidden;border:1px solid var(--border-light);}
.xp-fill{height:100%;background:var(--text);border-radius:4px;transition:width .6s ease;}
[data-theme="dark"] .xp-fill{background:var(--accent);}

/* MAIN */
.main{flex:1;overflow:hidden;background:var(--bg);display:flex;flex-direction:column;position:relative;}
.topbar{
  height:56px;border-bottom:1.5px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 26px;background:var(--bg2);flex-shrink:0;
}
.topbar-title{font-size:15px;font-weight:800;letter-spacing:-.02em;color:var(--text);}
.content{flex:1;overflow-y:auto;padding:24px 26px 40px;max-width:1100px;width:100%;margin:0 auto;}

/* CHIPS */
.chip{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;font-size:11px;font-weight:700;border:1.5px solid;}
.chip-fire{background:var(--danger-bg);color:var(--danger);border-color:var(--danger);}
.chip-xp{background:var(--gold-light);color:var(--gold);border-color:var(--gold);}

.icon-btn{width:34px;height:34px;border-radius:var(--r);background:var(--bg3);border:1.5px solid var(--border-light);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .15s;position:relative;}
.icon-btn:hover{background:var(--bg4);border-color:var(--border);}

/* CARDS */
.card{background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;margin-bottom:16px;}
.ch{padding:14px 18px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;}
.ct{font-size:13px;font-weight:800;letter-spacing:-.01em;color:var(--text);}
.cb{padding:18px;}
.cl{font-size:12px;color:var(--muted);cursor:pointer;font-weight:600;transition:color .15s;}
.cl:hover{color:var(--text);}

/* GRID */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}

/* STATS */
.stat{background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r2);padding:18px;}
.sv{font-size:26px;font-weight:900;letter-spacing:-.03em;margin-bottom:4px;color:var(--text);}
.sl{font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;}
.sc{font-size:11px;font-weight:600;color:var(--muted);}
.sc.up{color:var(--success);}
.sc.dn{color:var(--danger);}

/* SUBJECT CARDS */
.subj-card{background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r2);padding:16px;cursor:pointer;transition:all .18s;position:relative;overflow:hidden;}
.subj-card:hover{background:var(--bg3);transform:translateY(-1px);box-shadow:var(--shadow);}
.sn{font-size:13px;font-weight:800;color:var(--text);letter-spacing:-.01em;}
.su{font-size:9px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-top:2px;}
.mb{height:5px;background:var(--bg4);border-radius:4px;overflow:hidden;margin-bottom:4px;border:1px solid var(--border-light);}
.mf{height:100%;border-radius:4px;transition:width 1s ease;}
.ml{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);font-weight:600;}

/* BUTTONS */
.btn{font-family:var(--ff);font-size:12.5px;font-weight:700;padding:9px 18px;border-radius:30px;border:1.5px solid var(--border);cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;letter-spacing:-.01em;white-space:nowrap;}
.btn-p,.btn-primary{background:var(--text);color:var(--bg2);border-color:var(--text);}
.btn-p:hover,.btn-primary:hover{opacity:.85;}
[data-theme="dark"] .btn-p,[data-theme="dark"] .btn-primary{background:var(--accent);color:var(--bg);border-color:var(--accent);}
.btn-s,.btn-secondary{background:var(--bg3);color:var(--text);border-color:var(--border-light);}
.btn-s:hover,.btn-secondary:hover{background:var(--bg4);border-color:var(--border);}
.btn-g,.btn-ghost{background:transparent;color:var(--muted);border-color:transparent;}
.btn-g:hover,.btn-ghost:hover{background:var(--bg3);color:var(--text);border-color:var(--border-light);}
.btn-danger{background:var(--danger-bg);color:var(--danger);border-color:var(--danger);}
.btn-sm{font-size:11px;padding:5px 13px;border-radius:20px;}
.btn-full{width:100%;justify-content:center;}
.btn:disabled{opacity:.45;cursor:not-allowed;}

/* INPUTS */
.input,.auth-input{width:100%;background:var(--bg3);border:1.5px solid var(--border-light);border-radius:var(--r);padding:11px 14px;color:var(--text);font-size:13px;font-family:var(--ff);outline:none;transition:border-color .15s;}
.input:focus,.auth-input:focus{border-color:var(--border);}
.input::placeholder,.auth-input::placeholder{color:var(--muted2);}
textarea.input{resize:vertical;min-height:80px;line-height:1.6;}
select.input{cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8070' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px;}

/* TAGS */
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;border:1.5px solid;letter-spacing:.02em;}
.tag-a,.tag-sac{background:var(--danger-bg);color:var(--danger);border-color:var(--danger);}
.tag-r,.tag-exam{background:var(--gold-light);color:var(--gold);border-color:var(--gold);}
.tag-g,.tag-new{background:var(--success-bg);color:var(--success);border-color:var(--success);}
.tag-gold{background:var(--gold-light);color:var(--gold);border-color:var(--gold);}

/* SWITCH */
.switch{width:44px;height:24px;border-radius:12px;background:var(--bg4);border:1.5px solid var(--border-light);cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.switch.on{background:var(--text);border-color:var(--text);}
[data-theme="dark"] .switch.on{background:var(--accent);border-color:var(--accent);}
.switch-knob{width:17px;height:17px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.switch.on .switch-knob{left:22px;}

/* FLASHCARDS */
.fc-wrap{perspective:1200px;cursor:pointer;margin:8px 0;}
.fc-inner{position:relative;min-height:190px;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.4,0,.2,1);border:1.5px solid var(--border);border-radius:var(--r2);}
.fc-inner.flip{transform:rotateY(180deg);}
.fc-face{position:absolute;inset:0;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px;border-radius:var(--r2);background:var(--bg2);}
.fc-back{transform:rotateY(180deg);background:var(--bg3);}
.fc-sub{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}
.fc-q{font-size:16px;font-weight:700;text-align:center;line-height:1.5;color:var(--text);}
.fc-a{font-size:14px;font-weight:600;text-align:center;line-height:1.6;color:var(--text2);}
.fc-hint{font-size:11px;color:var(--muted2);margin-top:16px;}

/* QUIZ */
.qopt{padding:11px 14px;border-radius:var(--r);border:1.5px solid var(--border-light);margin-bottom:7px;cursor:pointer;font-size:13px;transition:all .15s;display:flex;align-items:center;gap:10px;background:var(--bg2);color:var(--text);}
.qopt:hover:not(.qdis){background:var(--bg3);border-color:var(--border);}
.qdis{cursor:default;}
.qcor{background:var(--success-bg)!important;border-color:var(--success)!important;color:var(--success)!important;}
.qwrg{background:var(--danger-bg)!important;border-color:var(--danger)!important;color:var(--danger)!important;}
.ql{width:26px;height:26px;border-radius:50%;background:var(--bg4);border:1.5px solid var(--border-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
.qexp{background:var(--success-bg);border:1.5px solid var(--success);border-radius:var(--r);padding:11px 14px;font-size:13px;color:var(--text2);margin-top:10px;line-height:1.6;}

/* CHAT */
.chat-wrap{display:flex;flex-direction:column;height:calc(100vh - 56px);}
.chat-msgs{flex:1;overflow-y:auto;padding:20px 26px;display:flex;flex-direction:column;gap:14px;}
.msg{display:flex;gap:10px;align-items:flex-start;}
.msg.user{flex-direction:row-reverse;}
.m-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;border:1.5px solid var(--border);}
.m-av.ai{background:var(--text);color:var(--bg2);}
.m-av.user{background:var(--gold-light);color:var(--gold);border-color:var(--gold);}
.m-bub{max-width:72%;padding:12px 16px;border-radius:var(--r2);font-size:13px;line-height:1.7;border:1.5px solid var(--border-light);}
.msg.ai .m-bub{background:var(--bg2);color:var(--text);border-radius:var(--r2) var(--r2) var(--r2) 4px;}
.msg.user .m-bub{background:var(--text);color:var(--bg2);border-color:var(--text);border-radius:var(--r2) var(--r2) 4px var(--r2);}
[data-theme="dark"] .msg.user .m-bub{background:var(--accent);color:var(--bg);border-color:var(--accent);}
.chat-in-area{border-top:1.5px solid var(--border);padding:12px 26px 14px;background:var(--bg2);flex-shrink:0;}
.chat-sug-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;}
.chat-sug-row::-webkit-scrollbar{display:none;}
.sug{white-space:nowrap;padding:5px 13px;border-radius:20px;border:1.5px solid var(--border-light);background:var(--bg3);color:var(--muted);font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--ff);transition:all .15s;flex-shrink:0;}
.sug:hover{border-color:var(--border);color:var(--text);background:var(--bg4);}
.chat-row{display:flex;gap:10px;align-items:flex-end;}
.chat-inp{flex:1;background:var(--bg3);border:1.5px solid var(--border-light);border-radius:var(--r);padding:11px 14px;color:var(--text);font-size:13px;font-family:var(--ff);outline:none;resize:none;transition:border-color .15s;line-height:1.5;}
.chat-inp:focus{border-color:var(--border);}

/* SUBTOPIC CARDS */
.subtopic-card{background:var(--bg2);border:1.5px solid var(--border-light);border-radius:var(--r2);overflow:hidden;transition:border-color .2s;}
.subtopic-card.open{border-color:var(--border);}
.formula-box{background:var(--gold-light);border:1.5px solid var(--gold);border-radius:var(--r);padding:10px 14px;margin:0 16px;}
.formula-label{font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:4px;}
.formula-text{font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:var(--text2);}

/* HEATMAP */
.heat{display:grid;grid-template-columns:repeat(17,1fr);gap:4px;}
.hc{aspect-ratio:1;border-radius:3px;background:var(--bg4);border:1px solid var(--border-light);}
.hc.h1{background:#E8E0D0;}
.hc.h2{background:#C8A96E;opacity:.4;}
.hc.h3{background:#C8A96E;opacity:.7;}
.hc.h4{background:#C8A96E;}

/* LEADERBOARD */
.lb-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light);}
.lb-row:last-child{border-bottom:none;}
.lb-row.me{background:var(--gold-light);margin:0 -20px;padding:10px 20px;border-radius:var(--r);border-color:transparent;}

/* CALENDAR */
.plan-day{background:var(--bg3);border-radius:var(--r);border:1.5px solid var(--border-light);padding:10px 8px;min-height:76px;}
.plan-day.today{background:var(--text);border-color:var(--text);}
.plan-dl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:3px;}
.plan-dn{font-size:18px;font-weight:900;color:var(--text);margin-bottom:5px;}
.plan-day.today .plan-dl,.plan-day.today .plan-dn{color:var(--bg2);}
.plan-ev{font-size:9px;font-weight:700;padding:2px 5px;border-radius:5px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* UPCOMING */
.up-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light);}
.up-item:last-child{border-bottom:none;}
.up-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.up-info{flex:1;}
.up-name{font-size:13px;font-weight:700;color:var(--text);}
.up-sub{font-size:11px;color:var(--muted);margin-top:1px;display:flex;gap:6px;align-items:center;}
.up-days{font-size:13px;font-weight:900;text-align:right;letter-spacing:-.02em;}

/* ONBOARDING */
.ob-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:16px;}
.ob-card{width:100%;max-width:520px;background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r3);padding:26px 22px;}
.ob-logo{text-align:center;margin-bottom:6px;}
.ob-tag{text-align:center;font-size:10px;color:var(--muted);font-weight:600;margin-bottom:20px;letter-spacing:.06em;text-transform:uppercase;}
.ob-step{font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);margin-bottom:6px;}
.ob-title{font-size:20px;font-weight:900;letter-spacing:-.03em;color:var(--text);margin-bottom:5px;}
.ob-sub{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:18px;}
.ob-progress{height:3px;background:var(--bg4);border-radius:3px;overflow:hidden;margin-bottom:22px;}
.ob-progress-fill{height:100%;background:var(--text);border-radius:3px;transition:width .4s ease;}
[data-theme="dark"] .ob-progress-fill{background:var(--accent);}

/* Onboarding option grid */
.ob-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.ob-subj-grid{display:flex;flex-wrap:wrap;gap:8px;}

/* Onboarding option — button element for reliable mobile touch */
.ob-opt{
  background:var(--bg3);border:1.5px solid var(--border-light);
  border-radius:var(--r2);padding:13px 12px;cursor:pointer;
  text-align:left;transition:all .15s;font-family:var(--ff);
  width:100%;display:flex;flex-direction:column;gap:3px;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
  min-height:60px;
}
.ob-opt:hover,.ob-opt:active{background:var(--bg4);border-color:var(--border);}
.ob-opt.sel{background:var(--text);border-color:var(--text);}
[data-theme="dark"] .ob-opt.sel{background:var(--accent);border-color:var(--accent);}
.ob-opt-top{display:flex;align-items:center;gap:8px;}
.ob-opt-icon{font-size:17px;flex-shrink:0;}
.ob-opt-label{font-size:13px;font-weight:700;color:var(--text);line-height:1.3;}
.ob-opt.sel .ob-opt-label,.ob-opt.sel .ob-opt-sub{color:var(--bg2);}
[data-theme="dark"] .ob-opt.sel .ob-opt-label,[data-theme="dark"] .ob-opt.sel .ob-opt-sub{color:var(--bg);}
.ob-opt-sub{font-size:11px;color:var(--muted);padding-left:25px;}

/* Subject pill buttons */
.ob-subj-btn{
  padding:7px 13px;border-radius:20px;font-size:12px;font-weight:600;
  cursor:pointer;border:1.5px solid var(--border-light);
  background:var(--bg3);color:var(--muted);font-family:var(--ff);
  transition:all .15s;-webkit-tap-highlight-color:transparent;
  touch-action:manipulation;min-height:36px;
}
.ob-subj-btn:hover,.ob-subj-btn:active{border-color:var(--border);color:var(--text);}
.ob-subj-btn.sel{background:var(--text);color:var(--bg2);border-color:var(--text);}
[data-theme="dark"] .ob-subj-btn.sel{background:var(--accent);color:var(--bg);border-color:var(--accent);}

/* AUTH */
.auth-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:16px;}
.auth-card{width:100%;max-width:400px;background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r3);padding:30px 26px;}
.auth-logo{text-align:center;margin-bottom:8px;}
.auth-title{font-size:20px;font-weight:900;letter-spacing:-.03em;text-align:center;color:var(--text);margin-bottom:4px;}
.auth-sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:22px;line-height:1.5;}
.auth-input{width:100%;background:var(--bg3);border:1.5px solid var(--border-light);border-radius:var(--r);padding:12px 14px;color:var(--text);font-size:16px;font-family:var(--ff);outline:none;transition:border-color .15s;display:block;margin-bottom:10px;}
.auth-input:focus{border-color:var(--border);}
.auth-input::placeholder{color:var(--muted2);}
.google-btn{width:100%;padding:13px;border-radius:30px;border:1.5px solid var(--border);background:var(--bg2);color:var(--text);font-size:14px;font-weight:700;font-family:var(--ff);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .15s;margin-bottom:12px;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
.google-btn:hover,.google-btn:active{background:var(--bg3);}
.divider{display:flex;align-items:center;gap:12px;color:var(--muted2);font-size:11px;font-weight:600;margin:12px 0;text-transform:uppercase;letter-spacing:.06em;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border-light);}

/* Global touch fix */
.btn{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}

/* RING */
.ring-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;}
.ring-label{position:absolute;font-size:9px;font-weight:800;color:var(--text);}

/* TYPING DOTS */
.typing-dot{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:bounce .8s infinite;display:inline-block;}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4;}40%{transform:translateY(-6px);opacity:1;}}

/* ANIMATIONS */
.fade-up{animation:fadeUp .25s ease;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* MASTERY */
.mast-row{margin-bottom:12px;}
.mast-hd{display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--text);margin-bottom:5px;}

/* ACHIEVEMENT */
.ach{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light);}
.ach:last-child{border-bottom:none;}
.ach-ic{width:36px;height:36px;border-radius:var(--r);background:var(--bg4);border:1.5px solid var(--border-light);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;filter:grayscale(1);opacity:.4;}
.ach.earned .ach-ic{filter:none;opacity:1;background:var(--gold-light);border-color:var(--gold);}
.ach-name{font-size:13px;font-weight:700;color:var(--text);}
.ach-desc{font-size:11px;color:var(--muted);margin-top:1px;}

/* MOBILE RESPONSIVE */
@media (max-width:768px){
  .sidebar{display:none;}
  .g4{grid-template-columns:1fr 1fr;}
  .g3{grid-template-columns:1fr 1fr;}
  .g2{grid-template-columns:1fr;}
  .content{padding:14px 14px 80px;}
  .topbar{padding:0 14px;height:52px;}
  .chat-msgs{padding:12px 14px;}
  .chat-in-area{padding:8px 14px 10px;}
  .ob-card{padding:22px 16px;border-radius:var(--r2);}
  .ob-grid{grid-template-columns:1fr 1fr;}
  .heat{grid-template-columns:repeat(10,1fr);}
  .subj-card{padding:13px;}
  .card-body,.cb{padding:14px;}
  .topbar-title{font-size:14px;}

  /* Mobile bottom nav bar */
  .mobile-nav{
    display:flex;position:fixed;bottom:0;left:0;right:0;
    background:var(--bg2);border-top:1.5px solid var(--border);
    padding:6px 4px;padding-bottom:max(10px,env(safe-area-inset-bottom));
    z-index:200;gap:2px;
  }
  .mobile-nav-item{
    flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
    padding:5px 2px;cursor:pointer;border-radius:var(--r);
    border:none;background:transparent;font-family:var(--ff);
    -webkit-tap-highlight-color:transparent;touch-action:manipulation;
    min-height:44px;justify-content:center;
  }
  .mobile-nav-item.active .mobile-nav-icon-wrap{background:var(--bg3);border-radius:var(--r);}
  .mobile-nav-icon-wrap{padding:4px 14px;border-radius:var(--r);}
  .mobile-nav-icon{font-size:20px;line-height:1;display:block;}
  .mobile-nav-label{font-size:10px;font-weight:700;color:var(--muted);}
  .mobile-nav-item.active .mobile-nav-label{color:var(--text);}
}
@media (min-width:769px){
  .mobile-nav{display:none;}
}
`;


// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────
function Ring({ val, size = 72, stroke = 6, color = "#7C6AF7" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c-(val/100)*c} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1s ease"}}/>
      </svg>
      <div className="ring-lbl" style={{ fontSize: size*.2, color }}>{val}%</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg ai">
      <div className="m-av m-ai-av">🤖</div>
      <div className="m-bub" style={{ display:"flex", gap:5, alignItems:"center", padding:"14px 18px" }}>
        {[0,.25,.5].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUPABASE CLIENT
// ─────────────────────────────────────────────
// ⚠️  PASTE YOUR SUPABASE CREDENTIALS HERE
// Get them from: supabase.com → your project → Settings → API
const SUPABASE_URL = "https://ybxfjndeckyynhgsgqma.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieGZqbmRlY2t5eW5oZ3NncW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTcxNTYsImV4cCI6MjA5Mzg5MzE1Nn0.CaPL1ydby2DsPMbM_IsDovZiGWxz7PF0j_cTuLVw4dk";

// Tiny Supabase client — no npm needed, works in any browser/artifact
const supabase = (() => {
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };
  const base = SUPABASE_URL;

  const setSession = (session) => {
    if (session) localStorage.setItem("sb_session", JSON.stringify(session));
    else localStorage.removeItem("sb_session");
  };
  const getSession = () => {
    try { return JSON.parse(localStorage.getItem("sb_session")); } catch { return null; }
  };

  return {
    auth: {
      getSession,

      // Email sign up
      signUp: async ({ email, password, name }) => {
        const r = await fetch(`${base}/auth/v1/signup`, {
          method: "POST", headers,
          body: JSON.stringify({ email, password, data: { full_name: name } })
        });
        const d = await r.json();
        if (d.access_token) setSession(d);
        return d;
      },

      // Email sign in
      signIn: async ({ email, password }) => {
        const r = await fetch(`${base}/auth/v1/token?grant_type=password`, {
          method: "POST", headers,
          body: JSON.stringify({ email, password })
        });
        const d = await r.json();
        if (d.access_token) setSession(d);
        return d;
      },

      // Google OAuth — redirects browser to Google
      signInWithGoogle: () => {
        const redirectTo = window.location.origin + window.location.pathname;
        window.location.href =
          `${base}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&client_id=160920173113-s61mtpn4gd3228ma7v9a2uea0hbcldd1.apps.googleusercontent.com`;
      },

      // Magic link (email OTP)
      sendMagicLink: async (email) => {
        const r = await fetch(`${base}/auth/v1/magiclink`, {
          method: "POST", headers,
          body: JSON.stringify({ email })
        });
        return r.json();
      },

      // Handle OAuth callback (call on page load)
      handleCallback: async () => {
        const hash = window.location.hash;
        if (!hash.includes("access_token")) return null;
        const params = new URLSearchParams(hash.replace("#", "?"));
        const session = {
          access_token: params.get("access_token"),
          refresh_token: params.get("refresh_token"),
          user: { email: params.get("email") }
        };
        // Fetch user details
        try {
          const r = await fetch(`${base}/auth/v1/user`, {
            headers: { ...headers, Authorization: `Bearer ${session.access_token}` }
          });
          const u = await r.json();
          session.user = u;
          setSession(session);
          window.location.hash = ""; // clean URL
        } catch {}
        return session;
      },

      signOut: () => {
        setSession(null);
        window.location.reload();
      }
    },

    // Save user profile to DB
    saveProfile: async (userId, profile, accessToken) => {
      const r = await fetch(`${base}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify({ id: userId, ...profile, updated_at: new Date().toISOString() })
      });
      return r.json();
    },

    // Load user profile from DB
    loadProfile: async (userId, accessToken) => {
      const r = await fetch(`${base}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: { ...headers, Authorization: `Bearer ${accessToken}` }
      });
      const d = await r.json();
      return Array.isArray(d) ? d[0] : null;
    },

    // ── TUTOR MARKETPLACE ──
    getTutors: async (token) => {
      const r = await fetch(`${base}/rest/v1/tutor_profiles?order=rating.desc&select=*`, {
        headers: { ...headers, Authorization: `Bearer ${token}` }
      });
      return r.json();
    },

    getMyTutorProfile: async (userId, token) => {
      const r = await fetch(`${base}/rest/v1/tutor_profiles?user_id=eq.${userId}&select=*`, {
        headers: { ...headers, Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      return Array.isArray(d) ? d[0] : null;
    },

    createTutorProfile: async (profile, token) => {
      const r = await fetch(`${base}/rest/v1/tutor_profiles`, {
        method: "POST",
        headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "return=representation" },
        body: JSON.stringify(profile)
      });
      const d = await r.json();
      return Array.isArray(d) ? d[0] : d;
    },

    updateTutorProfile: async (userId, profile, token) => {
      const r = await fetch(`${base}/rest/v1/tutor_profiles?user_id=eq.${userId}`, {
        method: "PATCH",
        headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "return=representation" },
        body: JSON.stringify({ ...profile, updated_at: new Date().toISOString() })
      });
      const d = await r.json();
      return Array.isArray(d) ? d[0] : d;
    },

    deleteTutorProfile: async (userId, token) => {
      await fetch(`${base}/rest/v1/tutor_profiles?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: { ...headers, Authorization: `Bearer ${token}` }
      });
    },

    getReviews: async (tutorId, token) => {
      const r = await fetch(`${base}/rest/v1/tutor_reviews?tutor_id=eq.${tutorId}&order=created_at.desc`, {
        headers: { ...headers, Authorization: `Bearer ${token}` }
      });
      return r.json();
    },

    addReview: async (tutorId, reviewerId, reviewerName, rating, comment, token) => {
      const r = await fetch(`${base}/rest/v1/tutor_reviews`, {
        method: "POST",
        headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "return=representation" },
        body: JSON.stringify({ tutor_id: tutorId, reviewer_id: reviewerId, reviewer_name: reviewerName, rating, comment })
      });
      return r.json();
    }
  };
})();

// ─────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [showMagic, setShowMagic] = useState(false);

  // Check if credentials are configured
  const configured = SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

  const handleGoogle = () => {
    if (!configured) { setError("⚠️ Add your Supabase credentials first — see the setup guide."); return; }
    supabase.auth.signInWithGoogle();
  };

  const handleEmail = async () => {
    if (!email || !pass) { setError("Please enter your email and password."); return; }
    if (!configured) {
      // Demo mode — skip real auth
      onAuth({ name: name || email.split("@")[0], email, provider: "email" });
      return;
    }
    setLoading(true); setError("");
    try {
      const res = mode === "login"
        ? await supabase.auth.signIn({ email, password: pass })
        : await supabase.auth.signUp({ email, password: pass, name });

      if (res.error_description || res.error) {
        setError(res.error_description || res.msg || "Authentication failed. Check your credentials.");
      } else if (res.access_token) {
        const userName = res.user?.user_metadata?.full_name || name || email.split("@")[0];
        onAuth({ name: userName, email, provider: "email", session: res, userId: res.user?.id });
      } else if (res.id) {
        // Sign-up returned user without token — email confirmation needed
        setError("✅ Check your email to confirm your account, then log in.");
      }
    } catch (e) {
      setError("Connection error. Check your Supabase URL.");
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) { setError("Enter your email first."); return; }
    if (!configured) { setError("Add your Supabase credentials first."); return; }
    setLoading(true);
    await supabase.auth.sendMagicLink(email);
    setMagicSent(true); setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-up">

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <img
            src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png"
            alt="Study Ace"
            style={{width:88,height:88,objectFit:"contain",borderRadius:20,border:"1.5px solid var(--border)"}}
            onError={e=>{e.target.style.display="none";}}
          />
        </div>
        <div style={{fontWeight:900,fontSize:22,letterSpacing:"-.03em",textAlign:"center",color:"var(--text)",marginBottom:4}}>Study Ace</div>
        <div style={{fontSize:13,color:"var(--muted)",textAlign:"center",marginBottom:24,lineHeight:1.5}}>
          {mode === "login" ? "Welcome back — ready to study?" : "Join Victorian students getting better grades"}
        </div>

        {!configured && (
          <div style={{background:"var(--gold-light)",border:"1.5px solid var(--gold)",borderRadius:"var(--r)",padding:"10px 14px",marginBottom:16,fontSize:12,color:"var(--gold)",lineHeight:1.6}}>
            Demo mode — Supabase not connected yet.
          </div>
        )}

        {/* Google Sign In — proper button */}
        <button onClick={handleGoogle} disabled={loading}
          style={{width:"100%",padding:"13px 16px",borderRadius:30,border:"1.5px solid var(--border)",background:"var(--bg2)",color:"var(--text)",fontSize:13,fontWeight:700,fontFamily:"var(--ff)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .15s",marginBottom:12,boxShadow:"0 1px 4px rgba(26,26,26,.08)"}}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="divider">or use email</div>

        {mode === "signup" && (
          <input className="auth-input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:10}}/>
        )}
        <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} style={{marginBottom:10}}/>
        <input className="auth-input" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEmail()} style={{marginBottom:error?10:14}}/>

        {error && <div style={{fontSize:12,color:error.startsWith("✅")?"var(--success)":"var(--danger)",marginBottom:12,padding:"8px 12px",background:error.startsWith("✅")?"var(--success-bg)":"var(--danger-bg)",borderRadius:"var(--r)",border:`1px solid ${error.startsWith("✅")?"var(--success)":"var(--danger)"}`}}>{error}</div>}

        <button className="btn btn-primary btn-full" style={{padding:"13px",marginBottom:10}} onClick={handleEmail} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:"var(--muted)"}}>
          {mode==="login" ? "No account? " : "Already registered? "}
          <span style={{color:"var(--text)",cursor:"pointer",fontWeight:800,textDecoration:"underline"}} onClick={()=>{setMode(m=>m==="login"?"signup":"login");setError("");}}>
            {mode==="login" ? "Sign Up Free" : "Log In"}
          </span>
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"var(--muted2)",lineHeight:1.6}}>
          By continuing you agree to our Terms & Privacy Policy. Designed for students aged 13+.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ONBOARDING FLOW
// ─────────────────────────────────────────────
function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    yearLevel: null,        // "year9"|"year10"|"vce"|"ib"
    pathway: null,          // "vce"|"ib"|null (for Y9/10)
    selectedSubjects: [],
    futurePath: null,
    studyGoal: null,
    hoursPerWeek: null,
  });

  const totalSteps = 6;
  const pct = Math.round(((step) / totalSteps) * 100);

  const toggle = (key, val) => {
    setData(d => {
      const arr = d[key];
      return { ...d, [key]: arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val] };
    });
  };

  const next = () => setStep(s => Math.min(s+1, totalSteps));
  const back = () => setStep(s => Math.max(s-1, 0));

  // STEP 0 — Year level
  const step0 = (
    <>
      <div className="ob-step">Step 1 of {totalSteps}</div>
      <div className="ob-title">What year are you in?</div>
      <div className="ob-sub">We'll customise everything to your curriculum and upcoming milestones.</div>
      <div className="ob-grid">
        {[
          {id:"year9",label:"Year 9",icon:"📗",sub:"Junior Secondary"},
          {id:"year10",label:"Year 10",icon:"📘",sub:"Pre-senior year"},
          {id:"vce",label:"Year 11–12 VCE",icon:"🎓",sub:"Victorian Certificate of Education"},
          {id:"ib",label:"Year 11–12 IB",icon:"🌍",sub:"International Baccalaureate"},
        ].map(o=>(
          <button key={o.id} type="button" className={`ob-opt${data.yearLevel===o.id?" sel":""}`} onClick={()=>setData(d=>({...d,yearLevel:o.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{o.icon}</span><span className="ob-opt-label">{o.label}</span></div>
            <div className="ob-opt-sub">{o.sub}</div>
          </button>
        ))}
      </div>
      <button className="btn btn-p btn-full" style={{padding:13}} disabled={!data.yearLevel} onClick={next}>Continue →</button>
    </>
  );

  // STEP 1 — Subjects
  const yearKey = data.yearLevel;
  const subjectStep = (() => {
    let groups = {};
    if (yearKey === "year9" || yearKey === "year10") {
      const yr = ALL_SUBJECTS[yearKey];
      groups = { "Core Subjects": yr.core, "Electives": yr.elective };
    } else if (yearKey === "vce") {
      groups = ALL_SUBJECTS.vce.groups;
    } else if (yearKey === "ib") {
      groups = ALL_SUBJECTS.ib.groups;
    }
    return (
      <>
        <div className="ob-step">Step 2 of {totalSteps}</div>
        <div className="ob-title">Select your subjects</div>
        <div className="ob-sub">Pick the subjects you're studying this year. You can update these later.</div>
        {Object.entries(groups).map(([group, subjs])=>(
          <div key={group} className="ob-card">
            <div style={{fontSize:12,fontWeight:800,color:"#7070a8",marginBottom:10}}>{group}</div>
            <div className="ob-subj-grid">
              {subjs.map(s=>(
                <button key={s} className={`ob-subj-btn${data.selectedSubjects.includes(s)?" sel":""}`}
                  onClick={()=>toggle("selectedSubjects",s)}>
                  {data.selectedSubjects.includes(s)?"✓ ":""}{s}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn btn-g btn-sm" onClick={back}>← Back</button>
          <button className="btn btn-p" style={{flex:1,justifyContent:"center",padding:12}} disabled={data.selectedSubjects.length===0} onClick={next}>
            Continue with {data.selectedSubjects.length} subject{data.selectedSubjects.length!==1?"s":""} →
          </button>
        </div>
      </>
    );
  })();

  // STEP 2 — Future path
  const step2 = (
    <>
      <div className="ob-step">Step 3 of {totalSteps}</div>
      <div className="ob-title">What's your goal? 🎯</div>
      <div className="ob-sub">Tell us what you're working towards. We'll personalise your study plan and subject advice.</div>
      <div className="ob-grid">
        {FUTURE_PATHS.map(p=>(
          <button key={p.id} type="button" className={`ob-opt${data.futurePath===p.id?" sel":""}`} onClick={()=>setData(d=>({...d,futurePath:p.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{p.icon}</span><span className="ob-opt-label">{p.label}</span></div>
            <div className="ob-opt-sub">{p.atar !== "—" ? `Typical ATAR: ${p.atar}` : "Portfolio / skills-based"}</div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn btn-g btn-sm" onClick={back}>← Back</button>
        <button className="btn btn-p" style={{flex:1,justifyContent:"center",padding:12}} disabled={!data.futurePath} onClick={next}>Continue →</button>
      </div>
    </>
  );

  // STEP 3 — Study hours
  const step3 = (
    <>
      <div className="ob-step">Step 4 of {totalSteps}</div>
      <div className="ob-title">How much can you study?</div>
      <div className="ob-sub">Be honest — we'll build a realistic schedule that avoids burnout.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
        {[
          {id:"light",label:"Light",hours:"5–8 hrs/week",icon:"😊",desc:"Relaxed pace"},
          {id:"moderate",label:"Moderate",hours:"9–14 hrs/week",icon:"📖",desc:"Balanced approach"},
          {id:"intensive",label:"Intensive",hours:"15–20 hrs/week",icon:"🔥",desc:"High performance mode"},
          {id:"extreme",label:"Exam Mode",hours:"21+ hrs/week",icon:"⚡",desc:"Full focus crunch"},
        ].map(o=>(
          <button key={o.id} type="button" className={`ob-opt${data.hoursPerWeek===o.id?" sel":""}`} onClick={()=>setData(d=>({...d,hoursPerWeek:o.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{o.icon}</span><span className="ob-opt-label">{o.label}</span></div>
            <div className="ob-opt-sub">{o.hours} · {o.desc}</div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn btn-g btn-sm" onClick={back}>← Back</button>
        <button className="btn btn-p" style={{flex:1,justifyContent:"center",padding:12}} disabled={!data.hoursPerWeek} onClick={next}>Continue →</button>
      </div>
    </>
  );

  // STEP 4 — Study goal
  const step4 = (
    <>
      <div className="ob-step">Step 5 of {totalSteps}</div>
      <div className="ob-title">What's your main focus right now?</div>
      <div className="ob-sub">We'll prioritise your dashboard and AI tutor recommendations accordingly.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:9,marginBottom:24}}>
        {[
          {id:"sac",label:"Preparing for upcoming SACs / IAs",icon:"📋"},
          {id:"exam",label:"Exam preparation & past papers",icon:"📝"},
          {id:"concepts",label:"Understanding difficult concepts",icon:"🧠"},
          {id:"routine",label:"Building a consistent study routine",icon:"📅"},
          {id:"atar",label:"Maximising my ATAR / IB score",icon:"🏆"},
          {id:"wellbeing",label:"Balancing study and wellbeing",icon:"🌱"},
        ].map(o=>(
          <button key={o.id} type="button" className={`ob-opt${data.studyGoal===o.id?" sel":""}`} onClick={()=>setData(d=>({...d,studyGoal:o.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{o.icon}</span><span className="ob-opt-label">{o.label}</span></div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn btn-g btn-sm" onClick={back}>← Back</button>
        <button className="btn btn-p" style={{flex:1,justifyContent:"center",padding:12}} disabled={!data.studyGoal} onClick={next}>Continue →</button>
      </div>
    </>
  );

  // STEP 5 — All set
  const goalText = {
    medicine:"Medicine or Health Sciences 🏥",law:"Law ⚖️",engineering:"Engineering ⚙️",
    cs:"Computer Science 💻",business:"Business / Commerce 📊",arts_hum:"Arts & Humanities 🎨",
    science:"Science & Research 🔬",education:"Education 📚",creative:"Creative Industries 🎬",
    trade:"Trades & Vocational 🔧",undecided:"figuring out the right path 🤔"
  };
  const step5 = (
    <>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:52,marginBottom:12}}>🎉</div>
        <div className="ob-title" style={{textAlign:"center"}}>You're all set, {user.name.split(" ")[0]}!</div>
        <div className="ob-sub" style={{textAlign:"center"}}>Here's what we've built for you based on your answers:</div>
      </div>
      <div className="ob-card" style={{marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800,color:"#7070a8",marginBottom:10}}>YOUR PROFILE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Year Level",val:ALL_SUBJECTS[data.yearLevel]?.label||data.yearLevel},
            {label:"Subjects",val:`${data.selectedSubjects.length} subjects selected`},
            {label:"Goal",val:goalText[data.futurePath]||"Not set"},
            {label:"Study Intensity",val:({light:"Light (5–8 hrs)",moderate:"Moderate (9–14 hrs)",intensive:"Intensive (15–20 hrs)",extreme:"Exam Mode (21+)"})[data.hoursPerWeek]||"—"},
          ].map(r=>(
            <div key={r.label} style={{background:"var(--bg3)",borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:"#50508a",fontWeight:700,marginBottom:3}}>{r.label}</div>
              <div style={{fontSize:13,fontWeight:700}}>{r.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ob-card" style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:800,color:"#7070a8",marginBottom:10}}>YOUR SUBJECTS</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {data.selectedSubjects.map(s=>(
            <span key={s} style={{background:`${getColor(s)}22`,color:getColor(s),border:`1px solid ${getColor(s)}44`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s}</span>
          ))}
        </div>
      </div>
      <button className="btn btn-p btn-full" style={{padding:14,fontSize:15}} onClick={()=>onComplete(data)}>
        Enter Study Ace 🚀
      </button>
    </>
  );

  const steps = [step0, subjectStep, step2, step3, step4, step5];

  return (
    <div className="ob-wrap">
      <div className="ob-inner">
        <div className="ob-logo"><img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Ace" style={{width:90,height:90,objectFit:"contain",borderRadius:20,marginBottom:4}}/></div>
        <div className="ob-tag" style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:2,WebkitTextFillColor:"var(--text)"}}>Study Ace</div>
        <div className="ob-tag">Victorian Education Platform · Years 9–12</div>
        <div className="ob-prog"><div className="ob-fill" style={{width:`${pct}%`}}/></div>
        {steps[step]}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GAME STATE — XP, streaks, mastery, quiz history
// Persists everything in localStorage
// ─────────────────────────────────────────────
function useGameState(profile) {
  const key = `ss_game_${profile?.email || "guest"}`;

  const defaultState = {
    xp: 0, level: 1, streak: 0, bestStreak: 0,
    lastStudyDate: null, totalMinutes: 0,
    quizHistory: [],       // [{subject, score, total, date}]
    masteryMap: {},        // {subject: 0-100}
    calendarEvents: [],    // [{id, title, subject, date, type, color}]
    heatmap: {},           // {"YYYY-MM-DD": sessions}
    achievements: [],      // earned achievement ids
  };

  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      const merged = { ...defaultState, ...saved };
      // Always ensure correct types — prevents K.map crashes
      if (!Array.isArray(merged.masteryMap) && typeof merged.masteryMap !== "object") merged.masteryMap = {};
      if (Array.isArray(merged.masteryMap)) merged.masteryMap = {};
      if (!Array.isArray(merged.quizHistory)) merged.quizHistory = [];
      if (!Array.isArray(merged.calendarEvents)) merged.calendarEvents = [];
      if (typeof merged.heatmap !== "object" || Array.isArray(merged.heatmap)) merged.heatmap = {};
      return merged;
    } catch { return defaultState; }
  };

  const [state, setStateRaw] = useState(load);

  const save = (s) => {
    setStateRaw(s);
    try { localStorage.setItem(key, JSON.stringify(s)); } catch {}
  };

  // Check / update streak on load
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const s = load();
    if (s.lastStudyDate === today) return; // already updated today
    if (s.lastStudyDate === yesterday) {
      const ns = { ...s, streak: s.streak + 1, bestStreak: Math.max(s.bestStreak, s.streak + 1), lastStudyDate: today };
      save(ns);
    } else if (s.lastStudyDate && s.lastStudyDate !== yesterday) {
      save({ ...s, streak: 1, lastStudyDate: today });
    } else {
      save({ ...s, streak: 1, lastStudyDate: today });
    }
  }, []);

  const addXP = (amount, reason) => {
    const today = new Date().toISOString().slice(0, 10);
    const s = load();
    const newXP = s.xp + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    const heat = { ...s.heatmap, [today]: (s.heatmap[today] || 0) + 1 };
    save({ ...s, xp: newXP, level: newLevel, heatmap: heat, lastStudyDate: today });
  };

  const recordQuiz = (subject, score, total) => {
    const s = load();
    const pct = Math.round((score / total) * 100);
    const history = [{ subject, score, total, pct, date: new Date().toISOString() }, ...s.quizHistory].slice(0, 100);
    const oldMastery = (s.masteryMap || {})[subject] || 50;
    const newMastery = Math.min(100, Math.round(oldMastery * 0.7 + pct * 0.3));
    const masteryMap = { ...(s.masteryMap || {}), [subject]: newMastery };
    const xpEarned = score * 60;
    const today = new Date().toISOString().slice(0, 10);
    const heat = { ...s.heatmap, [today]: (s.heatmap[today] || 0) + 1 };
    save({ ...s, quizHistory: history, masteryMap, xp: s.xp + xpEarned, level: Math.floor((s.xp + xpEarned) / 500) + 1, heatmap: heat, lastStudyDate: today });
    return xpEarned;
  };

  const addEvent = (event) => {
    const s = load();
    const events = [...s.calendarEvents, { ...event, id: Date.now().toString() }];
    save({ ...s, calendarEvents: events });
  };

  const removeEvent = (id) => {
    const s = load();
    save({ ...s, calendarEvents: s.calendarEvents.filter(e => e.id !== id) });
  };

  const addMinutes = (mins) => {
    const s = load();
    save({ ...s, totalMinutes: (s.totalMinutes || 0) + mins });
  };

  // ATAR predictor — based on mastery scores weighted by subject count
  const predictATAR = () => {
    const s = load();
    const subjects = Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : [];
    if (!subjects.length) return profile?.yearLevel === "ib" ? "38/45" : "75.00";
    const masteries = subjects.map(sub => (s.masteryMap || {})[sub] || 50);
    const avg = masteries.reduce((a, b) => a + b, 0) / masteries.length;
    if (profile?.yearLevel === "ib") {
      const ibScore = Math.round(24 + (avg / 100) * 21);
      return `${Math.min(45, ibScore)}/45`;
    }
    const atar = (avg * 0.95).toFixed(2);
    return Math.min(99.95, parseFloat(atar)).toFixed(2);
  };

  return { state: load(), addXP, recordQuiz, addEvent, removeEvent, addMinutes, predictATAR };
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ profile, setScreen, gs }) {
  const { state, predictATAR } = gs;
  const isIB = profile.yearLevel === "ib";

  // Build heatmap from real data
  const today = new Date();
  const heatCells = Array.from({ length: 119 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (118 - i));
    const key = d.toISOString().slice(0, 10);
    const sessions = state.heatmap?.[key] || 0;
    return Math.min(4, sessions);
  });

  // Upcoming events from calendar
  const upcoming = state.calendarEvents
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Quiz accuracy from real history
  const recentQuizzes = state.quizHistory?.slice(0, 20) || [];
  const avgAccuracy = recentQuizzes.length
    ? Math.round(recentQuizzes.reduce((a, b) => a + b.pct, 0) / recentQuizzes.length)
    : null;

  const xpToNext = 500 - (state.xp % 500);
  const xpPct = ((state.xp % 500) / 500) * 100;
  const predicted = predictATAR();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="content fade-up">
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:900,fontSize:22}}>{greeting()}, {profile.userName?.split(" ")[0]} 👋</div>
        <div style={{color:"#6060a0",fontSize:13,marginTop:3}}>
          {isIB?"IB Diploma":ALL_SUBJECTS[profile.yearLevel]?.label} · {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).length} subjects · {today.toLocaleDateString("en-AU",{weekday:"long",month:"long",day:"numeric"})}
        </div>
      </div>

      <div className="g4" style={{marginBottom:18}}>
        <div className="stat" style={{cursor:"pointer"}} onClick={()=>setScreen("analytics")}>
          <div className="sv" style={{color:"#7C6AF7"}}>{predicted}</div>
          <div className="sl">{isIB?"Predicted IB Score":"Predicted ATAR"}</div>
          <div className="sc up">Based on your mastery scores</div>
        </div>
        <div className="stat">
          <div className="sv" style={{color:"#5CE0C6"}}>{state.xp.toLocaleString()}</div>
          <div className="sl">Total XP · Level {state.level}</div>
          <div style={{marginTop:6}}>
            <div style={{height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",background:"linear-gradient(90deg,#7C6AF7,#5CE0C6)",width:`${xpPct}%`,borderRadius:2}}/>
            </div>
            <div style={{fontSize:9,color:"#50508a",marginTop:3}}>{xpToNext} XP to Level {state.level+1}</div>
          </div>
        </div>
        <div className="stat">
          <div className="sv" style={{color:"#FF6B6B"}}>🔥 {state.streak}</div>
          <div className="sl">Day Streak</div>
          <div className="sc up">Best: {state.bestStreak} days</div>
        </div>
        <div className="stat">
          <div className="sv" style={{color:"#FFD700"}}>{avgAccuracy!=null?`${avgAccuracy}%`:"—"}</div>
          <div className="sl">Quiz Accuracy</div>
          <div className="sc up">{recentQuizzes.length} quizzes taken</div>
        </div>
      </div>

      <div className="g2" style={{marginBottom:18}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:15}}>My Subjects</div>
            <span className="cl" onClick={()=>setScreen("subjects")}>View all →</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).slice(0,4).map(s=>{
              const mastery = state.masteryMap?.[s] || 50;
              return (
              <div key={s} className="subj-card" onClick={()=>setScreen("subjects")} style={{paddingTop:20}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:getColor(s)}}/>
                <div className="sn" style={{fontSize:13}}>{s}</div>
                <div className="su">{profile.yearLevel?.toUpperCase()}</div>
                <div className="mb"><div className="mf" style={{width:`${mastery}%`,background:getColor(s)}}/></div>
                <div className="ml"><span>Mastery</span><span style={{color:getColor(s),fontWeight:700}}>{mastery}%</span></div>
              </div>
              );
            })}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="ch"><div className="ct">📅 Upcoming Assessments</div><span className="cl" onClick={()=>setScreen("planner")}>+ Add →</span></div>
            <div style={{padding:"0 16px"}}>
              {upcoming.length === 0 ? (
                <div style={{padding:"16px 0",color:"#50508a",fontSize:13,textAlign:"center"}}>
                  No upcoming events — <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>setScreen("planner")}>add one in Planner</span>
                </div>
              ) : upcoming.map((u,i)=>{
                const daysLeft = Math.ceil((new Date(u.date)-new Date())/(1000*60*60*24));
                return (
                  <div key={i} className="up-item">
                    <div className="up-dot" style={{background:u.color||getColor(u.subject)}}/>
                    <div className="up-info">
                      <div className="up-name">{u.title}</div>
                      <div className="up-sub"><span className={`tag ${u.type==="SAC"?"tag-a":"tag-r"}`}>{u.type||"EVENT"}</span> {u.subject}</div>
                    </div>
                    <div className="up-days" style={{color:daysLeft<=5?"var(--a3)":daysLeft<=12?"var(--gold)":"var(--a2)"}}>{daysLeft}d
                      <div style={{fontSize:10,color:"#50508a",fontWeight:400}}>{new Date(u.date).toLocaleDateString("en-AU",{month:"short",day:"numeric"})}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card">
            <div className="ch"><div className="ct">⚡ Quick Actions</div></div>
            <div className="cb" style={{display:"flex",flexDirection:"column",gap:7}}>
              <button className="btn btn-p btn-full" onClick={()=>setScreen("subjects")}>📚 Study a Subject</button>
              <button className="btn btn-s btn-full" onClick={()=>setScreen("ai")}>✨ Ask AI Tutor</button>
              <button className="btn btn-g btn-full" onClick={()=>setScreen("planner")}>📅 Study Planner</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:18}}>
        <div className="ch">
          <div className="ct">📊 Study Activity — Last 17 Weeks</div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {[0,1,2,3,4].map(v=><div key={v} className={`hc h${v}`} style={{width:13,height:13,borderRadius:3}}/>)}
            <span style={{fontSize:10,color:"#50508a"}}>Less → More</span>
          </div>
        </div>
        <div className="cb"><div className="heat">{heatCells.map((v,i)=><div key={i} className={`hc h${v}`}/>)}</div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="ch"><div className="ct">🏅 Achievements</div></div>
          <div className="cb">
            {[
              {icon:"🔥",name:"Streak Starter",desc:"Study 7 days in a row",e:state.streak>=7},
              {icon:"⚡",name:"Quiz Master",desc:"Take 10 quizzes",e:(state.quizHistory?.length||0)>=10},
              {icon:"📚",name:"Century",desc:"Earn 100 XP",e:state.xp>=100},
              {icon:"🎯",name:"Sharp Shooter",desc:"Score 100% on a quiz",e:state.quizHistory?.some(q=>q.pct===100)},
              {icon:"🏆",name:"High Achiever",desc:"Reach 1000 XP",e:state.xp>=1000},
              {icon:"🌟",name:"Dedicated",desc:"Study 30 days in a row",e:state.streak>=30},
            ].map((a,i)=>(
              <div key={i} className={`ach${a.e?" earned":""}`}>
                <div className="ach-ic">{a.icon}</div>
                <div><div className="ach-name">{a.name}</div><div className="ach-desc">{a.desc}</div></div>
                <div style={{marginLeft:"auto",fontSize:16}}>{a.e?"✅":"🔒"}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ct">📈 Recent Quiz Results</div><span className="cl" onClick={()=>setScreen("analytics")}>Analytics →</span></div>
          <div className="cb">
            {state.quizHistory?.length === 0 || !state.quizHistory ? (
              <div style={{color:"#50508a",fontSize:13,textAlign:"center",padding:"12px 0"}}>No quizzes yet — <span style={{color:"var(--accent)",cursor:"pointer"}} onClick={()=>setScreen("quiz")}>start one!</span></div>
            ) : state.quizHistory.slice(0,5).map((q,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<4?"1px solid var(--border)":"none"}}>
                <div style={{width:36,height:36,borderRadius:8,background:q.pct>=75?"rgba(92,224,198,.15)":q.pct>=50?"rgba(255,215,0,.15)":"rgba(255,107,107,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:q.pct>=75?"var(--a2)":q.pct>=50?"var(--gold)":"var(--a3)",flexShrink:0}}>{q.pct}%</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{q.subject}</div>
                  <div style={{fontSize:10,color:"#50508a"}}>{q.score}/{q.total} correct · {new Date(q.date).toLocaleDateString("en-AU",{month:"short",day:"numeric"})}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GEMINI HELPER — calls YOUR Vercel backend
// API key is hidden server-side, users need nothing
// ─────────────────────────────────────────────
async function callGemini(prompt) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}


// Official dot points from vcaa.vic.edu.au study designs
// ─────────────────────────────────────────────
const VCAA_CURRICULUM = {
  "English": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Reading & Responding to Texts", dotPoints:["Analyse how authors construct meaning using language and literary features","Identify and discuss the ideas, themes and values in texts","Develop and justify a written interpretation of a text","Use metalanguage: symbolism, imagery, tone, structure, characterisation","Compare and contrast texts in a written response"] },
      { name:"Creating & Presenting", dotPoints:["Create written texts for a specific audience and purpose","Adapt language and form to context","Demonstrate understanding of persuasive and imaginative writing techniques","Use rhetorical devices effectively","Craft arguments supported by evidence"] },
      { name:"Analysing Argument", dotPoints:["Identify the contention, arguments and persuasive language in texts","Analyse how language and visuals are used to persuade","Evaluate the effectiveness of arguments","Discuss the point of view and context of the author","Write a formal analytical response to argument"] },
      { name:"Oral Presentation", dotPoints:["Develop and deliver a point of view presentation","Use language suited to context and audience","Employ persuasive techniques in spoken form","Respond to questions after presentation"] },
    ]
  },
  "Maths Methods": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam (CAS allowed)",
    areas: [
      { name:"Functions & Graphs", dotPoints:["Polynomial, exponential, logarithmic and trigonometric functions","Transformations: dilation, reflection, translation","Inverse functions and their graphs","Modelling with functions","Domain and range"] },
      { name:"Calculus — Differentiation", dotPoints:["Limits and continuity","Differentiation by first principles","Power rule, product rule, quotient rule, chain rule","Derivatives of sin, cos, tan, e^x, log_e x","Applications: rates of change, gradient, stationary points","Optimisation problems"] },
      { name:"Calculus — Integration", dotPoints:["Antidifferentiation and indefinite integrals","Definite integrals and area under a curve","Fundamental theorem of calculus","Integration of polynomial, exponential, trigonometric functions","Applications: total change, area between curves"] },
      { name:"Probability & Statistics", dotPoints:["Discrete and continuous probability distributions","Binomial distribution","Normal distribution and standardisation","Statistical inference and confidence intervals","Sampling and sample proportions"] },
    ]
  },
  "Chemistry": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Organic Chemistry", dotPoints:["Structural formulae of hydrocarbons, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, amides","Functional group reactions: addition, substitution, condensation, hydrolysis","Reaction pathways and conversions","Polymer chemistry: addition and condensation polymers","Biochemistry: proteins, carbohydrates, fats"] },
      { name:"Electrochemistry", dotPoints:["Oxidation and reduction — electron transfer","Galvanic cells: anode, cathode, salt bridge, cell potential","Standard electrode potentials and EMF calculations","Electrolytic cells and electrolysis","Fuel cells and rechargeable batteries","Faraday's laws of electrolysis"] },
      { name:"Energetics & Thermodynamics", dotPoints:["Enthalpy changes in reactions (ΔH)","Hess's Law and enthalpy cycles","Calorimetry calculations","Bond energies","Entropy (ΔS) and Gibbs free energy (ΔG = ΔH − TΔS)","Spontaneity of reactions"] },
      { name:"Equilibrium & Acids/Bases", dotPoints:["Dynamic equilibrium and Le Chatelier's Principle","Equilibrium constant expression (Keq, Ka, Kb, Kw)","pH calculations for strong and weak acids/bases","Buffer solutions","Acid-base indicators and titrations"] },
    ]
  },
  "Physics": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Motion & Forces", dotPoints:["Newton's laws of motion in 2D","Momentum and impulse (F·Δt = Δp)","Work, energy, power","Conservation of energy and momentum","Circular motion: centripetal acceleration and force","Gravitational fields and orbital motion"] },
      { name:"Electricity & Magnetism", dotPoints:["Electric fields and force between charges","Electric potential and potential difference","DC circuits: Ohm's Law, series/parallel, Kirchhoff's laws","Magnetic fields and forces on current-carrying conductors","Electromagnetic induction — Faraday's and Lenz's Laws","Transformers and AC generators"] },
      { name:"Waves & Light", dotPoints:["Wave properties: frequency, wavelength, amplitude, speed","Interference, diffraction, polarisation","Young's double-slit experiment","Electromagnetic spectrum","Photoelectric effect and quantum model of light","Wave-particle duality"] },
      { name:"Modern Physics", dotPoints:["Special relativity: time dilation, length contraction, mass-energy equivalence","Nuclear physics: radioactive decay, half-life","Nuclear fission and fusion","Standard model of particle physics (overview)"] },
    ]
  },
  "Biology": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Cell Biology & Regulation", dotPoints:["Cell structure and function — organelles","Plasma membrane structure and transport","DNA structure, replication and transcription","Translation and protein synthesis","Cellular respiration: glycolysis, Krebs cycle, ETC","Photosynthesis: light-dependent and light-independent reactions"] },
      { name:"Genetics & Inheritance", dotPoints:["Mendelian genetics: dominant, recessive, codominant, sex-linked","Punnett squares and probability","Chromosomal basis of inheritance","DNA mutations and their effects","Gene expression and regulation","Biotechnology: PCR, gel electrophoresis, CRISPR"] },
      { name:"Evolution & Biodiversity", dotPoints:["Natural selection and evolution","Evidence for evolution: fossil record, comparative anatomy, molecular","Hardy-Weinberg equilibrium","Speciation mechanisms","Classification and phylogeny"] },
      { name:"Immunity & Disease", dotPoints:["Innate and adaptive immune responses","Antigens and antibodies","B cells, T cells, clonal selection","Vaccination and herd immunity","Pathogens: bacteria, viruses, fungi, prions","Autoimmune diseases and immunodeficiency"] },
    ]
  },
  "Psychology": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Nervous System & Brain", dotPoints:["Central and peripheral nervous system structure and function","Neurons: structure, action potential, synaptic transmission","Brain structure and functions: cerebral cortex, limbic system, cerebellum","Neuroplasticity and brain changes across lifespan","The role of neurotransmitters"] },
      { name:"States of Consciousness", dotPoints:["Normal waking consciousness and altered states","Sleep: NREM stages, REM, sleep cycles","Functions of sleep — restoration and memory consolidation","Sleep disorders: insomnia, sleep apnoea, narcolepsy","Effects of sleep deprivation","Melatonin and circadian rhythms"] },
      { name:"Learning & Memory", dotPoints:["Classical conditioning (Pavlov): US, UR, CS, CR, extinction","Operant conditioning (Skinner): reinforcement, punishment schedules","Observational learning (Bandura): attention, retention, reproduction","Memory models: Atkinson-Shiffrin multi-store model","Long-term potentiation","Alzheimer's disease and memory disorders"] },
      { name:"Research Methods", dotPoints:["Scientific method and hypothesis testing","Experimental design: IV, DV, controlled variables","Sampling methods and ethical principles","Data analysis: mean, median, mode, standard deviation","Evaluating research: validity, reliability, generalisability"] },
    ]
  },
  "Legal Studies": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"The Victorian Court System", dotPoints:["Hierarchy of courts: Magistrates, County, Supreme, Court of Appeal, High Court","Jurisdiction: original, appellate, summary, indictable","Role of juries and judges","Court processes: committal hearings, pleas, sentencing","Appeals process and grounds for appeal"] },
      { name:"Criminal Law", dotPoints:["Elements of a crime: actus reus and mens rea","Classification of crimes: summary vs indictable","Defences: self-defence, duress, mental impairment","Burden and standard of proof","Sentencing purposes and factors","Corrections and rehabilitation"] },
      { name:"Civil Law", dotPoints:["Distinction between civil and criminal law","Tort law: negligence, trespass, defamation","Elements of negligence: duty, breach, damage","Remedies: damages, injunctions","Dispute resolution: mediation, conciliation, arbitration","VCAT jurisdiction and processes"] },
      { name:"Law Reform & Justice", dotPoints:["Reasons for law reform — changing values, new technology","Role of parliament and courts in law reform","Institutions: Law Reform Commission, Royal Commissions","Evaluating the legal system: fairness, equality, access","Australian Constitution and division of powers"] },
    ]
  },
  "History: Revolutions": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Causes of Revolution", dotPoints:["Long-term and short-term causes","Social, economic and political grievances","Role of ideology (liberalism, Marxism, republicanism)","Role of individuals as catalysts","Significance of events leading to revolution"] },
      { name:"Revolutionary Ideas & Leaders", dotPoints:["Ideological foundations of the revolution","Key revolutionary figures and their roles","Propaganda, symbols and revolutionary culture","Mass mobilisation and popular movements","Revolutionary programmes and manifestos"] },
      { name:"The Revolutionary Period", dotPoints:["Key events and turning points","Use of violence and terror","Counter-revolutionary forces","Role of foreign powers","Consolidation of revolutionary power"] },
      { name:"Outcomes & Significance", dotPoints:["Short and long-term changes to society, politics and economy","Success in achieving revolutionary goals","Impact on different social groups","Legacy and historical significance","Historiographical debate and perspectives"] },
    ]
  },
  "Economics": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Aggregate Demand & Supply", dotPoints:["Components of GDP: C + I + G + (X−M)","Aggregate demand shifts and multiplier effect","Aggregate supply: short-run and long-run","Equilibrium output and price level","Economic growth and business cycles"] },
      { name:"Government Policy", dotPoints:["Fiscal policy: budget stance, spending, taxation","Monetary policy: RBA, cash rate, transmission mechanism","Supply-side policies: microeconomic reform","Policy objectives: growth, employment, inflation, sustainability","Trade-offs between policy objectives"] },
      { name:"Labour Market", dotPoints:["Labour demand and supply","Types of unemployment: cyclical, structural, frictional","Unemployment rate and participation rate","Wage determination: minimum wage, enterprise bargaining","Phillips curve: inflation-unemployment trade-off"] },
      { name:"International Economics", dotPoints:["Trade: comparative advantage, terms of trade","Balance of payments: current account, capital account","Exchange rates: determination and effects","Protectionism: tariffs, quotas, subsidies","Globalisation and its impacts"] },
    ]
  },
  "Accounting": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Recording & Reporting", dotPoints:["Double-entry accounting and the accounting equation","General journal entries: cash, credit, adjusting","Ledger accounts and posting","Trial balance preparation","Cash flow statement"] },
      { name:"Financial Statements", dotPoints:["Income statement: revenue, COGS, gross profit, net profit","Balance sheet: assets, liabilities, equity","Statement of changes in equity","Accounting concepts: accrual, matching, consistency","Adjusting entries: prepaid, accrued, depreciation"] },
      { name:"Analysis & Interpretation", dotPoints:["Profitability ratios: gross profit %, net profit %","Liquidity ratios: current ratio, quick ratio","Efficiency ratios: inventory turnover, accounts receivable days","Evaluating financial performance","Limitations of financial analysis"] },
      { name:"Management Accounting", dotPoints:["Cost classification: fixed, variable, direct, indirect","Break-even analysis","Budgeting: cash budget, budgeted income statement","Variance analysis: favourable vs unfavourable","Decision-making using accounting information"] },
    ]
  },
  "Business Management": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Business Foundations", dotPoints:["Types of businesses: sole trader, partnership, company, social enterprise","Business objectives and stakeholders","Corporate social responsibility","Business environments: internal, operating, macro","Porter's Five Forces and SWOT analysis"] },
      { name:"Human Resource Management", dotPoints:["Motivation theories: Maslow, Herzberg, Locke","Recruitment, selection and induction","Training and development methods","Performance management and appraisal","Employee relations: industrial action, enterprise bargaining"] },
      { name:"Operations Management", dotPoints:["Inputs, processes and outputs","Quality management: TQM, quality circles, benchmarking","Technology and automation in operations","Waste minimisation: lean production, Six Sigma","Supply chain management"] },
      { name:"Change Management", dotPoints:["Forces for change: internal and external","Resistance to change and strategies to overcome","Lewin's Force Field Analysis","Transformational and incremental change","Evaluating the effectiveness of change management"] },
    ]
  },
  "Software Development": {
    units:"Units 3 & 4", assessmentType:"SAC + project",
    areas: [
      { name:"Problem Analysis & Design", dotPoints:["Defining requirements: functional and non-functional","Use case diagrams and user stories","Data flow diagrams (DFDs)","Algorithm design: pseudocode and flowcharts","Data dictionary and data types"] },
      { name:"Programming Concepts", dotPoints:["Variables, data types, constants","Control structures: sequence, selection, iteration","Functions and procedures, parameter passing","Arrays and lists","Object-oriented programming: classes, objects, inheritance, polymorphism"] },
      { name:"Software Development Lifecycle", dotPoints:["Waterfall, Agile and iterative models","Testing strategies: black-box, white-box, unit, integration","Debugging techniques","Documentation: user and technical","Version control and collaboration tools"] },
      { name:"Security & Privacy", dotPoints:["Cybersecurity threats: malware, phishing, SQL injection","Encryption: symmetric and asymmetric","Authentication and authorisation","Privacy laws and ethical obligations","Data backup and recovery"] },
    ]
  },
  "Applied Computing": {
    units:"Units 3 & 4", assessmentType:"SAC + project",
    areas: [
      { name:"Data Analytics", dotPoints:["Data types and data quality","Data collection methods and sources","Data visualisation: charts, dashboards, infographics","Statistical analysis: mean, mode, median, standard deviation","Drawing conclusions from data"] },
      { name:"Networking & Security", dotPoints:["Network types: LAN, WAN, cloud","Network protocols: TCP/IP, HTTP, DNS","Network security: firewalls, VPNs, encryption","Cybersecurity threats and mitigation","Internet of Things (IoT)"] },
      { name:"Project Management", dotPoints:["Gantt charts and project scheduling","Resource allocation and budgeting","Risk management","Stakeholder communication","Evaluating project outcomes"] },
      { name:"User Interface Design", dotPoints:["UI design principles: consistency, feedback, affordance","Accessibility considerations","Prototyping and wireframing","Usability testing","Human-computer interaction (HCI)"] },
    ]
  },

  // ── HEALTH & PE ──
  "Health & PE": {
    units:"Years 9–10 + VCE Units 1–4", assessmentType:"Practical + written assessment",
    areas: [
      { name:"Health & Wellbeing Concepts", dotPoints:["Dimensions of health: physical, social, emotional, mental, spiritual","Health as a dynamic concept — biopsychosocial model","Factors influencing health: biological, sociocultural, physical environment","Health status of Australians — key statistics and indicators","Burden of disease: DALY, YLL, YLD"] },
      { name:"Physical Activity & Fitness", dotPoints:["Components of fitness: aerobic capacity, muscular strength, flexibility, body composition","Principles of training: overload, progression, specificity, reversibility","Energy systems: ATP-PC, lactic acid, aerobic","Types of training: interval, circuit, resistance, flexibility, cross-training","Warm-up, cool-down and injury prevention"] },
      { name:"Movement & Skill Development", dotPoints:["Fundamental movement skills and sport-specific skills","Stages of skill acquisition: cognitive, associative, autonomous","Types of practice: massed, distributed, random, blocked","Feedback types: intrinsic, extrinsic, concurrent, terminal","Movement concepts: body awareness, space, effort, relationships"] },
      { name:"Health Promotion & Interventions", dotPoints:["Ottawa Charter for Health Promotion (5 action areas)","Health promotion approaches: medical, behavioural, socioenvironmental","Role of government, community and individual in health promotion","Evaluating health promotion programs","Australia's health system: Medicare, private health insurance, PBS"] },
      { name:"Sport Psychology & Performance", dotPoints:["Arousal, anxiety and performance — inverted U hypothesis","Goal setting: SMART goals","Motivation: intrinsic and extrinsic","Mental skills: imagery, self-talk, relaxation techniques","Team dynamics: cohesion, leadership, communication"] },
    ]
  },

  "Physical Education": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam + practical",
    areas: [
      { name:"Biomechanics & Movement", dotPoints:["Newton's Laws applied to movement","Linear and angular motion","Projectile motion in sport","Balance, stability and centre of gravity","Force production and joint mechanics","Lever systems in the body"] },
      { name:"Energy Systems", dotPoints:["ATP structure and resynthesis","ATP-PC (phosphocreatine) system — intensity, duration, recovery","Lactic acid (glycolytic) system — lactate threshold","Aerobic (oxidative) system — glycolysis, Krebs cycle, ETC","Interplay of energy systems during exercise","Fatigue mechanisms and recovery"] },
      { name:"Physiological Responses to Exercise", dotPoints:["Acute responses: heart rate, stroke volume, cardiac output, VO2","Chronic adaptations: cardiac hypertrophy, increased capillary density","Respiratory responses: tidal volume, breathing rate, VO2 max","Blood redistribution and thermoregulation","Hormonal responses: adrenaline, cortisol, insulin"] },
      { name:"Training & Performance Enhancement", dotPoints:["Principles of training: overload, specificity, progression, reversibility, individuality","Periodisation: macrocycle, mesocycle, microcycle","Testing and measurement: VO2 max, lactate testing, strength tests","Performance enhancing drugs: legal and illegal, ethical considerations","Recovery strategies: active, passive, nutrition, sleep"] },
    ]
  },

  "Specialist Maths": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam (CAS allowed)",
    areas: [
      { name:"Algebra & Number", dotPoints:["Proof by mathematical induction","Rational and irrational numbers","Complex numbers: Cartesian, polar and exponential forms","De Moivre's theorem","Polynomial equations over complex numbers"] },
      { name:"Calculus", dotPoints:["Implicit differentiation","Related rates of change","Integration by substitution and parts","Differential equations: separable and linear","Euler's method for numerical solutions","Applications: kinematics, population models"] },
      { name:"Vectors & Geometry", dotPoints:["Vector arithmetic and scalar multiplication","Dot product and cross product","Vector equations of lines and planes","3D geometry and distance formulas","Parametric equations of curves"] },
      { name:"Probability & Statistics", dotPoints:["Continuous random variables and probability density functions","Normal, binomial and Poisson distributions","Sample means and central limit theorem","Confidence intervals and hypothesis testing","Linear regression and correlation"] },
    ]
  },

  "General Maths": {
    units:"Units 1–4", assessmentType:"SAC + end-of-year exam (CAS allowed)",
    areas: [
      { name:"Algebra & Finance", dotPoints:["Linear and quadratic equations and inequalities","Arithmetic and geometric sequences","Simple and compound interest","Loans, annuities and investment calculations","Depreciation and appreciation"] },
      { name:"Data & Statistics", dotPoints:["Types of data: categorical, numerical, discrete, continuous","Displaying data: histograms, boxplots, dot plots","Measures of centre: mean, median, mode","Measures of spread: range, IQR, standard deviation","Comparing distributions and correlation"] },
      { name:"Geometry & Measurement", dotPoints:["Perimeter, area and volume formulas","Similarity and congruence","Trigonometry: sin, cos, tan and applications","Pythagoras' theorem in 2D and 3D","Angles of elevation and depression, bearings"] },
      { name:"Networks & Matrices", dotPoints:["Graph theory: vertices, edges, paths, Euler circuits","Shortest path and minimum spanning tree","Matrix operations: addition, multiplication","Transition matrices and Markov chains","Leslie matrices and population modelling"] },
    ]
  },

  "Foundation Maths": {
    units:"Units 1–4", assessmentType:"SAC (no end-of-year exam)",
    areas: [
      { name:"Number & Algebra", dotPoints:["Operations with whole numbers, fractions, decimals and percentages","Ratio and proportion","Basic algebra: substitution and solving simple equations","Rates and unit conversions","Financial calculations: wages, budgeting, GST, discounts"] },
      { name:"Shape & Measurement", dotPoints:["2D and 3D shapes: area, perimeter, volume, surface area","Reading and interpreting maps and scales","Time: reading timetables, calculating duration","Basic trigonometry for right-angled triangles","Estimation and approximation"] },
      { name:"Data & Statistics", dotPoints:["Collecting and organising data","Reading graphs: bar, pie, line, column","Mean, median, mode and range","Interpreting statistical reports and infographics","Probability: simple events and everyday language"] },
      { name:"Patterns & Relationships", dotPoints:["Number patterns and sequences","Linear relationships and straight-line graphs","Using spreadsheets for calculations","Practical problem-solving with mathematics","Interpreting tables and formulas in context"] },
    ]
  },

  "Environmental Science": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Biodiversity & Ecosystems", dotPoints:["Ecosystem structure: producers, consumers, decomposers","Food webs and energy flow","Biodiversity: genetic, species, ecosystem diversity","Threats to biodiversity: habitat loss, invasive species, climate change","Conservation strategies: in-situ and ex-situ"] },
      { name:"Climate & Atmosphere", dotPoints:["Greenhouse effect and enhanced greenhouse effect","Carbon cycle: sources and sinks","Climate change evidence: temperature records, sea level, ice cores","Climate modelling and predictions","Mitigation and adaptation strategies"] },
      { name:"Water Systems", dotPoints:["Water cycle: evaporation, transpiration, precipitation, runoff","Water quality parameters: pH, turbidity, dissolved oxygen, nutrients","Eutrophication and algal blooms","Water scarcity and management strategies","Murray-Darling Basin as a case study"] },
      { name:"Human Impact & Sustainability", dotPoints:["Ecological footprint and carrying capacity","Pollution: air, water, soil — sources and impacts","Waste management: reduce, reuse, recycle","Sustainable development principles","Environmental impact assessment"] },
    ]
  },

  "Health & Human Development": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Global Health & Sustainability", dotPoints:["UN Sustainable Development Goals (SDGs)","Burden of disease in developed vs developing nations","Social model of health vs biomedical model","Factors affecting health in low-income countries: clean water, sanitation, nutrition","Role of WHO, UNICEF, World Bank in global health"] },
      { name:"Australia's Health System", dotPoints:["Medicare: funding, services, gaps","Private health insurance: role and rebates","Pharmaceutical Benefits Scheme (PBS)","National Disability Insurance Scheme (NDIS)","Strengths and challenges of Australia's health system"] },
      { name:"Health Over the Lifespan", dotPoints:["Physical, social and emotional development across life stages","Maternal and child health indicators","Healthy ageing: chronic disease prevention","Lifestyle risk factors: smoking, alcohol, inactivity, poor nutrition","Protective factors: social connectedness, access to healthcare"] },
      { name:"Health Promotion Approaches", dotPoints:["Ottawa Charter for Health Promotion: 5 action areas","Health promotion programs in Australia","Evaluating effectiveness of health promotion","Complementary and alternative medicine","Indigenous health: closing the gap initiatives"] },
    ]
  },

  "Literature": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Adaptations & Transformations", dotPoints:["How texts are adapted across different forms and media","Comparing source text with its adaptation","Analysing what is gained, lost or changed in transformation","Understanding how context shapes adaptation decisions","Written analysis comparing two texts"] },
      { name:"Interpreting Texts", dotPoints:["Close reading and textual analysis","Identifying literary devices and their effects","Constructing and sustaining an interpretation","Using textual evidence to support argument","Understanding reader positioning and ideology"] },
      { name:"Creative Response to Texts", dotPoints:["Creating a written piece inspired by or in response to a text","Maintaining the style, voice or themes of the original","Writing a reflection explaining creative choices","Understanding intertextuality","Experimenting with form, structure and language"] },
      { name:"Text, Culture & Context", dotPoints:["How historical, cultural and social context shapes texts","Texts as cultural artefacts","Comparing texts from different contexts","The role of language in constructing reality","Postcolonial, feminist and other critical frameworks"] },
    ]
  },

  "English Language": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Language & Social Structure", dotPoints:["Language variation: dialect, sociolect, idiolect","Register: formal, informal, technical","Language and power: prestige dialects, language policy","Australian English: history and features","Code-switching and multilingualism"] },
      { name:"Language Acquisition", dotPoints:["Stages of first language acquisition: babbling, holophrases, telegraphic speech","Theories: behaviourist, nativist (Chomsky's LAD), interactionist","Child-directed speech features","Bilingual language acquisition","Factors affecting language development"] },
      { name:"Analysing Language Use", dotPoints:["Phonetics and phonology: phonemes, consonants, vowels, prosodic features","Morphology: morphemes, prefixes, suffixes, derivation","Syntax: sentence types, clause structures","Semantics: connotation, denotation, semantic change","Pragmatics: speech acts, implicature, Grice's maxims"] },
      { name:"Language Change", dotPoints:["How and why language changes over time","Lexical change: borrowings, neologisms, semantic shift","Grammatical change across time","Technology and digital communication's effect on language","Language preservation and death"] },
    ]
  },

  "Visual Communication Design": {
    units:"Units 3 & 4", assessmentType:"SAC + design folio + end-of-year exam",
    areas: [
      { name:"Design Process", dotPoints:["Brief analysis: constraints, audience, purpose","Research and investigation methods","Ideation strategies: brainstorming, thumbnails, mood boards","Prototype development and refinement","Evaluation against the brief"] },
      { name:"Visual Language & Elements", dotPoints:["Elements of design: line, shape, form, space, colour, texture, tone","Principles of design: balance, contrast, emphasis, harmony, unity, rhythm","Typography: typeface, hierarchy, readability","Colour theory: hue, saturation, value, colour schemes","Compositional strategies: grids, rule of thirds"] },
      { name:"Design Fields", dotPoints:["Environmental design: wayfinding, signage, exhibition design","Communication design: branding, advertising, publication design","Industrial design: product design, ergonomics, human factors","Sustainable design considerations","Cross-disciplinary design projects"] },
      { name:"Methods & Materials", dotPoints:["Manual drawing techniques: orthogonal, isometric, oblique, perspective","Digital tools: vector, raster, CAD software","Rendering techniques: pencil, marker, digital","Presentation methods: boards, digital, model-making","Intellectual property and ethical design practice"] },
    ]
  },

  "Media": {
    units:"Units 3 & 4", assessmentType:"SAC + media production + end-of-year exam",
    areas: [
      { name:"Media Codes & Conventions", dotPoints:["Technical codes: camera angles, lighting, sound, editing","Symbolic codes: costume, setting, colour, gesture","Written codes: dialogue, captions, headlines","Genre conventions and audience expectations","Narrative structure: exposition, rising action, climax, resolution"] },
      { name:"Media & Society", dotPoints:["Representation: how media constructs versions of reality","Stereotyping and its effects","Ideology: dominant, alternative and oppositional readings","Stuart Hall's encoding/decoding theory","Media ownership and concentration in Australia"] },
      { name:"Media Production", dotPoints:["Pre-production: research, concept development, storyboarding, scripting","Production: filming/recording techniques, direction","Post-production: editing, sound design, colour grading","Distribution and audience targeting","Evaluating production against the brief"] },
      { name:"Australian Media Landscape", dotPoints:["Key Australian media organisations and their ownership","Regulatory bodies: ACMA, ACCC, Australian Press Council","Classification system: films, games, online content","Community, commercial and public broadcasting","Digital disruption and changing media consumption"] },
    ]
  },

  "Drama": {
    units:"Units 3 & 4", assessmentType:"SAC + performance + end-of-year exam",
    areas: [
      { name:"Drama Elements & Conventions", dotPoints:["Elements: role, character, relationships, situation, voice, movement, focus, tension, space, time","Conventions: monologue, soliloquy, aside, tableau, mime","Theatrical forms: naturalism, expressionism, physical theatre, Theatre of the Absurd","Dramatic tension and conflict","Stagecraft: lighting, sound, costume, set, props"] },
      { name:"Devising & Creating Drama", dotPoints:["Stimulus-based devising from images, texts, events","Collaborative playmaking processes","Script writing and adaptation","Applying a style or tradition to original work","Rehearsal processes and dramaturgy"] },
      { name:"Performing Drama", dotPoints:["Character development and embodiment","Voice: diction, projection, pace, pitch, tone","Physical performance: gesture, movement, proxemics, spatial awareness","Performing in different theatrical styles","Performance for a live audience"] },
      { name:"Analysing Drama", dotPoints:["Analysing production elements in live or recorded theatre","Evaluating own and others' performances","Australian drama and playwrights","Theatrical traditions: Greek theatre, Shakespearean, Brechtian","Writing about drama: review, analysis, reflection"] },
    ]
  },

  "Music": {
    units:"Units 3 & 4", assessmentType:"SAC + performance/composition + end-of-year exam",
    areas: [
      { name:"Music Theory & Notation", dotPoints:["Reading and writing staff notation","Rhythm: time signatures, note values, rests, syncopation","Pitch: scales (major, minor, modal), intervals, chords","Harmony: chord progressions, cadences, voice leading","Structural forms: binary, ternary, rondo, sonata, through-composed"] },
      { name:"Performance", dotPoints:["Technical proficiency on chosen instrument/voice","Interpretation and expression","Ensemble playing: balance, blend, listening","Performance preparation and anxiety management","Recording and production techniques (contemporary music)"] },
      { name:"Music Analysis", dotPoints:["Analysing music using elements: melody, harmony, rhythm, texture, timbre, dynamics","Identifying genre, style and historical period","Aural skills: dictation, melodic and harmonic recognition","Score reading and analysis","Australian music and musicians"] },
      { name:"Composition & Arrangement", dotPoints:["Composing original pieces in specified styles","Arranging existing works for different forces","Using compositional devices: sequence, augmentation, diminution, imitation","Technology in music composition: DAWs, MIDI, sampling","Documenting compositional process"] },
    ]
  },

  "Geography": {
    units:"Units 3 & 4", assessmentType:"SAC + fieldwork + end-of-year exam",
    areas: [
      { name:"Changing the Land", dotPoints:["Land use change: agriculture, urbanisation, deforestation","Environmental impacts: erosion, soil degradation, loss of biodiversity","Natural hazards: bushfire, flood, drought — causes and impacts","Land management strategies","Case studies: Australian and global examples"] },
      { name:"Human Wellbeing", dotPoints:["Measures of wellbeing: GDP, HDI, GNI, life expectancy, literacy","Spatial variation in wellbeing within and between countries","Factors contributing to wellbeing: education, health, political freedom","Food security: causes and consequences of food insecurity","Strategies to improve wellbeing"] },
      { name:"Globalisation", dotPoints:["Definition and indicators of globalisation","Transnational corporations: benefits and drawbacks","Global supply chains and outsourcing","Cultural globalisation: cultural homogenisation vs localisation","Responses to globalisation"] },
      { name:"Geographical Inquiry & Skills", dotPoints:["Geographic information systems (GIS) and mapping","Fieldwork methods: observation, measurement, interview, survey","Data analysis and representation: graphs, tables, maps","Geographic reasoning: spatial patterns, flows, hierarchies","Writing geographical reports and responses"] },
    ]
  },

  "History: Modern": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"The World in 1918", dotPoints:["Consequences of World War I: Treaty of Versailles, redrawing of borders","Rise of ideologies: communism, fascism, liberal democracy","Economic instability: Great Depression, hyperinflation","Colonial empires and nationalist movements","Social changes: suffrage, urbanisation, secularisation"] },
      { name:"World War II", dotPoints:["Causes: appeasement, German aggression, failure of collective security","Key events: Blitzkrieg, Battle of Britain, Operation Barbarossa, Pacific War","Holocaust: causes, implementation, global response","Home front: total war, propaganda, women in workforce","Turning points: Stalingrad, D-Day, atomic bombs"] },
      { name:"The Cold War", dotPoints:["Origins of the Cold War: ideological differences, Soviet expansion","Key events: Berlin Blockade, Korean War, Cuban Missile Crisis, Vietnam War","Arms race and nuclear deterrence","Decolonisation and Cold War proxy conflicts","End of the Cold War: Gorbachev, fall of Berlin Wall, USSR collapse"] },
      { name:"Rights & Freedoms", dotPoints:["Universal Declaration of Human Rights (1948)","Civil Rights Movement (USA): key figures, events, legislation","Aboriginal rights in Australia: 1967 referendum, land rights, reconciliation","Women's rights movements globally","Apartheid in South Africa and international response"] },
    ]
  },

  "Australian History": {
    units:"Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Colonial Australia", dotPoints:["First Nations peoples before colonisation — culture, society, governance","British colonisation: convict settlement, pastoralism, gold rush","Impact of colonisation: disease, dispossession, violence, missions","Development of democracy: responsible government, federation","Federation 1901: reasons, process, exclusions (Aboriginal peoples, women)"] },
      { name:"Nation Building", dotPoints:["White Australia Policy: origins, impact, dismantling","Anzac myth and its significance to national identity","Women's suffrage and changing gender roles","Post-WWII immigration: displaced persons, assisted passage","Multicultural Australia: policy and its critics"] },
      { name:"Rights & Reconciliation", dotPoints:["Aboriginal and Torres Strait Islander peoples' rights movements","1967 referendum: context, campaign, outcome","Mabo decision (1992) and native title","Stolen Generations: Bringing Them Home report, apology","Closing the gap: current indicators and challenges"] },
      { name:"Contemporary Australia", dotPoints:["Australia in the Asia-Pacific region","Economic reforms: floating the dollar, tariff reduction","Environment and sustainability in Australian politics","Changing demographics and the ageing population","Australia's role in peacekeeping and global citizenship"] },
    ]
  },

  // ── YEAR 9 & 10 SUBJECTS ──
  "Mathematics": {
    units:"Year 9–10", assessmentType:"School-based assessments + exams",
    areas: [
      { name:"Number & Algebra", dotPoints:["Real numbers: surds, scientific notation, significant figures","Algebra: expanding, factorising, simplifying algebraic fractions","Linear equations and simultaneous equations","Quadratic equations: factorising, quadratic formula, completing the square","Index laws and exponential expressions"] },
      { name:"Measurement & Geometry", dotPoints:["Pythagoras' theorem in 2D and 3D","Trigonometry: sin, cos, tan, sine rule, cosine rule (Year 10)","Perimeter, area, surface area and volume of composite shapes","Circle theorems and geometry proofs","Coordinate geometry: midpoint, gradient, distance, equation of a line"] },
      { name:"Statistics & Probability", dotPoints:["Data collection and sampling methods","Displaying data: histograms, box plots, scatter plots","Measures of centre and spread","Probability: independent events, conditional probability, two-step experiments","Analysing and interpreting statistical displays"] },
      { name:"Functions & Graphs", dotPoints:["Linear and non-linear relationships","Parabolas: vertex, axis of symmetry, intercepts","Exponential graphs: growth and decay","Graphing techniques and transformations","Modelling real-world situations with functions"] },
    ]
  },

  "Science": {
    units:"Year 9–10", assessmentType:"School-based assessments + practical investigations",
    areas: [
      { name:"Biology", dotPoints:["Cell structure and function: plant vs animal cells","Cell division: mitosis and meiosis","DNA and genetics: genes, alleles, dominant/recessive traits","Evolution: natural selection, variation, adaptation, evidence","Body systems: digestive, respiratory, circulatory, nervous"] },
      { name:"Chemistry", dotPoints:["Atomic structure: protons, neutrons, electrons, electron configuration","Periodic table: groups, periods, properties","Chemical bonding: ionic, covalent, metallic","Chemical reactions: types, word and symbol equations, balancing","Acids and bases: pH, indicators, neutralisation"] },
      { name:"Physics", dotPoints:["Motion: distance, displacement, speed, velocity, acceleration","Forces: Newton's Laws, friction, gravity, normal force","Energy: kinetic, potential, conservation, work, power","Waves: sound and light — properties, reflection, refraction","Electricity: circuits, current, voltage, resistance, Ohm's Law"] },
      { name:"Earth & Space", dotPoints:["Plate tectonics: earthquakes, volcanoes, mountain building","Earth's resources: minerals, fossil fuels, renewable energy","The universe: stars, galaxies, Big Bang theory","Solar system: planets, moons, asteroids, comets","Human impact on Earth: climate change, sustainability"] },
    ]
  },

  "English (Year 9-10)": {
    units:"Years 9–10", assessmentType:"School-based assessments",
    areas: [
      { name:"Reading & Responding to Texts", dotPoints:["Analyse how authors construct meaning using language and literary features","Identify and discuss the ideas, themes and values in texts","Develop and justify a written interpretation of a text","Use metalanguage: symbolism, imagery, tone, structure, characterisation","Compare and contrast texts in a written response"] },
      { name:"Creating & Presenting", dotPoints:["Create written texts for a specific audience and purpose","Adapt language and form to context","Demonstrate understanding of persuasive and imaginative writing techniques","Use rhetorical devices effectively","Craft arguments supported by evidence"] },
      { name:"Analysing Argument", dotPoints:["Identify the contention, arguments and persuasive language in texts","Analyse how language and visuals are used to persuade","Evaluate the effectiveness of arguments","Discuss the point of view and context of the author","Write a formal analytical response to argument"] },
      { name:"Oral & Multimodal Communication", dotPoints:["Develop and deliver a point of view presentation","Use language suited to context and audience","Employ persuasive techniques in spoken form","Create and analyse multimodal texts","Digital communication and media literacy"] },
    ]
  },

  "History (Year 9-10)": {
    units:"Year 9–10", assessmentType:"School-based assessments + essays",
    areas: [
      { name:"The Making of the Modern World (Year 9)", dotPoints:["Industrial Revolution: causes, changes to society and work","Imperialism and colonialism: motivations, impacts on colonised peoples","World War I: causes (MAIN), key events, impact on Australia","Russian Revolution: causes and short-term consequences","Social changes: urbanisation, migration, changing roles of women"] },
      { name:"World War II & Rights (Year 10)", dotPoints:["Causes of WWII: rise of Hitler, appeasement, invasion of Poland","The Holocaust: causes, implementation, legacy","Australia's role in WWII: Kokoda, home front","Cold War: origins, key events, impact on Australia","Rights and freedoms: civil rights movement, Indigenous rights, women's liberation"] },
      { name:"Historical Inquiry Skills", dotPoints:["Chronology and sequencing of events","Identifying causes and consequences","Analysing primary and secondary sources","Evaluating reliability, perspective and bias","Constructing historical arguments with evidence"] },
      { name:"Legacy & Commemoration", dotPoints:["Significance of historical events to contemporary society","How the past is remembered and represented","Anzac Day and Australian national identity","Memorials, museums and heritage sites","How different groups remember history differently"] },
    ]
  },

  "Geography (Year 9-10)": {
    units:"Year 9–10", assessmentType:"School-based assessments + fieldwork",
    areas: [
      { name:"Biomes & Food Security (Year 9)", dotPoints:["World biomes: rainforest, desert, grassland, tundra — characteristics","Factors affecting food production: climate, soil, water, technology","Food security vs food insecurity — global distribution","Impacts of changing environments on food production","Strategies to improve food security globally"] },
      { name:"Geographies of Interconnection (Year 10)", dotPoints:["Globalisation and its effect on places and cultures","Transnational corporations and global supply chains","Migration: push and pull factors, impacts on source and destination countries","Tourism: benefits and negative impacts on environments and cultures","Digital technology and interconnection"] },
      { name:"Geographic Skills & Inquiry", dotPoints:["Interpreting and creating maps: topographic, thematic, choropleth","GIS and satellite imagery","Fieldwork methods: data collection, observation, interviews","Representing data: graphs, tables, maps, diagrams","Geographic reasoning and report writing"] },
      { name:"Environmental Change & Management", dotPoints:["Human impacts on environments: urbanisation, agriculture, mining","Climate change: evidence, causes, impacts on different regions","Natural hazards: predicting, preparing and responding","Conservation and sustainability strategies","Case studies: local and global environmental management"] },
    ]
  },


  "Maths: Analysis & Approaches SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Number & Algebra", dotPoints:["Sequences and series: arithmetic, geometric","Binomial theorem","Laws of logarithms and exponentials","Proof: direct, contradiction","Financial mathematics: compound interest, depreciation"] },
      { name:"Functions", dotPoints:["Function notation, domain and range","Transformations: translations, reflections, dilations","Inverse functions and composite functions","Rational functions and asymptotes","Exponential and logarithmic functions"] },
      { name:"Calculus", dotPoints:["Limits and derivatives by first principles","Differentiation: power, product, quotient, chain rules","Applications: tangent lines, increasing/decreasing, optimisation","Integration: antidifferentiation, area under curve, definite integrals","Kinematics: displacement, velocity, acceleration"] },
      { name:"Statistics & Probability", dotPoints:["Descriptive statistics: mean, median, mode, standard deviation","Probability: combined events, conditional probability, independence","Probability distributions: binomial and normal distribution","Hypothesis testing: z-test for population mean","Correlation and linear regression"] },
    ]
  },

  "Digital Technologies": {
    units:"Year 9–10", assessmentType:"School-based project assessments",
    areas: [
      { name:"Data & Information", dotPoints:["Data types: integer, float, string, boolean, lists","Data representation: binary, hexadecimal, ASCII","Data validation and verification techniques","Databases: tables, queries, relationships","Big data: collection, storage, ethics and privacy"] },
      { name:"Algorithms & Programming", dotPoints:["Algorithm design: pseudocode, flowcharts","Control structures: sequence, selection (if/elif/else), iteration (for/while loops)","Functions and parameters","Debugging strategies: syntax, logic and runtime errors","Python or another language: variables, input/output, string operations"] },
      { name:"Networks & Cybersecurity", dotPoints:["Network types: LAN, WAN, internet","How the internet works: TCP/IP, DNS, HTTP/HTTPS","Cybersecurity threats: phishing, malware, ransomware, social engineering","Security measures: encryption, two-factor authentication, firewalls","Digital footprint and online privacy"] },
      { name:"Creating Digital Solutions", dotPoints:["Problem definition and user requirements","Designing solutions: wireframes, prototypes, system diagrams","User interface design principles","Testing: unit, integration and user acceptance testing","Evaluating digital solutions against criteria","Project management: Gantt charts, agile methods"] },
    ]
  },

  "Commerce": {
    units:"Year 10", assessmentType:"School-based assessments",
    areas: [
      { name:"Economics Basics", dotPoints:["Scarcity, choice and opportunity cost","Supply and demand: factors affecting each","Market equilibrium and price determination","Types of economies: traditional, command, market, mixed","Economic indicators: GDP, unemployment, inflation, interest rates"] },
      { name:"Business Fundamentals", dotPoints:["Types of business ownership: sole trader, partnership, company","Business functions: marketing, operations, finance, HR","Consumer rights and responsibilities","Australian Consumer Law","Business ethics and corporate social responsibility"] },
      { name:"Personal Finance", dotPoints:["Income: wages, salary, commission, government payments","Budgeting: income vs expenses, saving strategies","Banking: types of accounts, interest rates","Credit: credit cards, loans, mortgages — advantages and risks","Superannuation and long-term financial planning"] },
      { name:"Global Economy", dotPoints:["Australia's trading partners and major exports/imports","Benefits and disadvantages of international trade","Exchange rates: how they are determined and their effect on trade","Trade agreements and globalisation","Australia's economic relationship with Asia"] },
    ]
  },

  "Biology HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Cell Biology", dotPoints:["Cell theory, ultrastructure of cells (prokaryotic and eukaryotic)","Membrane structure — fluid mosaic model","Transport: diffusion, osmosis, active transport, endocytosis","Cell division: mitosis (PMAT), cytokinesis","Stem cells: types, therapeutic uses, ethical issues"] },
      { name:"Molecular Biology", dotPoints:["DNA structure: double helix, nucleotides, base pairing (Chargaff's rules)","DNA replication: semi-conservative, enzymes involved","Transcription and translation (protein synthesis)","Gene expression: regulation, operons (HL)","Biotechnology: PCR, gel electrophoresis, genetic modification"] },
      { name:"Genetics & Evolution", dotPoints:["Mendelian genetics: monohybrid and dihybrid crosses","Chromosomal basis of inheritance: sex-linkage, linkage groups","Mutations: types, effects on protein structure","Evolution: natural selection, speciation, Hardy-Weinberg principle","Cladistics and phylogenetic trees"] },
      { name:"Ecology & Conservation", dotPoints:["Ecosystems: biotic and abiotic factors, food webs, energy flow","Nutrient cycles: carbon, nitrogen","Population dynamics: carrying capacity, logistic growth","Conservation biology: biodiversity hotspots, threats, strategies","Climate change: evidence, impact on ecosystems"] },
    ]
  },

  "Chemistry HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Atomic Structure & Bonding", dotPoints:["Atomic structure: protons, neutrons, electrons, isotopes","Electronic configuration and periodic trends","Chemical bonding: ionic, covalent, metallic, hydrogen bonding","VSEPR theory and molecular geometry","Intermolecular forces and their effect on physical properties"] },
      { name:"Energetics & Kinetics", dotPoints:["Enthalpy changes: standard enthalpies, Hess's Law, Born-Haber cycles (HL)","Entropy and Gibbs free energy (ΔG = ΔH − TΔS)","Reaction rates: collision theory, activation energy, Arrhenius equation (HL)","Catalysts: homogeneous and heterogeneous","Maxwell-Boltzmann distribution"] },
      { name:"Equilibrium & Acid-Base", dotPoints:["Equilibrium constant: Kc, Kp expressions and calculations","Le Chatelier's Principle with industrial applications","Brønsted-Lowry and Lewis acid-base theories","pH calculations: strong/weak acids and bases, buffers","Titration curves and indicators"] },
      { name:"Organic Chemistry & Biochemistry", dotPoints:["Functional groups: alcohols, aldehydes, ketones, carboxylic acids, esters, amines","Reaction mechanisms: SN1, SN2, electrophilic addition (HL)","Stereoisomerism: structural, geometric, optical isomers (HL)","Biochemistry: proteins, enzymes, carbohydrates, lipids, DNA (HL option)","Spectroscopy: IR, mass spec, NMR interpretation"] },
    ]
  },

  "Physics HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Mechanics & Waves", dotPoints:["Kinematics: equations of motion, projectile motion","Newton's Laws, momentum, impulse, conservation","Work, energy, power, conservation of energy","Simple harmonic motion: springs and pendulums (HL)","Wave properties: superposition, standing waves, Doppler effect"] },
      { name:"Electricity & Magnetism", dotPoints:["Electric fields and potential, Coulomb's Law","DC circuits: Kirchhoff's Laws, internal resistance","Magnetic fields: force on moving charges, current-carrying conductors","Electromagnetic induction: Faraday's and Lenz's Laws","Capacitance and RC circuits (HL)"] },
      { name:"Thermal & Modern Physics", dotPoints:["Thermal concepts: temperature, heat, internal energy","Ideal gas law: PV = nRT, kinetic model of gases","Radioactive decay: alpha, beta, gamma, half-life calculations","Nuclear reactions: fission, fusion, mass defect, E = mc²","Photoelectric effect, wave-particle duality, de Broglie wavelength"] },
      { name:"Fields & Astrophysics (HL)", dotPoints:["Gravitational, electric and magnetic field comparisons","Orbital mechanics: escape velocity, gravitational potential energy","Structure of the universe: stars, galaxies, cosmic scale","Stellar evolution: H-R diagram, main sequence, red giants, white dwarfs","Cosmology: Hubble's Law, Big Bang, cosmic microwave background"] },
    ]
  },

  "Mathematics: Analysis & Approaches HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Algebra & Number", dotPoints:["Proof: mathematical induction, contradiction, counterexample","Complex numbers: polar form, De Moivre's theorem, roots","Binomial theorem","Partial fractions","Systems of linear equations: row reduction"] },
      { name:"Functions & Calculus", dotPoints:["Function types: rational, exponential, logarithmic, trigonometric","Limits and continuity","Differentiation: chain, product, quotient rules; implicit differentiation","Integration: by parts, substitution, partial fractions","Applications: optimisation, kinematics, differential equations"] },
      { name:"Geometry & Trigonometry", dotPoints:["Trigonometric identities and equations","Inverse trigonometric functions","3D geometry: lines, planes, vectors in 3D","Cross product and its applications","Voronoi diagrams (SL) and graph theory (HL)"] },
      { name:"Statistics & Probability", dotPoints:["Probability distributions: normal, binomial, Poisson","Hypothesis testing: t-test, chi-squared test","Confidence intervals","Linear regression: least squares, coefficient of determination","Spearman's rank correlation"] },
    ]
  },

  "History HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Paper 1 — Prescribed Subjects", dotPoints:["Source analysis: provenance, origin, purpose, limitations","Cross-referencing sources","Historiography: how historians interpret evidence differently","Writing evidence-based historical arguments","Common prescribed subjects: Rights (civil rights, apartheid), Conflict (WWI, WWII)"] },
      { name:"Paper 2 — World History Topics", dotPoints:["Causes, practices and effects of war","Democratic states: challenges and responses","Origins and development of authoritarian and single-party states","Independence movements in Asia and Africa","Cold War: superpower tensions and proxy conflicts"] },
      { name:"Paper 3 — Regional Option (HL)", dotPoints:["In-depth study of a specific region (e.g. Europe, Asia-Pacific, Americas)","Comparative historical analysis across multiple countries","Long-term and short-term causes of historical events","Impact on different social groups within the region","Evaluating historical significance and legacy"] },
      { name:"Internal Assessment (Historical Investigation)", dotPoints:["Choosing a historical question or problem","Section 1: Identification and evaluation of sources","Section 2: Investigation using primary and secondary sources","Section 3: Reflection on approaches to history (historiography)","Referencing, citation and academic integrity"] },
    ]
  },

  "Economics HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Microeconomics", dotPoints:["Supply and demand: shifts, price mechanism, elasticity","Market structures: perfect competition, monopoly, oligopoly, monopolistic competition","Market failure: externalities, public goods, information asymmetry","Government intervention: taxes, subsidies, price controls, regulations","Behavioural economics: nudge theory, bounded rationality (HL)"] },
      { name:"Macroeconomics", dotPoints:["National income accounting: GDP, GNI, HDI","AD/AS model: equilibrium, shifts and multiplier","Fiscal policy: government spending, taxation, budget stance","Monetary policy: central bank, interest rates, money supply","Economic objectives: growth, employment, inflation, balance of payments"] },
      { name:"International Economics", dotPoints:["Free trade and comparative advantage","Trade barriers: tariffs, quotas, subsidies, embargoes","Balance of payments: current account, capital account","Exchange rate systems: floating, fixed, managed float","World Trade Organisation and trade agreements"] },
      { name:"Development Economics", dotPoints:["Measuring development: economic and social indicators","Barriers to development: debt, poor governance, lack of infrastructure","Foreign aid: types, advantages, problems with dependency","Microfinance and bottom-up development strategies","Sustainable development and the SDGs"] },
    ]
  },

  "Psychology HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1, 2, 3 exams (80%)",
    areas: [
      { name:"Approaches to Understanding Behaviour", dotPoints:["Biological approach: genetics, brain, hormones, neurotransmitters","Cognitive approach: schema theory, memory models, cognitive bias","Sociocultural approach: social identity, enculturation, acculturation","Research methods: experiments, case studies, interviews, observations","Ethical considerations in psychological research"] },
      { name:"Cognitive Psychology", dotPoints:["Memory: encoding, storage, retrieval, forgetting","Schema theory and cognitive appraisal","Thinking and decision-making: heuristics and biases (Kahneman)","Emotion and cognition: flashbulb memory, mood congruence","Cognitive development: Piaget's stages, Vygotsky's ZPD"] },
      { name:"Sociocultural Psychology", dotPoints:["Social influence: conformity (Asch), obedience (Milgram)","Social identity theory (Tajfel and Turner)","Culture and behaviour: collectivism vs individualism","Prejudice and discrimination: causes and reduction strategies","Prosocial behaviour: bystander effect, altruism"] },
      { name:"Abnormal Psychology (HL option)", dotPoints:["Defining abnormality: statistical, social, functional criteria","Classification systems: DSM-5, ICD-11","Disorders: depression, anxiety, OCD, PTSD — symptoms and diagnosis","Biological, psychological and sociocultural explanations","Treatment approaches: drug therapy, CBT, mindfulness, community care"] },
    ]
  },
  // ── VCE LANGUAGES ──
  "Japanese SL": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + oral + end-of-year exam",
    areas: [
      { name:"Listening & Responding", dotPoints:["Understand spoken Japanese in various contexts: conversations, interviews, broadcasts","Identify main ideas, specific details and speaker attitudes","Respond to questions in English or Japanese","Understand formal and informal registers","Cope with natural speech rate and different accents"] },
      { name:"Reading & Responding", dotPoints:["Read and understand a range of written texts: articles, letters, advertisements, narratives","Identify main ideas, specific information and implied meaning","Understand kanji in context (approximately 200 characters for SL)","Analyse text structure and language choices","Respond to texts in Japanese"] },
      { name:"Speaking — Oral Assessment", dotPoints:["Participate in a conversation on a prepared topic","Discuss personal experiences, opinions and ideas","Use appropriate language for formal and informal situations","Demonstrate range of vocabulary and grammatical structures","Respond to unprepared questions during oral examination"] },
      { name:"Writing & Grammar", dotPoints:["Write in hiragana, katakana and approximately 200 kanji","Grammatical structures: て-form, た-form, potential, passive, causative, conditional","Particles: は、が、を、に、で、と、から、まで","Sentence endings: です/ます and plain form","Writing for different purposes: letters, emails, essays, narratives"] },
    ]
  },

  "French SL": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + oral + end-of-year exam",
    areas: [
      { name:"Listening & Reading Comprehension", dotPoints:["Understand spoken and written French in diverse contexts","Identify gist, main ideas, specific details and implied meaning","Analyse a range of text types: news, interviews, narratives, advertisements","Understand different registers: formal, informal, colloquial","Deal with unfamiliar vocabulary using context clues"] },
      { name:"Speaking", dotPoints:["Conduct a prepared conversation on a cultural topic","Express and justify opinions, agree and disagree","Use appropriate register and social conventions","Demonstrate fluency, pronunciation and intonation","Respond spontaneously to questions from examiner"] },
      { name:"Writing", dotPoints:["Write for a range of purposes and audiences: letter, article, report, narrative","Use complex grammatical structures accurately","Demonstrate range of vocabulary beyond basic level","Structure writing coherently with appropriate discourse markers","Write approximately 200-250 words in examination conditions"] },
      { name:"Grammar Essentials", dotPoints:["Verb tenses: présent, passé composé, imparfait, futur, conditionnel, subjonctif","Pronoun use: direct, indirect, reflexive, relative pronouns","Adjective agreement and placement","Negation structures: ne...pas, ne...jamais, ne...rien","Subjunctive mood for doubt, emotion, necessity"] },
    ]
  },

  "Chinese SL": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + oral + end-of-year exam",
    areas: [
      { name:"Listening & Viewing", dotPoints:["Understand spoken Mandarin in formal and informal contexts","Identify main ideas, specific details and attitudes of speakers","Understand different text types: conversations, interviews, news broadcasts","Deal with natural speech rate and tonal patterns","Respond to questions in Chinese or English"] },
      { name:"Reading", dotPoints:["Read simplified Chinese characters (approximately 600 for SL)","Understand a range of written texts: articles, advertisements, narratives, messages","Identify main ideas, specific information and implied meaning","Analyse how language choices shape meaning","Use context to deal with unfamiliar vocabulary"] },
      { name:"Speaking", dotPoints:["Conduct a prepared conversation demonstrating cultural understanding","Express opinions, describe experiences and explain ideas in Mandarin","Use tones accurately and demonstrate clear pronunciation","Demonstrate range of vocabulary and grammatical structures","Respond to unprepared questions in oral examination"] },
      { name:"Writing", dotPoints:["Write in simplified Chinese characters accurately","Grammatical structures: aspect markers (了、过、着), resultative complements, topic-comment structure","Sentence patterns: 把-sentences, 被-passive, 是...的 construction","Write for different purposes: letters, emails, narratives, explanations","Demonstrate understanding of Chinese cultural conventions in writing"] },
    ]
  },

  "Indonesian SL": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + oral + end-of-year exam",
    areas: [
      { name:"Listening & Reading", dotPoints:["Understand spoken and written Indonesian across a range of contexts","Identify main ideas, specific details and speaker/writer intentions","Understand formal and informal registers in Indonesian","Analyse text types: articles, advertisements, letters, discussions","Use context and word formation to deal with unfamiliar vocabulary"] },
      { name:"Speaking", dotPoints:["Discuss a prepared topic demonstrating personal opinions and cultural knowledge","Use appropriate register for formal and informal contexts","Demonstrate fluency and natural interaction","Use a range of grammatical structures and vocabulary","Respond to unprepared questions from examiner"] },
      { name:"Writing", dotPoints:["Write for different audiences and purposes in Indonesian","Use affixation system accurately: me-, di-, ber-, ter-, ke-an, pe-an","Apply verb focus system: active (me-) and passive (di-) constructions","Demonstrate range of vocabulary and sentence structures","Structure writing clearly with appropriate connectives"] },
      { name:"Grammar & Vocabulary", dotPoints:["Affixation: prefixes (me-, di-, ber-, ter-, ke-) and suffixes (-an, -kan, -i)","Reduplication: for plurals, variety, intensification","Sentence structure: SVO, topic-comment","Time expressions: sudah, belum, sedang, akan, baru saja","Common conjunctions: tetapi, karena, kalau, meskipun, agar"] },
    ]
  },

  "Italian SL": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + oral + end-of-year exam",
    areas: [
      { name:"Listening & Reading", dotPoints:["Understand spoken and written Italian in diverse contexts","Identify main ideas, specific details, attitudes and implied meaning","Analyse text types: articles, interviews, narratives, letters, advertisements","Deal with regional accents and informal spoken Italian","Use context to manage unfamiliar vocabulary"] },
      { name:"Speaking", dotPoints:["Conduct a conversation on a prepared cultural topic","Express and justify opinions on familiar and unfamiliar topics","Demonstrate appropriate register and social conventions","Use a range of verb tenses and grammatical structures","Respond spontaneously and fluently to examiner questions"] },
      { name:"Writing", dotPoints:["Write for different purposes: letters, articles, narratives, descriptions","Use complex grammatical structures: subjunctive, conditional, passive","Demonstrate range of vocabulary and idiomatic expression","Structure writing coherently with appropriate connectives","Write approximately 200-250 words in examination conditions"] },
      { name:"Grammar Essentials", dotPoints:["Verb tenses: presente, passato prossimo, imperfetto, futuro, condizionale, congiuntivo","Pronoun use: direct, indirect, combined, ci and ne","Adjective and noun agreement (gender and number)","Reflexive verbs and reciprocal constructions","Relative pronouns: che, cui, il quale"] },
    ]
  },

  "Latin": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + end-of-year exam (no oral)",
    areas: [
      { name:"Translation & Comprehension", dotPoints:["Translate unseen Latin passages into clear English","Identify and translate set Latin texts (prose and verse)","Use knowledge of grammar and syntax to aid translation","Understand cultural and historical context","Comprehension questions on Latin passages"] },
      { name:"Grammar & Syntax", dotPoints:["Noun declensions 1–5: all cases and their uses","Verb conjugations: all tenses active and passive (indicative and subjunctive)","Participles: present, perfect, future active and passive","Indirect statement with accusative + infinitive","Subordinate clauses: purpose, result, indirect command, conditional"] },
      { name:"Set Texts", dotPoints:["Detailed study of prescribed Latin authors (e.g. Virgil, Cicero, Livy, Ovid)","Literary analysis of style, metre and language","Understanding historical and cultural context of Roman literature","Comparison of themes across texts","Writing analytical responses about set texts"] },
      { name:"Roman Civilisation & Culture", dotPoints:["Roman social structure: patricians, plebeians, slaves, freedmen","Roman religion, mythology and its influence on literature","Political structures: Republic and Empire","Roman military: organisation, tactics, significance","Reception of classical culture in the modern world"] },
    ]
  },

  // ── VCE ARTS ──
  "Studio Arts": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + studio folio + end-of-year exam",
    areas: [
      { name:"Studio Exploration & Research", dotPoints:["Developing a sustained studio investigation from an idea or concept","Researching and analysing the work of artists as inspiration","Documenting the development of work in a visual diary","Exploring materials, techniques and processes","Establishing a clear artistic direction"] },
      { name:"Studio Production", dotPoints:["Producing a cohesive body of work demonstrating personal artistic vision","Developing technical skills in chosen medium (drawing, painting, printmaking, sculpture, etc.)","Refining work through experimentation and critical reflection","Producing resolved artworks that communicate ideas effectively","Presenting work professionally"] },
      { name:"Art Theory & Analysis", dotPoints:["Analysing artworks using formal elements: line, shape, colour, texture, tone, space","Discussing how artists use materials and techniques to create meaning","Understanding the role of social, cultural and historical context","Comparing artworks from different periods and cultures","Writing analytical responses using art vocabulary"] },
      { name:"Contemporary Art World", dotPoints:["Understanding the role of galleries, curators, collectors and critics","How artworks are presented, interpreted and valued","Intellectual property and copyright in art","Ethical considerations in art-making: appropriation, representation","Art as social commentary and cultural expression"] },
    ]
  },

  "Art — Making & Exhibiting": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + folio + end-of-year exam",
    areas: [
      { name:"Making Art", dotPoints:["Developing and refining artistic ideas in response to a brief or concept","Using materials, techniques and processes with skill and intention","Maintaining a folio documenting artistic decision-making","Creating finished artworks that demonstrate technical and conceptual development","Working across different scales and formats"] },
      { name:"Exhibiting & Presenting", dotPoints:["Understanding how context and setting affect the presentation of artwork","Curating and staging a display of works","Writing artist statements explaining intent and process","Understanding gallery conventions and display strategies","Digital presentation of artwork"] },
      { name:"Responding to Art", dotPoints:["Analysing and interpreting artworks using critical frameworks","Understanding aesthetic theories: formalism, expressionism, institutionalism","Discussing how meaning is created and interpreted","Comparing works from different cultural and historical contexts","Writing extended responses to artworks"] },
      { name:"Art Practice & Contexts", dotPoints:["Investigating an artist's practice in depth","Understanding influences on artistic development","The role of art in society and culture","Collaboration and community art practices","Sustainability and ethical material use in art"] },
    ]
  },

  "Theatre Studies": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + group performance + end-of-year exam",
    areas: [
      { name:"Theatre Styles & Traditions", dotPoints:["In-depth study of a theatrical style (e.g. Brechtian Epic Theatre, Theatre of the Absurd, Physical Theatre)","Historical and cultural context of theatrical traditions","Key practitioners and their influence: Brecht, Artaud, Stanislavski, Brook","How theatrical conventions shape performance","Applying a theatrical style to practical work"] },
      { name:"Script Analysis & Development", dotPoints:["Analysing scripts for dramatic action, character, theme and structure","Understanding playwright's intentions and theatrical context","Adapting and transforming texts for performance","Developing original performance work from scripts","Annotating scripts with directorial and performance notes"] },
      { name:"Production Elements", dotPoints:["Set design: function, symbolism, staging configurations","Lighting design: instruments, angles, colour, atmosphere","Sound design: live and recorded, music, effects","Costume and makeup: character development through visual elements","Props and staging: how objects create meaning in performance"] },
      { name:"Performance & Direction", dotPoints:["Performing a role with consistency and commitment","Directorial decision-making and communication","Rehearsal processes: table work, blocking, character development","Collaboration in ensemble performance","Evaluating and documenting performance outcomes"] },
    ]
  },

  "Dance": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + performance + end-of-year exam",
    areas: [
      { name:"Dance Technique & Performance", dotPoints:["Technical proficiency in chosen dance style (contemporary, ballet, jazz, hip-hop, etc.)","Performance qualities: expression, projection, spatial awareness, musicality","Physical conditioning: strength, flexibility, endurance relevant to dance","Performing as a soloist and in group works","Adapting technique for different performance contexts"] },
      { name:"Choreography & Composition", dotPoints:["Choreographic processes: stimulus, exploration, development, refinement","Choreographic devices: repetition, contrast, accumulation, canon, retrograde","Dance elements: body, space, time, energy, relationships","Creating dances that communicate ideas, themes or concepts","Documenting choreographic process and artistic decisions"] },
      { name:"Dance Analysis & Appreciation", dotPoints:["Analysing dances using dance elements as analytical tools","Understanding how choreographers create meaning","Historical and cultural context of dance styles and works","Comparing dances from different traditions and cultures","Writing critical responses to dance performances"] },
      { name:"Dance in Context", dotPoints:["The role of dance in different cultures and communities","Dance as social and political expression","Australian dance landscape: companies, choreographers, Indigenous dance","Technology and dance: digital media, film, projection","Careers and pathways in the dance industry"] },
    ]
  },

  "Food Studies": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + practical folio + end-of-year exam",
    areas: [
      { name:"Food Science & Nutrition", dotPoints:["Macronutrients: carbohydrates, proteins, fats — structure, function, food sources","Micronutrients: vitamins and minerals — roles and deficiency diseases","Australian Dietary Guidelines and Healthy Eating Plate","Digestion and absorption of nutrients","Food as a source of energy: kilojoules and metabolic rate"] },
      { name:"Food Safety & Hygiene", dotPoints:["Food safety legislation in Australia: Food Standards Code","Food hazards: biological, chemical, physical","Temperature danger zone and temperature control","HACCP principles: Hazard Analysis Critical Control Points","Food poisoning: causes, symptoms, prevention"] },
      { name:"Food Technology & Production", dotPoints:["Food processing and preservation methods: heat treatment, freezing, drying, fermentation","The role of additives: preservatives, antioxidants, emulsifiers, colours","Food packaging: functions, types, environmental impact","Food labelling requirements in Australia","Technology in food production: from farm to fork"] },
      { name:"Food Equity & Sustainability", dotPoints:["Food security: access, availability, utilisation, stability","Global food system: production, distribution, consumption","Environmental impact of food choices: carbon footprint, water use","Sustainable food practices: local, seasonal, plant-based","Food equity: socioeconomic factors affecting food access in Australia"] },
    ]
  },

  "Outdoor & Environmental Studies": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + fieldwork + end-of-year exam",
    areas: [
      { name:"Outdoor Experiences & Environment", dotPoints:["The relationship between humans and natural environments","Types of outdoor experiences: bushwalking, camping, rock climbing, paddling","Environmental impact of outdoor activities: Leave No Trace principles","Indigenous Australians' connection to Country","Planning and risk management for outdoor activities"] },
      { name:"Natural Environments", dotPoints:["Australian ecosystems: characteristics, biodiversity, threats","Ecological concepts: food webs, nutrient cycles, succession","Climate change impacts on natural environments","Conservation strategies: national parks, reserves, wildlife corridors","Fieldwork skills: observation, recording, mapping"] },
      { name:"Personal & Social Development", dotPoints:["Challenge and adventure in outdoor education","Leadership styles and group dynamics in the outdoors","Risk management: hazard identification, risk assessment, mitigation","Physical and mental health benefits of time in nature","Reflective practice and experiential learning"] },
      { name:"Sustainability & Human Impact", dotPoints:["Sustainable use of natural resources","Environmental ethics: anthropocentrism, ecocentrism, biocentrism","Water, soil and land management issues in Australia","Renewable energy and sustainable living","Community action and environmental advocacy"] },
    ]
  },

  // ── VCE HUMANITIES ──
  "Philosophy": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Epistemology — Knowledge & Belief", dotPoints:["What is knowledge? Justified True Belief (JTB)","Gettier problems and the challenge to JTB","Sources of knowledge: reason (rationalism) vs experience (empiricism)","Scepticism: Descartes' Meditations, brain-in-a-vat","A priori vs a posteriori knowledge"] },
      { name:"Metaphysics — Mind & Reality", dotPoints:["The mind-body problem: dualism (Descartes), physicalism, functionalism","Personal identity: psychological continuity, physical continuity","Free will and determinism: compatibilism, hard determinism, libertarianism","The nature of time: A-theory vs B-theory","Philosophy of religion: arguments for and against God's existence"] },
      { name:"Ethics & Moral Philosophy", dotPoints:["Consequentialism: utilitarianism (Bentham, Mill)","Deontological ethics: Kant's categorical imperative","Virtue ethics: Aristotle's concept of eudaimonia","Applied ethics: bioethics, environmental ethics, animal ethics","Meta-ethics: moral realism, anti-realism, relativism"] },
      { name:"Logic & Critical Thinking", dotPoints:["Deductive arguments: validity and soundness","Inductive arguments: strength and cogency","Formal logic: propositional logic, syllogisms","Informal fallacies: ad hominem, straw man, false dilemma, slippery slope","Analysing and constructing philosophical arguments"] },
    ]
  },

  "Sociology": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Social Structures & Institutions", dotPoints:["Key sociological concepts: society, culture, socialisation, norms, values","Social institutions: family, education, religion, media, government","Agents of socialisation: family, peers, school, media","Social stratification: class, race, gender, age as bases of inequality","Social mobility: structural and individual factors"] },
      { name:"Sociological Theory", dotPoints:["Functionalism: Durkheim, Parsons — society as a system","Conflict theory: Marx, Weber — power, class and social change","Symbolic interactionism: Mead, Goffman — meaning and everyday life","Feminist sociology: patriarchy, gender inequality, intersectionality","Postmodernism and its critique of grand narratives"] },
      { name:"Research Methods", dotPoints:["Quantitative methods: surveys, experiments, statistical analysis","Qualitative methods: interviews, ethnography, case studies","Mixed methods research","Ethics in sociological research: informed consent, confidentiality","Evaluating research: validity, reliability, representativeness"] },
      { name:"Contemporary Social Issues", dotPoints:["Globalisation and its social impact","Social media and digital society","Environmental sociology: climate change as a social issue","Crime and deviance: labelling theory, strain theory","Health inequalities: social determinants of health"] },
    ]
  },

  "Politics": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Australian Political System", dotPoints:["Australian Constitution: separation of powers, federalism, division of powers","The Parliament: Senate, House of Representatives, legislative process","The Executive: Cabinet, Prime Minister, responsible government","The Judiciary: High Court, judicial review, landmark cases","Electoral systems: preferential voting, proportional representation"] },
      { name:"Political Ideologies", dotPoints:["Liberalism: individual rights, limited government, free market","Conservatism: tradition, social order, gradual change","Socialism: equality, collective ownership, welfare state","Nationalism: sovereignty, identity, self-determination","Environmentalism and other contemporary ideologies"] },
      { name:"Global Politics", dotPoints:["International organisations: United Nations, WTO, IMF, World Bank","Foreign policy: sovereignty, national interest, multilateralism","Globalisation: economic, political, cultural dimensions","International law and human rights","Geopolitics: power, alliances, conflict in the contemporary world"] },
      { name:"Political Participation", dotPoints:["Electoral participation: voting, campaigns, political parties","Pressure groups, lobbyists and civil society","Media and politics: agenda-setting, spin, political communication","Social movements and protest: from civil rights to climate activism","Youth political engagement and citizenship"] },
    ]
  },

  "Religion & Society": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Religious Traditions", dotPoints:["Key beliefs, practices and texts of major world religions: Christianity, Islam, Judaism, Buddhism, Hinduism","Diversity within religious traditions: denominations, sects, reform movements","Sacred texts and their interpretation: hermeneutics","Religious ritual and practice: prayer, worship, rites of passage","Religion and ethics: moral frameworks derived from religious teaching"] },
      { name:"Religion & Australian Society", dotPoints:["History of religion in Australia: Christianity's role, secularisation","Indigenous Australian spirituality and relationship to Country","Multiculturalism and religious diversity in contemporary Australia","Religion and the law: freedom of religion, religious discrimination","Church and state: separation in Australia"] },
      { name:"Religion in the Modern World", dotPoints:["Secularisation theory and its critics: is religion declining?","Religion and science: conflict, independence, dialogue, integration","Fundamentalism and religious extremism","New religious movements and alternative spiritualities","Religion and social justice: advocacy, charity, activism"] },
      { name:"Ethics & Ultimate Questions", dotPoints:["Religious responses to bioethical issues: euthanasia, abortion, genetic engineering","Environmental ethics from religious perspectives","Life after death: comparative religious views","Suffering and theodicy: the problem of evil","The relationship between faith, reason and doubt"] },
    ]
  },

  "Global Politics": {
    units:"VCE Units 3 & 4", assessmentType:"SAC + end-of-year exam",
    areas: [
      { name:"Global Order & Power", dotPoints:["Theories of international relations: realism, liberalism, constructivism","Nation-states, sovereignty and non-state actors","Power: hard power, soft power, smart power","The United Nations: structure, role, limitations","Changing global order: US hegemony, rise of China, multipolarity"] },
      { name:"Global Issues", dotPoints:["Global poverty and development: causes, consequences, responses","Human rights: universal vs relative, monitoring and enforcement","Climate change as a global governance challenge","Nuclear proliferation and arms control","Terrorism and counter-terrorism: causes, responses, civil liberties"] },
      { name:"Australia in the World", dotPoints:["Australia's foreign policy: interests, values, alliances","Australia-US alliance: ANZUS, Five Eyes, strategic importance","Australia-China relationship: trade, security tensions","Australia's role in the Pacific: aid, regional security","Soft power: diplomacy, cultural influence, international aid"] },
      { name:"Research & Analysis Skills", dotPoints:["Analysing primary sources: speeches, treaties, UN resolutions","Evaluating media sources: bias, perspective, reliability","Writing analytical and argumentative essays","Using evidence to support claims about global events","Case study analysis of specific global issues"] },
    ]
  },

  // ── VCE VET ──
  "VET Hospitality": {
    units:"VCE VET Certificate II/III", assessmentType:"Practical competency assessments + written theory",
    areas: [
      { name:"Food Preparation & Cookery", dotPoints:["Safe food handling and hygiene practices (HACCP)","Knife skills and basic cookery techniques: sauté, braise, grill, deep fry","Preparing stocks, sauces and soups","Menu planning and recipe costing","Dietary requirements: allergies, intolerances, cultural and religious needs"] },
      { name:"Customer Service & Communication", dotPoints:["Professional communication with customers and colleagues","Handling customer complaints and difficult situations","Phone and digital communication in hospitality","Cultural awareness and inclusive service","Teamwork and workplace relationships"] },
      { name:"Hospitality Operations", dotPoints:["Front of house: table service, beverage service, point of sale systems","Workplace health and safety (WHS) in hospitality environments","Understanding hospitality industry structure: hotels, restaurants, catering, events","Environmental sustainability practices in hospitality","Legal responsibilities: responsible service of alcohol (RSA), food safety laws"] },
      { name:"Career Pathways", dotPoints:["Roles in hospitality: chef, front of house, event management, hotel management","Pathways to apprenticeships and traineeships","TAFE and university pathways in hospitality and tourism","Entrepreneurship in hospitality: starting a food business","Professional development and industry expectations"] },
    ]
  },

  "VET Business": {
    units:"VCE VET Certificate II/III", assessmentType:"Practical competency assessments + portfolio",
    areas: [
      { name:"Business Administration", dotPoints:["Workplace documentation: emails, reports, memos, meeting minutes","Records management: filing, data management, confidentiality","Using business technology: word processing, spreadsheets, databases","Organisational structure and workplace culture","Time management and prioritisation skills"] },
      { name:"Customer Relations", dotPoints:["Identifying and meeting customer needs","Professional communication: verbal, written, digital","Handling complaints and resolving conflict","Understanding consumer rights under Australian Consumer Law","Building and maintaining professional relationships"] },
      { name:"Financial Literacy", dotPoints:["Understanding payslips, tax, superannuation","Basic bookkeeping: invoices, receipts, petty cash","Using financial software: MYOB, Xero basics","Budgeting for business operations","Understanding GST and BAS basics"] },
      { name:"Workplace Readiness", dotPoints:["Understanding workplace rights and responsibilities","Work health and safety (WHS) obligations","Applying for jobs: resume, cover letter, interview skills","Working in teams: collaboration and conflict resolution","Professionalism: punctuality, dress standards, workplace conduct"] },
    ]
  },

  "VET IT": {
    units:"VCE VET Certificate II/III", assessmentType:"Practical competency assessments + project work",
    areas: [
      { name:"IT Hardware & Software", dotPoints:["Computer components: CPU, RAM, storage, motherboard, GPU","Operating systems: Windows, macOS, Linux basics","Installing, configuring and troubleshooting software","Peripheral devices and connectivity","Preventive maintenance and basic hardware repairs"] },
      { name:"Networking & Security", dotPoints:["Network types: LAN, WAN, wireless networks","Network components: routers, switches, cables, Wi-Fi","IP addressing: IPv4, subnet masks, DHCP","Cybersecurity fundamentals: threats, firewalls, antivirus, passwords","Backing up data and disaster recovery procedures"] },
      { name:"Digital Applications", dotPoints:["Using productivity software: Word, Excel, PowerPoint, Google Workspace","Creating and editing digital media: images, audio, video","Web development basics: HTML, CSS introduction","Database fundamentals: creating and querying databases","Cloud computing: services, benefits, risks"] },
      { name:"IT Support & Client Service", dotPoints:["IT helpdesk procedures and ticketing systems","Diagnosing and resolving technical problems systematically","Communicating technical information to non-technical users","Professional ethics in IT: privacy, data protection, copyright","Career pathways in IT: networking, software, cybersecurity, data"] },
    ]
  },

  "VET Construction": {
    units:"VCE VET Certificate II", assessmentType:"Practical competency assessments + written theory",
    areas: [
      { name:"Construction Fundamentals", dotPoints:["Australian building standards and codes (National Construction Code)","Reading and interpreting plans and drawings","Basic construction materials: timber, masonry, steel, concrete","Construction sequence: site preparation, foundations, framing, fit-out","Sustainability in construction: green building principles"] },
      { name:"Work Health & Safety", dotPoints:["WHS legislation and workplace obligations","Identifying and controlling hazards on construction sites","Personal protective equipment (PPE): types and correct use","Working safely at heights, with power tools and heavy machinery","Emergency procedures and first aid in construction"] },
      { name:"Trade Skills", dotPoints:["Hand tools and power tools: safe operation and maintenance","Basic carpentry and joinery skills","Measuring, marking and cutting materials accurately","Joining and fixing techniques: nails, screws, bolts, adhesives","Introduction to plumbing, electrical and other trade disciplines"] },
      { name:"Industry & Career Pathways", dotPoints:["Construction industry structure: residential, commercial, civil","Apprenticeship pathways: carpenter, plumber, electrician, bricklayer","Roles in construction: tradesperson, site manager, estimator, engineer","Construction project lifecycle: design, tender, construction, handover","Professional conduct and ethical practice in construction"] },
    ]
  },

  "VET Nursing": {
    units:"VCE VET Certificate II/III", assessmentType:"Practical competency assessments + theory + work placement",
    areas: [
      { name:"Human Biology & Health", dotPoints:["Body systems: cardiovascular, respiratory, digestive, musculoskeletal, neurological","Common diseases and conditions: diabetes, heart disease, stroke, dementia","Vital signs: temperature, pulse, respiration, blood pressure — measurement and normal ranges","Infection control: chain of infection, standard precautions, PPE","Anatomy and physiology relevant to nursing practice"] },
      { name:"Patient Care Skills", dotPoints:["Person-centred care: dignity, respect, privacy, autonomy","Assisting with activities of daily living: hygiene, mobility, nutrition, elimination","Safe manual handling and transferring techniques","Wound care: basic dressing changes, aseptic technique","Medication management: rights of medication administration (5 rights)"] },
      { name:"Healthcare Settings", dotPoints:["Types of healthcare settings: acute, aged care, community, mental health","Roles in healthcare: nurses, doctors, allied health, support workers","Healthcare documentation: patient records, incident reports, care plans","Legal and ethical obligations: duty of care, consent, confidentiality","Australian healthcare system: Medicare, hospitals, aged care sector"] },
      { name:"Communication in Healthcare", dotPoints:["Therapeutic communication: active listening, empathy, non-verbal cues","Communicating with patients from diverse backgrounds","Reporting and handover: ISBAR communication tool","Working in multidisciplinary teams","Managing stress and self-care in healthcare work"] },
    ]
  },

  // ── IB SL/HL ADDITIONS ──
  "Biology SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Cell Biology", dotPoints:["Cell theory and ultrastructure: prokaryotic and eukaryotic cells","Membrane structure and transport: diffusion, osmosis, active transport","Cell division: mitosis — interphase, PMAT, cytokinesis","Origin of cells: spontaneous generation vs biogenesis","Stem cells: types and therapeutic potential"] },
      { name:"Molecular Biology", dotPoints:["DNA structure: double helix, nucleotides, base pairing","DNA replication: semi-conservative, role of DNA polymerase","Protein synthesis: transcription and translation","Metabolism: anabolism and catabolism, enzymes","Cellular respiration: glycolysis, Krebs cycle, electron transport chain"] },
      { name:"Genetics & Evolution", dotPoints:["Genes and alleles: dominant, recessive, codominant","Mendelian genetics: monohybrid crosses, Punnett squares","Chromosomes: sex determination, sex-linked traits","Natural selection and evolution: evidence, mechanisms","Classification: binomial nomenclature, cladograms"] },
      { name:"Ecology", dotPoints:["Ecosystems: biotic and abiotic factors","Energy flow: food chains, food webs, trophic levels","Carbon and nitrogen cycles","Population ecology: growth curves, carrying capacity","Human impact: pollution, climate change, biodiversity loss"] },
    ]
  },

  "Chemistry SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Stoichiometry & Atomic Structure", dotPoints:["Mole concept: Avogadro's number, molar mass, mole calculations","Atomic structure: protons, neutrons, electrons, isotopes","Electron configuration and periodic trends","Chemical bonding: ionic, covalent, metallic","Writing and balancing chemical equations"] },
      { name:"Energetics & Kinetics", dotPoints:["Enthalpy changes: exothermic and endothermic reactions","Hess's Law and standard enthalpies","Rate of reaction: collision theory, activation energy","Catalysts and their effect on reaction rate","Maxwell-Boltzmann energy distribution"] },
      { name:"Equilibrium & Acids/Bases", dotPoints:["Dynamic equilibrium and Le Chatelier's Principle","Acid-base theories: Brønsted-Lowry","pH scale and calculations for strong acids/bases","Neutralisation and titration","Buffer solutions and their importance"] },
      { name:"Organic Chemistry", dotPoints:["Homologous series: alkanes, alkenes, alcohols, carboxylic acids","Functional groups and their reactions","Isomers: structural and stereoisomers (SL level)","Condensation and addition polymers","Green chemistry principles"] },
    ]
  },

  "Physics SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Mechanics", dotPoints:["Kinematics: displacement, velocity, acceleration, equations of motion","Newton's Laws of Motion in 1D and 2D","Momentum and impulse: conservation of momentum","Work, energy and power: conservation of energy","Circular motion and gravitation: centripetal force, orbital motion"] },
      { name:"Thermal Physics", dotPoints:["Temperature, heat and internal energy","Ideal gas law: PV = nRT","Kinetic model of an ideal gas","Thermodynamic processes: isothermal, adiabatic, isobaric","Specific heat capacity and latent heat calculations"] },
      { name:"Waves & Electricity", dotPoints:["Wave properties: frequency, wavelength, amplitude, speed","Superposition and interference","Ohm's Law and DC circuits: series and parallel","Magnetic fields and electromagnetic induction","Alternating current and transformers"] },
      { name:"Modern Physics", dotPoints:["Photoelectric effect and quantum model of light","Wave-particle duality and de Broglie wavelength","Nuclear physics: radioactive decay, half-life","Mass defect and nuclear binding energy","Medical imaging: X-rays, MRI, PET (option)"] },
    ]
  },

  "Psychology SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Core Approaches", dotPoints:["Biological approach: brain, genetics, hormones — and their influence on behaviour","Cognitive approach: schema theory, reconstructive memory, cognitive bias","Sociocultural approach: social identity theory, conformity, enculturation","Research methods: experiments, interviews, observations","Ethical guidelines in psychological research"] },
      { name:"Abnormal Psychology", dotPoints:["Defining abnormality: statistical, deviance, dysfunction, distress","Classification: DSM-5 and ICD-11","Depression: biological, cognitive and sociocultural explanations","Anxiety disorders: symptoms, aetiology, treatment","Effectiveness of biomedical and psychological treatments"] },
      { name:"Developmental Psychology", dotPoints:["Cognitive development: Piaget's stages","Social development: Vygotsky's ZPD, Bronfenbrenner's ecological model","Attachment theory: Bowlby, Ainsworth's strange situation","Adolescent identity development: Erikson's stages","Influence of culture on development"] },
      { name:"Health Psychology", dotPoints:["Stress: definitions, physiological response (fight or flight, HPA axis)","Stressors: life events (Holmes and Rahe), daily hassles (Lazarus)","Coping strategies: problem-focused and emotion-focused","Health-promoting and health-compromising behaviours","Promoting wellbeing: mindfulness, social support, exercise"] },
    ]
  },

  "Economics SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Microeconomics", dotPoints:["Supply and demand: determinants, equilibrium, elasticity (PED, PES, YED, XED)","Market failure: externalities, public goods, common access resources","Government intervention: taxes, subsidies, price controls","Theory of the firm: revenue, costs, profit maximisation","Market structures: perfect competition, monopoly, oligopoly"] },
      { name:"Macroeconomics", dotPoints:["National income: GDP, GNI, HDI and their limitations","AD/AS model and macroeconomic equilibrium","Fiscal policy: government spending, taxation, budget positions","Monetary policy: interest rates, money supply","Macroeconomic objectives: growth, full employment, low inflation, equitable distribution"] },
      { name:"International Economics", dotPoints:["Absolute and comparative advantage","Free trade benefits and arguments for protectionism","Balance of payments: current account, capital account, financial account","Exchange rate determination and effects on trade","Trading blocs and the WTO"] },
      { name:"Development Economics", dotPoints:["Economic development vs economic growth","Measuring development: HDI, GNI per capita, multidimensional poverty index","Barriers to development: geography, governance, debt, inequality","Strategies for development: trade, aid, foreign direct investment, microfinance","Sustainable development goals (SDGs)"] },
    ]
  },

  "History SL": {
    units:"IB SL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Paper 1 — Source Analysis", dotPoints:["Evaluating sources: origin, purpose, value, limitation","Cross-referencing and comparing sources","Identifying perspective, bias and propaganda","Using sources to support historical arguments","Common Paper 1 themes: rights, conflict, leadership"] },
      { name:"Paper 2 — World History", dotPoints:["Causes, practices and effects of wars (20th century)","Democratic states: challenges and responses (1918-2000)","Authoritarian states: rise and nature of rule","Cold War: causes, development, effects","Independence movements and decolonisation"] },
      { name:"Historical Skills", dotPoints:["Chronological understanding and historical context","Evaluating historical significance","Constructing and sustaining historical arguments","Using primary and secondary sources effectively","Historiographical awareness: how interpretations change"] },
      { name:"Internal Assessment", dotPoints:["Choosing a historical investigation question","Section 1: Identification and evaluation of two sources","Section 2: Investigation — using evidence to answer the question","Section 3: Reflection on the nature of history as a discipline","Academic writing: referencing, citation, bibliography"] },
    ]
  },

  "Global Politics HL": {
    units:"IB HL — 2 years", assessmentType:"IA + Engagement Activity (20%) + Paper 1 & 2 (80%)",
    areas: [
      { name:"Power, Sovereignty & International Relations", dotPoints:["Defining power: hard, soft, structural and normative power","State sovereignty vs human sovereignty","International relations theories: realism, liberalism, constructivism, feminism","Nation-states, IGOs, NGOs and TNCs as global actors","Changing nature of power in the 21st century"] },
      { name:"Global Issues", dotPoints:["Human rights: universality vs cultural relativism, monitoring and enforcement","Development: measuring, barriers, strategies (MDGs vs SDGs)","Peace and conflict: causes of war, peacekeeping, peacebuilding","Environmental challenges: climate governance, biodiversity, resource scarcity","Global health: pandemics, WHO, health equity"] },
      { name:"People, Power & Politics", dotPoints:["Political systems and ideologies across the world","Democracy: liberal, electoral, participatory — challenges and strengths","Authoritarian regimes: types, features, stability","Civil society: social movements, NGOs, pressure groups","Media and politics: propaganda, social media, freedom of the press"] },
      { name:"Engagement Activity & HL Extension", dotPoints:["Engaging with a local or global political event","Documenting engagement and analysing political significance","HL Paper 2: comparing global issues across multiple case studies","Using political science concepts and theories analytically","Writing extended analytical essays under examination conditions"] },
    ]
  },

  "Business Management HL": {
    units:"IB HL — 2 years", assessmentType:"IA (20%) + Paper 1 & 2 exams (80%)",
    areas: [
      { name:"Business Organisation & Environment", dotPoints:["Types of organisations: private sector, public sector, NGOs","Business objectives: profit, growth, social enterprise, ethics","Stakeholders: interests, conflicts and management","Business environments: STEEPLE analysis","Globalisation: opportunities and challenges for businesses"] },
      { name:"Human Resource Management", dotPoints:["Motivation theories: Taylor, Maslow, Herzberg, Adams, Pink","Organisational structures: hierarchical, flat, matrix, network","Leadership styles: autocratic, democratic, laissez-faire, situational","Workforce planning: recruitment, selection, training, appraisal, dismissal","Industrial and employee relations: collective bargaining, conflict resolution"] },
      { name:"Finance & Accounts", dotPoints:["Sources of finance: internal, external, short and long-term","Financial statements: P&L, balance sheet, cash flow statement","Ratio analysis: profitability, liquidity, efficiency, gearing","Investment appraisal: payback period, NPV, IRR","Working capital management and cash flow forecasting"] },
      { name:"Marketing & Operations", dotPoints:["Market research: primary and secondary, qualitative and quantitative","Marketing mix: 7Ps (product, price, place, promotion, people, process, physical evidence)","Operations: production methods, quality management, lean production","Supply chain management and logistics","E-commerce and digital marketing strategies"] },
    ]
  },

  "Computer Science HL": {
    units:"IB HL — 2 years", assessmentType:"IA + case study (20%) + Paper 1, 2, 3 (80%)",
    areas: [
      { name:"Systems & Computer Organisation", dotPoints:["Computer architecture: CPU, memory hierarchy, cache, buses","Binary representation: integers, fractions, text, images, sound","Boolean logic: gates, circuits, truth tables","Operating systems: functions, types, resource management","Networks: protocols (TCP/IP, HTTP), topology, hardware"] },
      { name:"Programming & Algorithms", dotPoints:["Object-oriented programming: classes, objects, encapsulation, inheritance, polymorphism","Algorithm design: pseudocode, trace tables, flowcharts","Searching algorithms: linear, binary search","Sorting algorithms: bubble, selection, insertion, merge sort","Recursion: base case, recursive case, call stack"] },
      { name:"Data Structures", dotPoints:["Arrays: 1D and 2D, operations","Linked lists: nodes, pointers, operations","Stacks and queues: LIFO/FIFO, push, pop, enqueue, dequeue","Trees: binary trees, traversal (pre, in, post-order)","Abstract data types and their applications"] },
      { name:"HL Topics", dotPoints:["Computational thinking: decomposition, abstraction, pattern recognition","Database design: entity-relationship diagrams, SQL queries, normalisation","Simulations: deterministic, stochastic, limitations","OOP design patterns (HL extension)","Web technologies: HTML, CSS, JavaScript basics, client-server model"] },
    ]
  },

  "Visual Arts HL": {
    units:"IB HL — 2 years", assessmentType:"Exhibition + Comparative Study + Process Portfolio (100%)",
    areas: [
      { name:"Studio Practice & Making", dotPoints:["Developing and refining artistic ideas across a sustained investigation","Using a range of materials, techniques and processes with skill","Experimenting in response to artists, artworks and contexts","Producing a coherent body of resolved artworks for exhibition","Documenting the development of work in the process portfolio"] },
      { name:"Comparative Study (Critical Investigation)", dotPoints:["Researching and analysing the work of at least 3 artists from different cultural contexts","Comparing artworks formally: elements and principles of design","Examining how cultural context influences artistic production","Making connections between artworks and own studio practice","Presenting the comparative study digitally with written analysis"] },
      { name:"Art Theory & Analysis", dotPoints:["Formal analysis: line, shape, colour, texture, tone, space, form","Contextual analysis: historical, cultural, social and biographical context","Artist statements and intent: how meaning is constructed","Different critical frameworks: formalist, contextual, institutional","Discussing artworks verbally and in writing using appropriate vocabulary"] },
      { name:"Exhibition & Curation", dotPoints:["Selecting, curating and presenting artworks for a final exhibition","Writing curatorial rationale and artist statement","Understanding how display choices affect meaning","Audience experience and engagement with art","Documenting and evaluating the exhibition process"] },
    ]
  },

  "Theatre HL": {
    units:"IB HL — 2 years", assessmentType:"Research Presentation + Collaborative Project + Solo Theatre Piece (100%)",
    areas: [
      { name:"World Theatre Traditions", dotPoints:["Research presentation on a non-western theatre tradition (e.g. Kabuki, Kathakali, Noh, Commedia dell'arte)","Historical and cultural context of the tradition","Conventions, techniques and performance elements of the tradition","How the tradition has influenced contemporary theatre","Presenting research and demonstrating practical application"] },
      { name:"Collaborative Theatre Making", dotPoints:["Creating original theatre from a starting point (stimulus, text, theme)","Collaborative devising processes: brainstorming, workshopping, rehearsing","Applying a theatrical style or practitioner's approach","Performing to a live audience","Documenting the collaborative process in a theatre log"] },
      { name:"Solo Theatre Piece", dotPoints:["Developing an independent solo performance","Drawing on research into a theatre practitioner","Applying specific techniques and conventions in performance","Creating a director's notebook documenting development","Reflecting on performance process and outcomes"] },
      { name:"HL Extension — Independent Portfolio", dotPoints:["Writing critical analysis of live or recorded theatre works","Examining how theatre creates meaning through all production elements","Researching and responding to theatre from a range of cultural contexts","Developing as a reflective theatre maker and analyst","Extended documentation of creative and analytical processes"] },
    ]
  },

  "Theory of Knowledge (TOK)": {
    units:"IB Core — 2 years", assessmentType:"TOK Exhibition (33%) + TOK Essay (67%)",
    areas: [
      { name:"Core Theme — Knowledge & the Knower", dotPoints:["What does it mean to know something?","Personal knowledge vs shared knowledge","The relationship between knowledge, belief and truth","Knower's perspective: bias, assumptions, prior knowledge","The role of emotions, reason, language and sense perception in knowing"] },
      { name:"Areas of Knowledge", dotPoints:["Natural sciences: scientific method, paradigm shifts, ethical dimensions","Human sciences: reliability, generalisability, researcher bias","History: sources, interpretations, selectivity","Arts: knowledge through aesthetic experience, ambiguity","Mathematics: certainty, proof, abstraction, axioms","Ethics: moral knowledge, relativism vs universalism, applied ethics","Indigenous knowledge systems: integration into TOK framework"] },
      { name:"TOK Exhibition", dotPoints:["Choosing 3 objects or artefacts that connect to a core TOK theme","Writing a 950-word commentary explaining how each object connects to TOK","Demonstrating knowledge of TOK concepts and themes","Showing how TOK connects to the real world","Selecting from prescribed TOK prompts"] },
      { name:"TOK Essay", dotPoints:["Selecting from 6 prescribed essay titles","Developing a well-structured argument about knowledge","Using real-life examples from different Areas of Knowledge","Evaluating perspectives and counter-arguments","Writing a 1600-word analytical essay with clear thesis and evidence"] },
    ]
  },

  "Extended Essay (EE)": {
    units:"IB Core — 2 years", assessmentType:"Written essay (75%) + Viva Voce (25%)",
    areas: [
      { name:"Research & Question Formulation", dotPoints:["Choosing a subject for the extended essay (any IB subject)","Developing a focused, manageable research question","Understanding the difference between description and analysis","Preliminary research and source identification","Working with a supervisor: meetings, expectations, academic integrity"] },
      { name:"Research Methods & Sources", dotPoints:["Finding and evaluating academic sources: peer-reviewed journals, books, databases","Primary vs secondary sources; distinguishing reliable from unreliable sources","Referencing systems: in-text citations and bibliography (MLA, APA, Chicago)","Avoiding plagiarism: paraphrasing, quoting, citing","Ethical considerations in research"] },
      { name:"Writing the Essay", dotPoints:["Essay structure: introduction (with RQ), body, conclusion","Developing a clear argument throughout 4000 words","Using evidence to support claims","Academic writing style: formal, objective, precise","Revision, editing and proofreading strategies"] },
      { name:"Reflection & Viva Voce", dotPoints:["Three formal reflections logged in RPPF (Reflections on Planning and Progress Form)","Evaluating the research process honestly","Identifying strengths and limitations of methodology","The Viva Voce: 10-15 minute interview with supervisor","Discussing what was learned through the EE process"] },
    ]
  },

  "CAS (Creativity, Activity, Service)": {
    units:"IB Core — 2 years", assessmentType:"Ongoing portfolio + reflections (pass/fail)",
    areas: [
      { name:"Creativity", dotPoints:["Engaging in arts, design, technology or other creative pursuits","Exploring and expressing ideas and feelings through creative media","Taking creative risks and experimenting with new approaches","Reflecting on the creative process and development","Examples: drama production, music performance, art project, design challenge, creative writing"] },
      { name:"Activity", dotPoints:["Participating in physical exercise or sport as a balanced aspect of healthy living","Setting fitness or skills goals and working towards them","Engaging in new physical experiences or improving existing skills","Reflecting on physical development and challenges overcome","Examples: team sport, dance, martial arts, gym, hiking, swimming, yoga"] },
      { name:"Service", dotPoints:["Volunteering and contributing to the community without personal gain","Identifying community needs and responding with meaningful action","Collaborating with others to achieve service goals","Reflecting on the impact of service and what was learned","Examples: environmental projects, tutoring, charity work, community events, advocacy"] },
      { name:"CAS Project & Learning Outcomes", dotPoints:["Planning and completing a collaborative CAS project","Demonstrating 7 CAS learning outcomes: identify strengths/develop new skills, undertake challenges, plan/initiate activities, work collaboratively, show perseverance, engage with issues of global significance, consider ethical implications","Writing meaningful reflections (not just descriptions)","Collecting evidence: photos, videos, evaluations, supervisor sign-offs","Meeting IB requirements for CAS completion"] },
    ]
  },

  // ── YEAR 9-10 ELECTIVES ──
  "Drama (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Practical performance + written response",
    areas: [
      { name:"Drama Elements & Techniques", dotPoints:["Elements of drama: role, character, relationships, situation, focus, tension, space, time","Voice: volume, pitch, pace, tone, diction, projection","Movement: gesture, facial expression, proxemics, physicality","Dramatic tension: conflict, mystery, surprise, contrast","Stagecraft: basic lighting, sound, costume and set concepts"] },
      { name:"Devising & Creating Drama", dotPoints:["Stimulus-based improvisation: responding to images, music, objects, text","Collaborative drama-making processes","Developing characters from scratch","Script writing: dialogue, stage directions, dramatic structure","Adapting stories, poems or news events into dramatic form"] },
      { name:"Performing Drama", dotPoints:["Solo and ensemble performance","Committing to role with consistency and authenticity","Using rehearsal processes effectively","Performing for a live audience","Reflecting on and evaluating own performance"] },
      { name:"Responding to Drama", dotPoints:["Watching and analysing live or recorded performances","Using drama terminology to discuss performances","Understanding different theatrical styles: naturalism, expressionism, physical theatre","Comparing Australian and international dramatic works","Writing drama reviews and analytical responses"] },
    ]
  },

  "Music (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Performance + musicology tasks + aural tests",
    areas: [
      { name:"Music Performance", dotPoints:["Developing technical proficiency on chosen instrument or voice","Performing solo and ensemble repertoire","Interpreting notation and following a score","Understanding expressive elements: dynamics, tempo, articulation","Preparing and presenting a performance for assessment"] },
      { name:"Music Theory & Notation", dotPoints:["Reading and writing treble and bass clef notation","Rhythmic notation: note values, rests, time signatures, syncopation","Scales: major, natural minor, pentatonic","Chords and chord progressions: I, IV, V, vi","Intervals, transposition and basic harmonic analysis"] },
      { name:"Music Composition", dotPoints:["Composing short pieces using a given style or structure","Using digital audio workstations (DAWs) for composition","Applying compositional devices: repetition, contrast, sequence, ostinato","Composing for different ensembles and genres","Documenting compositional decisions and reflecting on outcomes"] },
      { name:"Music in Context", dotPoints:["Historical periods: Baroque, Classical, Romantic, 20th century","Australian music: Indigenous music, contemporary artists, ARIA-charting music","World music: identifying cultural origins and features of different musical traditions","Music and technology: from recording to streaming","Career pathways in music: performance, production, teaching, composition"] },
    ]
  },

  "Visual Arts (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Folio + resolved artwork + written response",
    areas: [
      { name:"Art Making", dotPoints:["Working in a range of media: drawing, painting, printmaking, sculpture, photography, digital art","Developing technical skills in chosen medium","Exploring a theme or concept through sustained investigation","Documenting the development of work in a folio","Producing resolved artworks that demonstrate skill and intent"] },
      { name:"Art Elements & Principles", dotPoints:["Elements of design: line, shape, form, colour, texture, tone, space","Principles of design: balance, contrast, emphasis, pattern, repetition, unity, movement","Colour theory: colour wheel, complementary, analogous, warm/cool colours","Compositional strategies: rule of thirds, leading lines, framing","Using visual elements to create mood, atmosphere and meaning"] },
      { name:"Art History & Appreciation", dotPoints:["Art movements: Renaissance, Impressionism, Expressionism, Surrealism, Pop Art, Abstract","Key artists and their significance in art history","Indigenous Australian art: symbols, traditions, connection to Country","Contemporary art: what makes something 'art' today?","Visiting galleries and writing analytical responses to artworks"] },
      { name:"Design & Digital Art", dotPoints:["Principles of graphic design: typography, layout, visual hierarchy","Digital tools: Adobe Photoshop, Illustrator, Canva basics","Photography: composition, lighting, editing","Animation and digital storytelling","Ethical issues in design: copyright, cultural appropriation, representation"] },
    ]
  },

  "Food Technology (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Practical tasks + written assessments",
    areas: [
      { name:"Food Science & Nutrition", dotPoints:["Macronutrients: carbohydrates, proteins, fats — functions and sources","Micronutrients: vitamins and minerals — key roles","Australian Dietary Guidelines for adolescents","Reading and interpreting food labels: nutrition information panel, ingredients","Special dietary needs: vegetarian, vegan, gluten-free, lactose-intolerant, religious requirements"] },
      { name:"Food Safety & Hygiene", dotPoints:["Personal hygiene practices in food preparation","Cross-contamination: causes and prevention","Temperature control: danger zone (5°C–60°C), safe cooking temperatures","Food storage: FIFO, correct temperatures, containers","Australian food safety laws and standards"] },
      { name:"Food Preparation Skills", dotPoints:["Knife skills: chopping, slicing, dicing, julienne techniques","Cooking methods: boiling, steaming, frying, baking, grilling, roasting","Following recipes: measuring, conversions, scaling","Preparing dishes from different cultural traditions","Plating and presentation techniques"] },
      { name:"Food Systems & Sustainability", dotPoints:["From paddock to plate: how food is grown, processed, distributed","Food waste: causes, impacts and reduction strategies","Sustainable food choices: local, seasonal, plant-based eating","The environmental impact of different foods: meat vs plant-based","Fair trade and ethical food production"] },
    ]
  },

  "Design & Technology (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Design folio + practical project",
    areas: [
      { name:"Design Process", dotPoints:["Understanding a brief: constraints, requirements, target audience","Research and analysis: gathering information to inform design","Generating and developing ideas: sketching, brainstorming, mind-mapping","Prototype development: models, mockups, 3D printing","Evaluation: testing against criteria and refining design"] },
      { name:"Materials & Manufacturing", dotPoints:["Properties of materials: timber, metals, plastics, composites, textiles","Selecting appropriate materials for a design task","Marking out, cutting and joining techniques","Finishing processes: sanding, painting, coating","Manufacturing processes: hand tools, machine tools, CNC, 3D printing"] },
      { name:"Technology & Society", dotPoints:["Impact of technology on daily life and society","Sustainable design: material choice, longevity, recyclability","Intellectual property: patents, trademarks, copyright in design","Emerging technologies: robotics, AI, smart materials","Ethical design: accessibility, inclusion, cultural sensitivity"] },
      { name:"Digital Design & Fabrication", dotPoints:["CAD (Computer-Aided Design) software: SketchUp, Tinkercad, Fusion 360","2D drawing and drafting: plans, elevations, sections","Laser cutting and engraving","Arduino and basic electronics: circuits, sensors, actuators","Product design documentation: specifications, assembly drawings"] },
    ]
  },

  "Media Studies (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Media production + analytical tasks",
    areas: [
      { name:"Media Codes & Conventions", dotPoints:["Technical codes: camera angles and shots, lighting, editing, sound","Symbolic codes: costume, setting, colour, gesture, expression","Narrative codes: plot structure, character types, genre conventions","Written codes: headlines, captions, dialogue","How codes work together to create meaning in media texts"] },
      { name:"Media Industries & Audiences", dotPoints:["Australian media landscape: commercial, public and community media","Media ownership: concentration, regulation, diversity","Target audiences: demographics, psychographics, audience segmentation","How audiences interact with media: active vs passive audience theories","Media regulation in Australia: ACMA, classification system"] },
      { name:"Media Production", dotPoints:["Pre-production: concept development, scripting, storyboarding, planning","Production skills: filming, photography, audio recording","Post-production: video editing (DaVinci, iMovie, Premiere), audio editing","Creating for different platforms: social media, broadcast, print","Evaluating own production work against a brief"] },
      { name:"Critical Media Literacy", dotPoints:["Identifying media bias and perspective","Understanding stereotyping and representation in media","Analysing how media constructs versions of reality","Fake news, misinformation and how to verify sources","Digital citizenship: responsible use of social media and online platforms"] },
    ]
  },

  "Japanese (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Listening, reading, writing and speaking tasks",
    areas: [
      { name:"Speaking & Listening", dotPoints:["Hiragana and katakana reading and pronunciation","Conversational phrases: greetings, introductions, shopping, directions","Discussing daily routines, school life, family, hobbies","Understanding spoken Japanese in real-world contexts","Participating in short role-plays and conversations"] },
      { name:"Reading & Writing", dotPoints:["Reading hiragana, katakana and approximately 100 kanji","Writing simple sentences and short paragraphs in Japanese script","Using basic grammatical structures: は、が、を、に particles","Verb forms: dictionary form, ます form, て-form","Reading simple texts: menus, signs, emails, short stories"] },
      { name:"Grammar & Vocabulary", dotPoints:["Sentence structure: Subject-Object-Verb (SOV)","Adjective types: い-adjectives and な-adjectives","Verb conjugation: present/future, past, negative, て-form","Question words: なに、どこ、いつ、だれ、どうして","Common expressions: ありがとう、すみません、わかりません"] },
      { name:"Japanese Culture", dotPoints:["Japanese school life and education system","Traditional and contemporary Japanese culture: food, festivals, pop culture","Japan's geography: major cities, regions, landmarks","Japanese customs and social etiquette","Comparing Japanese culture with Australian culture"] },
    ]
  },

  "French (Year 9-10)": {
    units:"Year 9–10", assessmentType:"Listening, reading, writing and speaking tasks",
    areas: [
      { name:"Speaking & Listening", dotPoints:["Conversational French: greetings, introductions, shopping, travel","Discussing personal information, family, school, leisure activities","Understanding spoken French at natural speed","Participating in simple conversations and role-plays","Developing pronunciation and intonation"] },
      { name:"Reading & Writing", dotPoints:["Reading simple to moderately complex French texts","Understanding articles, emails, advertisements, short stories","Writing paragraphs and short essays in French","Formal and informal written registers","Using a dictionary and cognates strategically"] },
      { name:"Grammar Essentials", dotPoints:["Verb tenses: présent, passé composé, imparfait, futur proche, futur simple","Gender and agreement: adjectives, articles, past participles","Pronoun use: personal, direct, indirect, reflexive","Negation: ne...pas, ne...jamais, ne...rien, ne...plus","Question forms: inversion, est-ce que, interrogative pronouns"] },
      { name:"French Culture", dotPoints:["Francophone world: France, Québec, Africa, Pacific French territories","French customs, food and daily life","French history and its global influence","Contemporary French culture: cinema, music, sport, fashion","Comparing French and Australian social norms and values"] },
    ]
  },

};

function getCurriculumContext(subject, topic, userNotes, yearLevel) {
  const curriculum = yearLevel==="ib"?"IB Diploma":yearLevel==="vce"?"VCE":ALL_SUBJECTS[yearLevel]?.label||"Victorian";
  // Try exact match first, then partial match
  const subjData = VCAA_CURRICULUM[subject] ||
    Object.entries(VCAA_CURRICULUM).find(([k])=>subject.toLowerCase().includes(k.toLowerCase())||k.toLowerCase().includes(subject.toLowerCase()))?.[1];
  let context = `CURRICULUM: ${curriculum} ${subject}\n`;

  if (subjData) {
    context += `Assessment: ${subjData.assessmentType}\n`;
    if (topic) {
      const area = subjData.areas.find(a => a.name.toLowerCase().includes(topic.toLowerCase()))
        || subjData.areas.find(a => topic.toLowerCase().includes(a.name.toLowerCase().split(" ")[0]));
      if (area) {
        context += `\nFocus Area: ${area.name}\nOfficial Curriculum Dot Points:\n`;
        area.dotPoints.forEach(dp => { context += `• ${dp}\n`; });
      } else {
        context += `\nCurrent Topic: ${topic}\n`;
        context += `All Areas: ${subjData.areas.map(a=>a.name).join(", ")}\n`;
        subjData.areas.forEach(a => {
          context += `\n${a.name}: ${a.dotPoints.slice(0,3).join("; ")}\n`;
        });
      }
    } else {
      context += `\nAll Curriculum Areas:\n`;
      subjData.areas.forEach(a => {
        context += `\n${a.name}:\n`;
        a.dotPoints.forEach(dp => { context += `• ${dp}\n`; });
      });
    }
  } else {
    context += `\nYear level: ${curriculum}\nSubject: ${subject}\n`;
    if (topic) context += `Current topic: ${topic}\n`;
    context += `\nGenerate content appropriate for the Australian ${curriculum} curriculum for this subject.\n`;
  }

  if (userNotes?.trim()) {
    context += `\nSTUDENT'S OWN NOTES/TEXTBOOK (USE THIS AS PRIMARY SOURCE — prioritise over general curriculum):\n${userNotes}\n`;
  }
  return context;
}

// ─────────────────────────────────────────────
// CLEAN MATH — converts LaTeX to readable symbols
// Used everywhere text is displayed
// ─────────────────────────────────────────────
function cleanMath(text) {
  if (!text) return text;
  return text
    // Remove $...$ LaTeX delimiters and convert contents
    .replace(/\$([^$]+)\$/g, (_, math) => convertLatex(math))
    // Handle \(...\) and \[...\] delimiters
    .replace(/\\\(([^)]+)\\\)/g, (_, math) => convertLatex(math))
    .replace(/\\\[([^\]]+)\\\]/g, (_, math) => convertLatex(math))
    // Handle standalone symbols outside delimiters
    .replace(/\^2(?!\d)/g, '²')
    .replace(/\^3(?!\d)/g, '³')
    .replace(/\^4(?!\d)/g, '⁴')
    .replace(/\^n(?!\w)/g, 'ⁿ');
}

function convertLatex(math) {
  return math
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt(\w)/g, '√$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\therefore/g, '∴')
    .replace(/\\because/g, '∵')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\int/g, '∫')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^n/g, 'ⁿ')
    .replace(/\^0/g, '⁰')
    .replace(/\^1/g, '¹')
    .replace(/\^{([^}]+)}/g, '^($1)')
    .replace(/_{([^}]+)}/g, '_($1)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\left/g, '').replace(/\\right/g, '')
    .replace(/\\{/g, '{').replace(/\\}/g, '}');
}


function MarkdownRenderer({ content }) {
  const render = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // H1
      if (line.startsWith('# ')) {
        elements.push(<h2 key={i} style={{fontFamily:"var(--ff)",fontSize:20,fontWeight:900,color:"var(--text)",margin:"20px 0 12px",borderBottom:"1px solid var(--border)",paddingBottom:8}}>{renderInline(line.slice(2))}</h2>);
      }
      // H2
      else if (line.startsWith('## ')) {
        elements.push(<h3 key={i} style={{fontFamily:"var(--ff)",fontSize:16,fontWeight:800,color:"var(--accent)",margin:"18px 0 8px"}}>{renderInline(line.slice(3))}</h3>);
      }
      // H3
      else if (line.startsWith('### ')) {
        elements.push(<h4 key={i} style={{fontFamily:"var(--ff)",fontSize:14,fontWeight:700,color:"var(--a2)",margin:"14px 0 6px"}}>{renderInline(line.slice(4))}</h4>);
      }
      // Horizontal rule
      else if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={i} style={{border:"none",borderTop:"1px solid var(--border)",margin:"16px 0"}}/>);
      }
      // Bullet point
      else if (line.match(/^[\s]*[-*•]\s+/)) {
        const indent = line.match(/^(\s*)/)[1].length;
        const text = line.replace(/^[\s]*[-*•]\s+/, '');
        elements.push(
          <div key={i} style={{display:"flex",gap:8,marginBottom:4,paddingLeft:indent*8}}>
            <span style={{color:"var(--accent)",flexShrink:0,marginTop:2}}>•</span>
            <span style={{fontSize:14,lineHeight:1.7,color:"#d0d0e8"}}>{renderInline(text)}</span>
          </div>
        );
      }
      // Numbered list
      else if (line.match(/^\d+\.\s+/)) {
        const num = line.match(/^(\d+)\./)[1];
        const text = line.replace(/^\d+\.\s+/, '');
        elements.push(
          <div key={i} style={{display:"flex",gap:10,marginBottom:4}}>
            <span style={{color:"var(--accent)",fontWeight:700,flexShrink:0,minWidth:20,fontFamily:"var(--ff)"}}>{num}.</span>
            <span style={{fontSize:14,lineHeight:1.7,color:"#d0d0e8"}}>{renderInline(text)}</span>
          </div>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={i} style={{height:8}}/>);
      }
      // Regular paragraph
      else if (line.trim()) {
        elements.push(<p key={i} style={{fontSize:14,lineHeight:1.8,color:"#d0d0e8",margin:"4px 0"}}>{renderInline(line)}</p>);
      }
      i++;
    }
    return elements;
  };

  const renderInline = (text) => {
    // Process inline formatting
    const parts = [];
    let remaining = text;
    let key = 0;

    // Replace LaTeX-style math with readable format
    remaining = remaining
      .replace(/\$([^$]+)\$/g, (_, math) => {
        return math
          .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
          .replace(/\\times/g, '×')
          .replace(/\\div/g, '÷')
          .replace(/\\pm/g, '±')
          .replace(/\\leq/g, '≤')
          .replace(/\\geq/g, '≥')
          .replace(/\\neq/g, '≠')
          .replace(/\\approx/g, '≈')
          .replace(/\\pi/g, 'π')
          .replace(/\\alpha/g, 'α')
          .replace(/\\beta/g, 'β')
          .replace(/\\Delta/g, 'Δ')
          .replace(/\\delta/g, 'δ')
          .replace(/\\theta/g, 'θ')
          .replace(/\\infty/g, '∞')
          .replace(/\^2/g, '²')
          .replace(/\^3/g, '³')
          .replace(/\^n/g, 'ⁿ')
          .replace(/\^/g, '^')
          .replace(/_/g, '_');
      })
      // Also handle ^2 ^3 outside of LaTeX
      .replace(/\^2(?!\d)/g, '²')
      .replace(/\^3(?!\d)/g, '³');

    // Split by bold (**text**) and code (`text`)
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
      }
      const m = match[0];
      if (m.startsWith('**')) {
        parts.push(<strong key={key++} style={{color:"var(--text)",fontWeight:700}}>{m.slice(2,-2)}</strong>);
      } else if (m.startsWith('`')) {
        parts.push(<code key={key++} style={{background:"var(--bg3)",padding:"1px 6px",borderRadius:4,fontSize:13,color:"var(--a2)",fontFamily:"monospace"}}>{m.slice(1,-1)}</code>);
      } else if (m.startsWith('*')) {
        parts.push(<em key={key++} style={{color:"var(--muted2)"}}>{m.slice(1,-1)}</em>);
      }
      lastIndex = match.index + m.length;
    }
    if (lastIndex < remaining.length) {
      parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : remaining;
  };

  return <div style={{fontSize:14,lineHeight:1.8}}>{render(content)}</div>;
}

// ─────────────────────────────────────────────
// SUBTOPICS DATABASE — structured content per topic area
// ─────────────────────────────────────────────
const SUBTOPICS = {
  "Number & Algebra": [
    {id:"surds",emoji:"√",title:"Surds & Irrational Numbers",summary:"Numbers that can't be expressed as exact fractions, left in root form.",keyFacts:["√2, √3, √5 are irrational — they go on forever","Simplify: √72 = √(36×2) = 6√2","Multiply: √a × √b = √(ab)","Divide: √a ÷ √b = √(a/b)","Can't add unlike surds: √2 + √3 ≠ √5"],formula:"√(ab) = √a × √b"},
    {id:"sci-notation",emoji:"×10",title:"Scientific Notation",summary:"Writing very large or small numbers as a × 10ⁿ where 1 ≤ a < 10.",keyFacts:["4,500,000 = 4.5 × 10⁶","0.00032 = 3.2 × 10⁻⁴","Multiply: add the powers of 10","Divide: subtract the powers of 10","Used in science for astronomical/microscopic values"],formula:"a × 10ⁿ where 1 ≤ a < 10"},
    {id:"expanding",emoji:"()",title:"Expanding Brackets",summary:"Multiply every term inside the brackets by the term outside.",keyFacts:["a(b+c) = ab + ac","(a+b)(c+d) = ac + ad + bc + bd","(a+b)² = a² + 2ab + b²","(a-b)² = a² - 2ab + b²","(a+b)(a-b) = a² - b²  (difference of squares)"],formula:"(a+b)² = a² + 2ab + b²"},
    {id:"factorising",emoji:"÷",title:"Factorising",summary:"The reverse of expanding — find what multiplies to give an expression.",keyFacts:["Find HCF first: 6x + 9 = 3(2x + 3)","Difference of squares: a²-b² = (a+b)(a-b)","Trinomials: x²+5x+6 = (x+2)(x+3)","Find two numbers that multiply to c and add to b","Always check by expanding back"],formula:"a²-b² = (a+b)(a-b)"},
    {id:"indices",emoji:"aⁿ",title:"Index Laws",summary:"Rules for working with powers and exponents.",keyFacts:["aᵐ × aⁿ = aᵐ⁺ⁿ  (multiply: add powers)","aᵐ ÷ aⁿ = aᵐ⁻ⁿ  (divide: subtract powers)","(aᵐ)ⁿ = aᵐⁿ  (power of power: multiply)","a⁰ = 1  (anything to power 0)","a⁻ⁿ = 1/aⁿ  (negative power = reciprocal)"],formula:"aᵐ × aⁿ = aᵐ⁺ⁿ"},
  ],
  "Measurement & Geometry": [
    {id:"pythagoras",emoji:"📐",title:"Pythagoras' Theorem",summary:"In a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides.",keyFacts:["a² + b² = c²  (c is always the hypotenuse)","Hypotenuse is opposite the right angle — always the longest side","Finding hypotenuse: c = √(a² + b²)","Finding a shorter side: a = √(c² - b²)","Pythagorean triples: 3,4,5 and 5,12,13 and 8,15,17"],formula:"a² + b² = c²"},
    {id:"trigonometry",emoji:"📏",title:"Trigonometry — SOH CAH TOA",summary:"Using ratios of sides in right-angled triangles to find unknown sides and angles.",keyFacts:["SOH: sin θ = Opposite / Hypotenuse","CAH: cos θ = Adjacent / Hypotenuse","TOA: tan θ = Opposite / Adjacent","To find an angle: use inverse sin⁻¹, cos⁻¹, tan⁻¹","Label sides relative to the angle you're working with"],formula:"sin θ = O/H   cos θ = A/H   tan θ = O/A"},
    {id:"area",emoji:"⬜",title:"Area & Perimeter",summary:"Area is the space inside a 2D shape. Perimeter is the distance around it.",keyFacts:["Rectangle: A = l × w, P = 2(l+w)","Triangle: A = ½ × b × h","Circle: A = πr², Circumference = 2πr","Trapezium: A = ½(a+b)h","Parallelogram: A = b × h"],formula:"Triangle: A = ½bh   Circle: A = πr²"},
    {id:"volume",emoji:"📦",title:"Volume & Surface Area",summary:"Volume is the 3D space inside a solid. Surface area is the total of all faces.",keyFacts:["Rectangular prism: V = lwh","Cylinder: V = πr²h","Triangular prism: V = ½bhl","Cylinder SA = 2πr² + 2πrh","Sphere: V = 4/3 πr³, SA = 4πr²"],formula:"Cylinder: V = πr²h   Prism: V = base area × height"},
    {id:"similarity",emoji:"🔍",title:"Similar Figures & Scale Factors",summary:"Shapes are similar if they have the same angles and proportional sides.",keyFacts:["Matching angles are equal","Corresponding sides are in the same ratio","Scale factor k: if sides × k, area × k², volume × k³","Find scale factor: divide matching sides","Use ratios to find unknown sides"],formula:"scale factor k: area ratio = k²"},
    {id:"circle-geo",emoji:"⭕",title:"Circle Geometry",summary:"Properties and theorems relating to circles, chords, tangents and angles.",keyFacts:["Angle in semicircle = 90°","Angle at centre = 2 × angle at circumference","Angles in same segment are equal","Tangent is perpendicular to radius at point of contact","Chord from centre bisects the chord at 90°"]},
  ],
  "Statistics & Probability": [
    {id:"data-types",emoji:"📊",title:"Data Types & Displays",summary:"Data is either categorical (types) or numerical (counts/measurements).",keyFacts:["Categorical: colour, gender, type — no numbers","Numerical discrete: countable whole numbers (goals scored)","Numerical continuous: measurements (height, time)","Dot plots and stem-and-leaf: for small data sets","Box plots: show median, quartiles, outliers"],},
    {id:"summary-stats",emoji:"📈",title:"Summary Statistics",summary:"Single numbers that describe the centre and spread of a data set.",keyFacts:["Mean: sum ÷ count (affected by outliers)","Median: middle value when ordered (resistant to outliers)","Mode: most frequent value","Range: max − min","IQR: Q3 − Q1 (middle 50% of data)"],formula:"Mean = Σx/n   IQR = Q3 - Q1"},
    {id:"probability",emoji:"🎲",title:"Probability",summary:"The likelihood of an event occurring, expressed as a number from 0 to 1.",keyFacts:["P(event) = favourable outcomes ÷ total outcomes","P(certain) = 1, P(impossible) = 0","Complement: P(not A) = 1 - P(A)","P(A and B) = P(A) × P(B) for independent events","P(A or B) = P(A) + P(B) - P(A and B)"],formula:"P(A) = n(A) / n(S)"},
  ],
  "Patterns & Algebra": [
    {id:"linear-equations",emoji:"⚖️",title:"Linear Equations",summary:"Equations where the highest power is 1. Solve by doing the same to both sides.",keyFacts:["Isolate the variable step by step","Expand brackets first if needed","Collect like terms on each side","Move variables to one side, numbers to the other","Check: substitute your answer back in"]},
    {id:"graphing",emoji:"📉",title:"Graphing Linear Relationships",summary:"Linear relationships form straight lines on a number plane.",keyFacts:["y = mx + b (gradient-intercept form)","m = gradient (rise ÷ run)","b = y-intercept (where line crosses y-axis)","Positive gradient: goes up left to right","Find x-intercept: set y = 0 and solve"],formula:"y = mx + b"},
    {id:"simultaneous",emoji:"✖️",title:"Simultaneous Equations",summary:"Two equations, two unknowns — find values that satisfy both.",keyFacts:["Substitution: sub one equation into the other","Elimination: add/subtract to remove a variable","Solution is the intersection point of two lines","Check by substituting into BOTH original equations","Parallel lines → no solution, same line → infinite solutions"]},
    {id:"quadratics",emoji:"∪",title:"Quadratic Equations",summary:"Equations with x² as highest power. Graphs are parabolas.",keyFacts:["Standard form: ax² + bx + c = 0","Factorise: (x+p)(x+q) = 0 → x = -p or x = -q","Quadratic formula: x = (-b ± √(b²-4ac)) / 2a","Discriminant b²-4ac: >0 two solutions, =0 one, <0 none","Vertex is the turning point of the parabola"],formula:"x = (-b ± √(b²-4ac)) / 2a"},
  ],
  "Functions & Graphs": [
    {id:"function-notation",emoji:"f(x)",title:"Functions & Function Notation",summary:"A function maps each input to exactly one output.",keyFacts:["f(x) means 'f of x' — substitute x into the rule","Domain: all valid input values","Range: all possible output values","Vertical line test: each x has only one y","Composite: f(g(x)) — apply g first, then f"]},
    {id:"transformations",emoji:"↔",title:"Transformations of Graphs",summary:"How graphs shift, stretch and flip when we change the function.",keyFacts:["y = f(x) + k: shifts UP k units","y = f(x) - k: shifts DOWN k units","y = f(x - h): shifts RIGHT h units","y = f(x + h): shifts LEFT h units","y = af(x): vertical stretch by factor a","y = -f(x): reflection in x-axis"]},
    {id:"exp-log",emoji:"eˣ",title:"Exponential & Logarithmic Functions",summary:"Exponentials model growth/decay. Logs are their inverses.",keyFacts:["y = aˣ: exponential growth if a > 1, decay if 0 < a < 1","y = eˣ: natural exponential (e ≈ 2.718)","ln(x) = log_e(x): natural logarithm","log(ab) = log a + log b","log(a/b) = log a - log b"],formula:"y = eˣ  ↔  x = ln(y)"},
  ],
  "Calculus — Differentiation": [
    {id:"power-rule",emoji:"d/dx",title:"Differentiation Rules",summary:"Shortcuts for finding derivatives of common functions.",keyFacts:["Power rule: d/dx(xⁿ) = nxⁿ⁻¹","d/dx(eˣ) = eˣ","d/dx(ln x) = 1/x","d/dx(sin x) = cos x","d/dx(cos x) = -sin x"],formula:"d/dx(xⁿ) = nxⁿ⁻¹"},
    {id:"chain-rule",emoji:"⛓",title:"Chain, Product & Quotient Rules",summary:"Rules for differentiating composite and combined functions.",keyFacts:["Chain rule: d/dx[f(g(x))] = f'(g(x)) × g'(x)","Product rule: d/dx[uv] = u'v + uv'","Quotient rule: d/dx[u/v] = (u'v - uv') / v²","Chain rule tip: 'outside × derivative of inside'","Most common exam rule: chain rule"],formula:"Chain: dy/dx = dy/du × du/dx"},
    {id:"applications-diff",emoji:"📈",title:"Applications of Differentiation",summary:"Using derivatives to analyse function behaviour and solve optimisation.",keyFacts:["f'(x) = 0 at stationary points (local max/min)","f'(x) > 0: function increasing","f'(x) < 0: function decreasing","f''(x) > 0: minimum; f''(x) < 0: maximum","Tangent gradient at x=a is f'(a)"],},
  ],
  "Calculus — Integration": [
    {id:"antidiff",emoji:"∫",title:"Antidifferentiation & Indefinite Integrals",summary:"The reverse of differentiation — finding the original function.",keyFacts:["∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ -1)","∫eˣ dx = eˣ + C","∫(1/x) dx = ln|x| + C","∫sin x dx = -cos x + C","Always add + C (constant of integration)"],formula:"∫xⁿ dx = xⁿ⁺¹/(n+1) + C"},
    {id:"definite-integrals",emoji:"∫ₐᵇ",title:"Definite Integrals & Area",summary:"Calculates the exact area between a curve and the x-axis.",keyFacts:["∫ₐᵇ f(x)dx = F(b) - F(a)  where F' = f","Area above x-axis is positive","Area below x-axis is negative — use absolute value for area","Area between two curves: ∫(top - bottom)dx","Fundamental theorem connects differentiation and integration"],formula:"∫ₐᵇ f(x)dx = F(b) - F(a)"},
  ],
  "Organic Chemistry": [
    {id:"functional-groups",emoji:"⚗️",title:"Functional Groups",summary:"Organic compounds are classified by their functional groups which determine their reactions.",keyFacts:["Alkanes: C-C single bonds, suffix -ane (methane, ethane, propane)","Alkenes: C=C double bond, suffix -ene","Alcohols: -OH group, suffix -ol (ethanol)","Carboxylic acids: -COOH, suffix -oic acid","Esters: -COO-, formed from acid + alcohol (condensation)"]},
    {id:"reaction-types",emoji:"🔄",title:"Organic Reaction Types",summary:"The key reactions organic compounds undergo.",keyFacts:["Addition: adds across C=C double bond (alkenes + H₂, Br₂, H₂O)","Substitution: replaces H with another atom (alkanes + Cl₂)","Condensation: two molecules join, releasing H₂O","Hydrolysis: breaks bonds using water (reverse of condensation)","Combustion: burns in O₂ → CO₂ + H₂O + energy"]},
  ],
  "Electrochemistry": [
    {id:"redox",emoji:"⚡",title:"Oxidation & Reduction (OIL RIG)",summary:"Redox reactions involve transfer of electrons between species.",keyFacts:["OIL: Oxidation Is Loss of electrons","RIG: Reduction Is Gain of electrons","Oxidising agent: accepts electrons (gets reduced itself)","Reducing agent: donates electrons (gets oxidised itself)","Assign oxidation numbers to track electron transfer"],formula:"OIL RIG — Oxidation Is Loss, Reduction Is Gain"},
    {id:"galvanic-cells",emoji:"🔋",title:"Galvanic Cells",summary:"Convert chemical energy to electrical energy via spontaneous redox.",keyFacts:["Anode: oxidation occurs (negative terminal)","Cathode: reduction occurs (positive terminal)","Salt bridge: maintains electrical neutrality","EMF = E°(cathode) - E°(anode)","Electrons flow: anode → external circuit → cathode"],formula:"EMF = E°cathode - E°anode"},
    {id:"electrolysis",emoji:"🔌",title:"Electrolytic Cells",summary:"Use electrical energy to drive non-spontaneous chemical reactions.",keyFacts:["Anode: oxidation (connected to + terminal)","Cathode: reduction (connected to - terminal)","Faraday's law: mass = (I × t × M) / (n × F)","Applications: electroplating, aluminium smelting","More current × more time = more product"],formula:"m = ItM / nF"},
  ],
  "Energetics & Thermodynamics": [
    {id:"enthalpy",emoji:"ΔH",title:"Enthalpy Changes",summary:"ΔH measures heat released or absorbed in a chemical reaction.",keyFacts:["Exothermic: ΔH < 0 (heat released, products lower energy)","Endothermic: ΔH > 0 (heat absorbed, products higher energy)","q = mcΔT for calorimetry calculations","Standard conditions: 25°C, 1 atm, 1 mol/L","Bond breaking absorbs energy; bond forming releases energy"],formula:"q = mcΔT"},
    {id:"gibbs",emoji:"ΔG",title:"Gibbs Free Energy & Spontaneity",summary:"ΔG predicts whether a reaction occurs spontaneously.",keyFacts:["ΔG = ΔH - TΔS","ΔG < 0: spontaneous (will occur without energy input)","ΔG > 0: non-spontaneous","ΔG = 0: at equilibrium","ΔS: entropy — measure of disorder (gases > liquids > solids)"],formula:"ΔG = ΔH - TΔS"},
  ],
  "Equilibrium & Acids/Bases": [
    {id:"equilibrium",emoji:"⇌",title:"Dynamic Equilibrium & Le Chatelier's",summary:"A reversible reaction where forward and reverse rates are equal.",keyFacts:["Equilibrium: concentrations constant (not necessarily equal)","Le Chatelier: system opposes changes to restore equilibrium","Add reactant → shifts toward products","Increase temperature → shifts toward endothermic direction","Increase pressure → shifts toward fewer moles of gas","Catalyst: speeds up reaching equilibrium, doesn't shift position"]},
    {id:"ph",emoji:"pH",title:"pH, Acids & Bases",summary:"pH measures hydrogen ion concentration on a logarithmic scale.",keyFacts:["pH = -log[H⁺]","pH < 7: acidic; pH 7: neutral; pH > 7: basic (alkaline)","Strong acids fully dissociate: HCl, H₂SO₄, HNO₃","Weak acids partially dissociate: CH₃COOH (acetic acid)","pH + pOH = 14 at 25°C","Kw = [H⁺][OH⁻] = 1×10⁻¹⁴"],formula:"pH = -log[H⁺]   pOH = -log[OH⁻]   pH + pOH = 14"},
  ],
  "Motion & Forces": [
    {id:"kinematics",emoji:"🏃",title:"Kinematics — Equations of Motion",summary:"Describes motion using displacement, velocity, acceleration and time.",keyFacts:["v = u + at","s = ut + ½at²","v² = u² + 2as","s = ½(u+v)t","Only valid for CONSTANT acceleration","v=final, u=initial, a=acceleration, s=displacement, t=time"],formula:"v = u + at  |  s = ut + ½at²  |  v² = u² + 2as"},
    {id:"newtons-laws",emoji:"⚖️",title:"Newton's Three Laws",summary:"Fundamental laws describing how forces affect the motion of objects.",keyFacts:["1st Law (Inertia): object stays at rest or moves at constant velocity unless a net force acts","2nd Law: F = ma (net force = mass × acceleration)","3rd Law: every action has equal and opposite reaction pair","Weight W = mg where g = 9.8 m/s²","Net force = vector sum of ALL forces acting"],formula:"F = ma  |  W = mg"},
    {id:"momentum",emoji:"💥",title:"Momentum & Impulse",summary:"Momentum is mass × velocity. Impulse is change in momentum.",keyFacts:["p = mv (momentum, kg⋅m/s)","Impulse J = FΔt = Δp","Conservation: total momentum unchanged if no external force","Elastic collision: KE and momentum both conserved","Inelastic: only momentum conserved (objects may stick together)"],formula:"p = mv  |  J = FΔt = Δp"},
    {id:"energy-work",emoji:"⚡",title:"Work, Energy & Power",summary:"Work is done when a force moves an object. Energy is the capacity to do work.",keyFacts:["W = Fs cos θ","KE = ½mv²","GPE = mgh","Conservation: total mechanical energy is constant (no friction)","P = W/t = Fv","Efficiency = useful output / total input × 100%"],formula:"W = Fs  |  KE = ½mv²  |  PE = mgh  |  P = W/t"},
    {id:"circular",emoji:"⭕",title:"Circular Motion",summary:"Objects moving in circles experience centripetal acceleration toward the centre.",keyFacts:["Centripetal acceleration: a = v²/r","Centripetal force: F = mv²/r (directed toward centre, NOT outward)","Period T: time for one complete revolution","Frequency f = 1/T","v = 2πr/T","Examples: satellites, cars on bends, spinning on a string"],formula:"F = mv²/r  |  a = v²/r"},
  ],
  "Electricity & Magnetism": [
    {id:"dc-circuits",emoji:"🔌",title:"DC Circuits & Ohm's Law",summary:"Circuits with direct current. All obey Ohm's Law: V = IR.",keyFacts:["Ohm's Law: V = IR (Voltage = Current × Resistance)","Series: same current everywhere, voltages add, R_total = R₁+R₂+...","Parallel: same voltage, currents add, 1/R = 1/R₁+1/R₂+...","Power: P = VI = I²R = V²/R","Kirchhoff's voltage law: sum of EMFs = sum of voltage drops"],formula:"V = IR  |  P = VI  |  Series: R=R₁+R₂"},
    {id:"em-induction",emoji:"🧲",title:"Electromagnetic Induction",summary:"A changing magnetic field induces an EMF and current in a conductor.",keyFacts:["Faraday's law: EMF = -ΔΦ/Δt","Lenz's law: induced current OPPOSES the change that caused it","Magnetic flux: Φ = BA cos θ","Generator converts mechanical → electrical energy","Transformer: V₁/V₂ = N₁/N₂ (turns ratio)"],formula:"EMF = -ΔΦ/Δt  |  V₁/V₂ = N₁/N₂"},
  ],
  "Cell Biology & Regulation": [
    {id:"cell-structure",emoji:"🔬",title:"Cell Structure & Organelles",summary:"All living things are made of cells with specific organelles performing specific functions.",keyFacts:["Nucleus: contains DNA, controls cell activities","Mitochondria: aerobic respiration → ATP (energy)","Chloroplasts: photosynthesis (plants/algae only)","Ribosomes: protein synthesis (translation)","Cell membrane: controls entry/exit (phospholipid bilayer)","Endoplasmic reticulum: transport network (rough = proteins, smooth = lipids)"]},
    {id:"dna-protein",emoji:"🧬",title:"DNA, Transcription & Translation",summary:"DNA stores genetic information and directs protein synthesis.",keyFacts:["DNA: double helix, nucleotides, base pairs A-T and G-C","Transcription: DNA → mRNA (in nucleus)","Translation: mRNA → protein (at ribosomes)","Codon: 3 bases on mRNA codes for one amino acid","Start codon: AUG; Stop codons: UAA, UAG, UGA","Gene expression is controlled — not all genes are always active"]},
    {id:"respiration",emoji:"⚡",title:"Cellular Respiration",summary:"Releases energy from glucose to produce ATP.",keyFacts:["Overall: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP","Glycolysis: glucose → pyruvate, in cytoplasm, 2 ATP, no O₂ needed","Krebs cycle: pyruvate → CO₂, in mitochondrial matrix, 2 ATP","ETC: uses O₂, produces ~32 ATP, in inner mitochondrial membrane","Anaerobic (no O₂): fermentation → lactic acid (animals) or ethanol (yeast)"],formula:"C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36 ATP"},
  ],
  "Nervous System & Brain": [
    {id:"neurons",emoji:"🧠",title:"Neurons & Synaptic Transmission",summary:"Neurons are specialised cells that transmit electrical and chemical signals.",keyFacts:["Sensory neurons: carry signals from sense organs to brain","Motor neurons: carry signals from brain to muscles/glands","Interneurons: connect sensory and motor pathways in the CNS","Action potential: electrical signal along axon (all-or-nothing response)","Synapse: gap between neurons — neurotransmitters diffuse across","Key neurotransmitters: serotonin (mood), dopamine (reward), GABA (calming)"]},
  ],
  "Learning & Memory": [
    {id:"classical-conditioning",emoji:"🔔",title:"Classical Conditioning (Pavlov)",summary:"Learning by association — a neutral stimulus becomes linked to an automatic response.",keyFacts:["US: Unconditioned Stimulus (food naturally causes salivation)","UR: Unconditioned Response (automatic response to US)","NS: Neutral Stimulus (bell — no response initially)","CS: Conditioned Stimulus (bell after pairing with food)","CR: Conditioned Response (salivation to bell alone)","Extinction: CR weakens if CS presented repeatedly without US"]},
    {id:"operant-conditioning",emoji:"🐀",title:"Operant Conditioning (Skinner)",summary:"Learning through consequences — behaviour strengthened or weakened by outcomes.",keyFacts:["Positive reinforcement: add pleasant stimulus → behaviour increases","Negative reinforcement: remove unpleasant → behaviour increases (e.g. taking painkiller removes pain)","Positive punishment: add unpleasant → behaviour decreases","Negative punishment: remove pleasant → behaviour decreases","Variable ratio schedule: most resistant to extinction (e.g. pokies, social media)"]},
    {id:"memory-models",emoji:"🧠",title:"Atkinson-Shiffrin Memory Model",summary:"Information flows through sensory, short-term and long-term memory stores.",keyFacts:["Sensory memory: fraction of a second (iconic = visual; echoic = auditory)","Short-term memory (STM): 20-30 seconds, capacity of 7±2 chunks","Long-term memory (LTM): potentially unlimited capacity and duration","Maintenance rehearsal transfers STM → LTM","Levels of processing: deeper processing = better encoding and recall"]},
  ],
  "The Victorian Court System": [
    {id:"court-hierarchy",emoji:"⚖️",title:"Court Hierarchy",summary:"Courts are arranged by jurisdiction and status — higher courts set binding precedent.",keyFacts:["Magistrates Court: summary offences, civil up to $100K","County Court: serious indictable offences, civil up to $1M","Supreme Court: most serious crimes, unlimited civil jurisdiction","Court of Appeal: hears appeals from Magistrates and County Courts","High Court of Australia: final court of appeal, constitutional matters","Higher courts bind lower courts through doctrine of precedent"]},
  ],
  "Criminal Law": [
    {id:"elements-crime",emoji:"🔍",title:"Elements of a Crime",summary:"Every crime requires two elements proved beyond reasonable doubt.",keyFacts:["Actus reus: the guilty act (physical element)","Mens rea: the guilty mind (mental/intention element)","Both must be present AND occur at the same time","Strict liability offences: actus reus only (e.g. speeding)","Standard of proof in criminal law: beyond reasonable doubt","Burden of proof: prosecution must prove guilt (accused is presumed innocent)"]},
  ],
  "Functions & Graphs (Year 9-10)": [
    {id:"linear-graphs",emoji:"📉",title:"Linear & Non-Linear Graphs",summary:"Graphs of equations showing relationships between variables.",keyFacts:["Linear: y = mx + b — straight line","Gradient m = rise/run","Parabola: y = ax² + bx + c — U-shaped curve","Exponential: y = aˣ — rapid growth or decay","Transformations shift, stretch and flip graphs"]},
    {id:"parabolas",emoji:"∪",title:"Parabolas & Quadratic Graphs",summary:"U-shaped graphs of quadratic functions y = ax² + bx + c.",keyFacts:["Vertex: turning point of the parabola","Axis of symmetry: x = -b/2a","x-intercepts: where parabola crosses x-axis (roots)","a > 0: opens upward (happy face) ∪","a < 0: opens downward (sad face) ∩"],formula:"y = ax² + bx + c"},
  ],
  "Biology (Year 9-10)": [
    {id:"cells",emoji:"🔬",title:"Cells & Cell Division",summary:"All living things are made of cells. New cells form through division.",keyFacts:["Plant cells: cell wall, chloroplasts, large vacuole (not in animal cells)","Animal cells: no cell wall, no chloroplasts, small vacuoles","Mitosis: produces 2 identical daughter cells (growth and repair)","Meiosis: produces 4 gametes with half the chromosomes (reproduction)","DNA in nucleus controls all cell activities"]},
    {id:"genetics",emoji:"🧬",title:"Genetics & Inheritance",summary:"Traits are passed from parents to offspring through genes.",keyFacts:["Genes are sections of DNA on chromosomes","Alleles: different versions of the same gene","Dominant allele (B) masks recessive (b) — BB or Bb shows dominant trait","Recessive only shows if both alleles are recessive (bb)","Punnett squares predict probability of offspring traits"]},
    {id:"evolution",emoji:"🦎",title:"Evolution & Natural Selection",summary:"Species change over time through natural selection acting on variation.",keyFacts:["Variation: individuals differ within a species","Survival of the fittest: better-adapted individuals survive and reproduce","Inherited traits: successful adaptations passed to offspring","Evidence: fossil record, comparative anatomy, DNA similarities","Speciation: isolated populations diverge into separate species"]},
  ],
  "Chemistry (Year 9-10)": [
    {id:"atomic-structure",emoji:"⚛️",title:"Atomic Structure",summary:"Atoms have protons, neutrons and electrons arranged in a specific way.",keyFacts:["Protons: positive charge, in nucleus","Neutrons: no charge, in nucleus","Electrons: negative charge, in shells around nucleus","Atomic number = number of protons","Mass number = protons + neutrons","Ions: atoms that have gained or lost electrons"],formula:"Atomic number = protons | Mass number = protons + neutrons"},
    {id:"periodic-table",emoji:"🗂️",title:"The Periodic Table",summary:"Elements arranged by atomic number in groups (columns) and periods (rows).",keyFacts:["Group: column — elements have similar properties","Period: row — same number of electron shells","Metals: left side, conductors, lose electrons to form positive ions","Non-metals: right side, insulators, gain electrons to form negative ions","Noble gases: Group 18, full outer shell, very unreactive","Valence electrons determine reactivity and bonding"]},
    {id:"chemical-reactions",emoji:"⚗️",title:"Chemical Reactions",summary:"Substances rearrange their atoms to form new products with different properties.",keyFacts:["Reactants → Products (written as chemical equation)","Law of conservation of mass: total mass doesn't change","Balancing equations: same number of each atom on both sides","Exothermic: releases heat (combustion, neutralisation)","Endothermic: absorbs heat (photosynthesis, cooking)","Indicators: show if a substance is acid, neutral or base"],},
  ],
  "Physics (Year 9-10)": [
    {id:"motion-forces",emoji:"🏃",title:"Motion & Forces",summary:"Motion is described by distance, speed, velocity and acceleration. Forces cause changes in motion.",keyFacts:["Speed = distance ÷ time","Velocity: speed with direction (vector)","Acceleration: change in velocity ÷ time","Newton's 1st Law: object stays at rest or constant velocity unless a net force acts","Newton's 2nd Law: F = ma","Newton's 3rd Law: every action has equal and opposite reaction"],formula:"speed = distance/time | F = ma"},
    {id:"energy-waves",emoji:"🌊",title:"Energy & Waves",summary:"Energy comes in many forms and can be transferred and transformed.",keyFacts:["KE = ½mv² (kinetic energy)","GPE = mgh (gravitational potential energy)","Conservation of energy: total energy stays constant","Waves transfer energy without transferring matter","Frequency (Hz) × wavelength (m) = wave speed (m/s)","Light: reflection, refraction, dispersion"],formula:"wave speed = frequency × wavelength"},
    {id:"electricity",emoji:"⚡",title:"Electricity & Circuits",summary:"Electric current is the flow of electrons through a conductor.",keyFacts:["Ohm's Law: V = IR (Voltage = Current × Resistance)","Series circuit: same current everywhere, voltages add","Parallel circuit: same voltage, currents add","Power = Voltage × Current (P = VI)","Insulators: don't conduct electricity (rubber, plastic)","Conductors: allow current flow (copper, aluminium)"],formula:"V = IR | P = VI"},
  ],
  "Aggregate Demand & Supply": [
    {id:"aggregate-demand",emoji:"📊",title:"Aggregate Demand (AD)",summary:"Total demand for all goods and services in an economy at a given price level.",keyFacts:["AD = C + I + G + (X - M)","C = consumption (households), I = investment (businesses)","G = government spending, X = exports, M = imports","AD shifts right: more spending, lower interest rates, higher confidence","Multiplier effect: initial spending increase amplified through economy"],formula:"AD = C + I + G + (X-M)"},
    {id:"aggregate-supply",emoji:"🏭",title:"Aggregate Supply (AS)",summary:"Total production of goods and services at various price levels.",keyFacts:["Short-run AS: upward sloping (higher prices → more production)","Long-run AS: vertical at potential GDP (full employment output)","AS shifts right: lower input costs, improved technology, more workers","Supply shock: sudden disruption to AS (e.g. oil price spike)","Equilibrium: AD = AS determines price level and real output"]},
  ],

  // ── VCE ENGLISH ──
  "Reading & Responding to Texts": [
    {id:"analysing-authors",emoji:"📖",title:"Analysing How Authors Construct Meaning",summary:"Authors deliberately choose language, structure and literary techniques to shape meaning and influence readers.",keyFacts:["Language features: diction (word choice), syntax, tone, imagery, figurative language","Structure: how a text is organised — chronological, non-linear, cyclical","Perspective: the point of view from which the story is told","Context: historical, social and cultural circumstances of the text","Metalanguage: specific vocabulary for discussing texts (e.g. symbolism, characterisation, motif)"]},
    {id:"themes-values",emoji:"💡",title:"Ideas, Themes & Values",summary:"Identifying and discussing the central ideas and values explored in a text.",keyFacts:["Theme: a central idea explored throughout the text","Values: beliefs and attitudes promoted or critiqued by the text","Avoid plot summary — focus on what the text is saying about human experience","Use evidence (quotes) to support your interpretation","Consider how different readers might interpret the same text differently"]},
    {id:"written-response",emoji:"✍️",title:"Writing a Text Response Essay",summary:"A structured argument about a text using evidence and sophisticated analysis.",keyFacts:["Introduction: clear contention (your argument about the text)","Body paragraphs: TEEL — Topic sentence, Evidence, Explanation, Link","Embed quotes: integrate short quotes into your own sentences","Analysis: explain HOW the technique creates meaning, not just WHAT it does","Conclusion: synthesise your argument — don't just repeat introduction","Avoid 'the author wants us to think...' — use 'the author suggests/explores/reveals'"]},
  ],
  "Creating & Presenting": [
    {id:"writing-for-purpose",emoji:"✏️",title:"Writing for a Specific Audience & Purpose",summary:"Adapting your writing style, form and language to suit the task, audience and context.",keyFacts:["Purpose: to inform, persuade, entertain, reflect, or a combination","Audience: who will read your text — formal/informal, specific group","Form: essay, speech, short story, letter, blog post, interview","Voice: the distinctive style and personality of the writer","Register: level of formality — match to audience and purpose"]},
    {id:"persuasive-techniques",emoji:"🗣️",title:"Persuasive Writing Techniques",summary:"Rhetorical devices and language strategies used to persuade an audience.",keyFacts:["Ethos: appeal to credibility/authority ('As an expert...')","Pathos: appeal to emotion — evoke fear, sympathy, anger, hope","Logos: appeal to logic — statistics, evidence, reasoned argument","Anecdote: personal story to make argument relatable","Rhetorical question: engages reader, implies obvious answer","Rule of three: three examples or points for emphasis and rhythm"]},
    {id:"imaginative-writing",emoji:"🎨",title:"Imaginative Writing",summary:"Creating original creative texts using narrative techniques and craft.",keyFacts:["Show don't tell: use specific sensory details rather than stating emotions","Characterisation: reveal character through dialogue, action, thought, description","Setting: establishes atmosphere, mood and context","Conflict: drives narrative — internal (character vs self) or external","Voice: first person (I) or third person (he/she/they)","Structure: consider beginning, complication, climax, resolution"]},
  ],
  "Analysing Argument": [
    {id:"identifying-argument",emoji:"🔍",title:"Identifying Contention & Arguments",summary:"Analysing how a writer constructs a persuasive argument.",keyFacts:["Contention: the main argument or position of the author","Supporting arguments: specific points used to support the contention","Identify: Who? What audience? What position? What form? What context?","Arguments can be explicit (directly stated) or implicit (implied)","Consider: what is NOT said as well as what is said"]},
    {id:"analysing-language",emoji:"💬",title:"Analysing Persuasive Language",summary:"Examining how specific language choices are used to persuade.",keyFacts:["Emotive language: words chosen to trigger emotional response","Loaded language: words with strong positive or negative connotations","Inclusive language: 'we', 'our' — positions reader as part of the argument","Generalisation: broad statements presented as universal truth","Visuals: images, cartoons, graphs used to support or enhance argument","Tone: the attitude conveyed by the writer (outraged, concerned, sarcastic)"]},
    {id:"formal-analysis",emoji:"📝",title:"Writing a Formal Analytical Response",summary:"A structured analysis of how argument and language are used to persuade.",keyFacts:["Do NOT share your own opinion — analyse the author's techniques","Structure: Introduction → Body paragraphs by argument/technique → Conclusion","Begin body paragraphs with what the author argues, then HOW they persuade","Metalanguage: name the technique, quote it, explain its effect","Discuss the intended effect on the audience","Present tense: 'The author argues...' not 'The author argued...'"]},
  ],

  // ── VCE MATHS ──
  "Probability & Statistics (Methods)": [
    {id:"discrete-rv",emoji:"🎲",title:"Discrete Random Variables",summary:"Variables that can only take countable values, each with an associated probability.",keyFacts:["P(X=x) ≥ 0 for all x, and sum of all probabilities = 1","E(X) = Σ x·P(X=x) — the expected (mean) value","Var(X) = E(X²) − [E(X)]² — how spread out values are","SD(X) = √Var(X)","Binomial distribution: X ~ B(n,p) — n trials, probability p each"],formula:"E(X) = Σ x·P(X=x) | Var(X) = E(X²) - [E(X)]²"},
    {id:"normal-dist-methods",emoji:"🔔",title:"Normal Distribution",summary:"Bell-shaped distribution described by mean μ and standard deviation σ.",keyFacts:["68% of data within 1σ of mean","95% within 2σ, 99.7% within 3σ (68-95-99.7 rule)","Standardise: z = (x-μ)/σ","Use CAS to find probabilities: normalcdf(lower, upper, μ, σ)","Inverse normal: find x given a probability"],formula:"z = (x - μ) / σ"},
    {id:"confidence-intervals",emoji:"📊",title:"Statistical Inference & Confidence Intervals",summary:"Using sample data to make inferences about population parameters.",keyFacts:["Sample proportion p̂ estimates population proportion p","Standard error: SE = √(p̂(1-p̂)/n)","95% confidence interval: p̂ ± 1.96 × SE","Larger sample → narrower interval → more precise estimate","Margin of error = 1.96 × SE for 95% CI"],formula:"95% CI: p̂ ± 1.96√(p̂(1-p̂)/n)"},
  ],

  // ── VCE SPECIALIST MATHS ──
  "Algebra & Number Systems": [
    {id:"complex-numbers",emoji:"i",title:"Complex Numbers",summary:"Numbers of the form a + bi where i = √(-1).",keyFacts:["i = √(-1), i² = -1, i³ = -i, i⁴ = 1","Rectangular form: z = a + bi (a = real part, b = imaginary part)","Modulus: |z| = √(a² + b²)","Argument: θ = arctan(b/a) — angle from positive real axis","Polar form: z = r(cos θ + i sin θ) = r·cis(θ)","Complex conjugate: z̄ = a - bi"],formula:"z = a + bi | |z| = √(a² + b²)"},
    {id:"proof",emoji:"∴",title:"Mathematical Proof",summary:"Rigorous logical arguments that establish mathematical statements as definitely true.",keyFacts:["Direct proof: assume premises, deduce conclusion step by step","Proof by contradiction: assume opposite is true, derive contradiction","Mathematical induction: prove base case, then prove if P(k) true → P(k+1) true","Counterexample: one example that disproves a universal statement","Always state what you're proving and every step must follow logically"]},
  ],

  // ── VCE GENERAL MATHS ──
  "Data Analysis": [
    {id:"univariate-data",emoji:"📊",title:"Univariate Data Analysis",summary:"Analysing data with a single variable using numerical and graphical methods.",keyFacts:["Centre: mean (affected by outliers), median (resistant to outliers)","Spread: range, IQR, standard deviation","Five-number summary: min, Q1, median, Q3, max","Box plots: display five-number summary, show outliers","Outlier: more than 1.5 × IQR above Q3 or below Q1","Symmetry vs skewness: affects which measure of centre to use"]},
    {id:"bivariate-data",emoji:"📈",title:"Bivariate Data & Regression",summary:"Analysing the relationship between two numerical variables.",keyFacts:["Scatterplot: displays relationship between two variables","Pearson's r: correlation coefficient (-1 to 1)","r close to ±1: strong linear relationship; r near 0: no linear relationship","Least squares regression line: y = a + bx (line of best fit)","Interpolation: predicting within data range (reliable)","Extrapolation: predicting outside data range (unreliable)"],formula:"r measures strength and direction of linear relationship"},
    {id:"time-series",emoji:"📉",title:"Time Series Analysis",summary:"Data collected over time — identifying trends, seasonality and cycles.",keyFacts:["Trend: long-term increase or decrease","Seasonal variation: regular pattern within each year","Smoothing: moving averages reduce random variation to reveal trend","Seasonal indices: show how much each season differs from average","Deseasonalise: remove seasonal variation to see underlying trend"]},
  ],
  "Financial Arithmetic": [
    {id:"simple-compound",emoji:"💰",title:"Simple & Compound Interest",summary:"Two methods of calculating interest on investments and loans.",keyFacts:["Simple interest: I = Prt (Principal × rate × time)","Compound interest: A = P(1 + r)ⁿ","Compounding period affects final amount (more frequent = more interest)","Effective annual rate: accounts for compounding frequency","Rule of 72: years to double ≈ 72 / interest rate %"],formula:"Simple: I = Prt | Compound: A = P(1+r)ⁿ"},
    {id:"loans-annuities",emoji:"🏠",title:"Loans, Annuities & Reducible Interest",summary:"Calculating repayments and future values for financial products.",keyFacts:["Reducible interest: calculated on outstanding balance (most loans)","Annuity: regular equal payments over a fixed period","Present value: current value of future payments","Future value: total accumulated after regular deposits","Recurrence relation: Vₙ₊₁ = Vₙ(1+r) - d"],formula:"Vₙ₊₁ = Vₙ(1+r) - d"},
  ],

  // ── VCE BIOLOGY ──
  "Genetics & Inheritance": [
    {id:"mendelian",emoji:"🧬",title:"Mendelian Genetics",summary:"Gregor Mendel's laws describing how traits are inherited from parents.",keyFacts:["Dominant allele (B): expressed even with one copy","Recessive allele (b): only expressed when two copies present (bb)","Homozygous: same alleles (BB or bb); Heterozygous: different alleles (Bb)","Punnett square: predicts offspring ratios","Monohybrid cross: one trait; Dihybrid cross: two traits","Law of segregation: alleles separate during gamete formation"]},
    {id:"sex-linkage",emoji:"X",title:"Sex Linkage & Non-Mendelian Inheritance",summary:"Genes located on sex chromosomes and patterns that don't follow Mendel's laws.",keyFacts:["Sex chromosomes: females XX, males XY","X-linked genes: carried on X chromosome (e.g. colour blindness, haemophilia)","X-linked recessive: males more often affected (only one X)","Codominance: both alleles expressed (e.g. AB blood type)","Incomplete dominance: intermediate phenotype in heterozygote","Multiple alleles: more than two alleles in population (e.g. ABO blood types)"]},
    {id:"biotechnology",emoji:"🔬",title:"Biotechnology & Gene Technology",summary:"Techniques used to manipulate, analyse and apply genetic material.",keyFacts:["PCR: Polymerase Chain Reaction — amplifies tiny DNA samples","Gel electrophoresis: separates DNA fragments by size","DNA profiling: unique pattern used in forensics and paternity testing","CRISPR-Cas9: precise gene editing — cut and replace DNA sequences","Recombinant DNA: inserting gene from one organism into another","GMOs: genetically modified organisms — ethical considerations apply"]},
  ],
  "Evolution & Biodiversity": [
    {id:"natural-selection",emoji:"🦎",title:"Natural Selection & Evolution",summary:"Populations change over time as better-adapted individuals survive and reproduce.",keyFacts:["Variation: individuals differ within a population","Heritability: advantageous traits are passed to offspring","Differential reproduction: better-adapted individuals have more offspring","Over many generations: allele frequencies shift","Evidence: fossil record, comparative anatomy, DNA, biogeography","Antibiotic resistance: natural selection in action — real-world example"]},
    {id:"speciation",emoji:"🌿",title:"Speciation & Classification",summary:"How new species form and how organisms are classified into groups.",keyFacts:["Species: organisms that can interbreed to produce fertile offspring","Allopatric speciation: geographic isolation leads to divergence","Sympatric speciation: new species form in same area (e.g. polyploidy in plants)","Phylogenetic trees (cladograms): show evolutionary relationships","Binomial nomenclature: Genus species (e.g. Homo sapiens)","Domains: Bacteria, Archaea, Eukarya — three domains of life"]},
  ],
  "Immunity & Disease": [
    {id:"innate-immunity",emoji:"🛡️",title:"Innate (Non-Specific) Immunity",summary:"The body's first line of defence — rapid, non-specific response to pathogens.",keyFacts:["Physical barriers: skin, mucus membranes, cilia, stomach acid","Inflammation: redness, heat, swelling — brings immune cells to site","Phagocytes: neutrophils and macrophages engulf and destroy pathogens","Fever: elevated temperature slows pathogen reproduction","Complement system: proteins that attack pathogens and signal immune cells"]},
    {id:"adaptive-immunity",emoji:"🎯",title:"Adaptive (Specific) Immunity",summary:"Targeted immune response that develops over days and creates memory.",keyFacts:["Antigens: molecules on pathogen surface that trigger immune response","B lymphocytes: produce antibodies specific to the antigen","T helper cells: coordinate immune response","T cytotoxic cells: kill infected body cells directly","Clonal selection: B and T cells multiply rapidly when activated","Memory cells: remain after infection — faster response if exposed again","Antibodies: Y-shaped proteins that bind to specific antigens"]},
    {id:"vaccination",emoji:"💉",title:"Vaccination & Herd Immunity",summary:"Using vaccines to stimulate adaptive immunity without causing disease.",keyFacts:["Vaccine: contains weakened/dead pathogen or antigen fragments","Stimulates production of antibodies and memory cells","Herd immunity: enough people immune → pathogen can't spread","Herd immunity threshold varies by disease (measles ~95%, COVID ~70%)","Types: live attenuated, killed, subunit, mRNA vaccines","Booster shots: refresh memory cell populations over time"]},
  ],

  // ── VCE PHYSICS ──
  "Waves & Light": [
    {id:"wave-properties",emoji:"🌊",title:"Wave Properties",summary:"All waves share fundamental properties described by frequency, wavelength, amplitude and speed.",keyFacts:["Wave speed v = fλ (frequency × wavelength)","Frequency f: cycles per second (Hz)","Wavelength λ: distance between successive crests","Amplitude: maximum displacement from rest position","Transverse waves: displacement perpendicular to direction (light, water)","Longitudinal waves: displacement parallel to direction (sound)"],formula:"v = fλ  |  T = 1/f"},
    {id:"interference",emoji:"〰️",title:"Interference & Diffraction",summary:"Waves combine (interference) and spread around obstacles (diffraction).",keyFacts:["Constructive interference: waves add together (crest + crest)","Destructive interference: waves cancel (crest + trough)","Path difference: difference in distance each wave travels","Constructive: path difference = nλ (whole number of wavelengths)","Destructive: path difference = (n + ½)λ","Diffraction: maximum when gap width ≈ wavelength"],formula:"Constructive: Δd = nλ | Destructive: Δd = (n+½)λ"},
    {id:"photoelectric",emoji:"⚡",title:"Photoelectric Effect & Quantum Model",summary:"Light behaves as particles (photons) — evidence for quantum nature of light.",keyFacts:["Photon: packet of light energy, E = hf","Threshold frequency: minimum frequency to eject electrons","Increasing intensity: more electrons ejected (not faster ones)","Increasing frequency: electrons ejected with more kinetic energy","Einstein's equation: KE_max = hf - W (W = work function)","Wave-particle duality: light (and matter) exhibits both wave and particle behaviour"],formula:"E = hf  |  KE_max = hf - W"},
  ],
  "Modern Physics": [
    {id:"special-relativity",emoji:"⚡",title:"Special Relativity",summary:"Einstein's theory: the laws of physics are the same for all inertial observers, and the speed of light is constant.",keyFacts:["Time dilation: moving clocks run slow: t' = t/√(1-v²/c²)","Length contraction: moving objects are shorter: L' = L√(1-v²/c²)","Mass-energy equivalence: E = mc²","Nothing can reach or exceed the speed of light","Relativistic effects are only significant at speeds close to c","Simultaneity: events simultaneous in one frame may not be in another"],formula:"E = mc²  |  t' = t/√(1-v²/c²)"},
    {id:"nuclear-physics",emoji:"☢️",title:"Nuclear Physics & Radioactivity",summary:"The nucleus can undergo decay, releasing particles and energy.",keyFacts:["Alpha (α): 2 protons + 2 neutrons — low penetration, stopped by paper","Beta (β): fast electron or positron — stopped by aluminium","Gamma (γ): high-energy photon — stopped by thick lead or concrete","Half-life: time for half the nuclei in a sample to decay","Nuclear fission: heavy nucleus splits → releases enormous energy","Nuclear fusion: light nuclei combine → releases even more energy (powers stars)"]},
  ],

  // ── VCE PSYCHOLOGY ──
  "States of Consciousness": [
    {id:"sleep-stages",emoji:"😴",title:"Sleep Stages & Architecture",summary:"Sleep progresses through NREM and REM stages in ~90 minute cycles.",keyFacts:["NREM Stage 1: light sleep, theta waves, easy to wake, hypnic jerks","NREM Stage 2: sleep spindles, K-complexes, harder to wake","NREM Stage 3 (SWS): delta waves, deep sleep, hardest to wake, growth hormone released","REM sleep: rapid eye movement, vivid dreams, brain as active as waking","Typical night: 4-6 cycles, REM increases in later cycles","Adults need 7-9 hours; teens need 8-10 hours"]},
    {id:"sleep-deprivation",emoji:"😵",title:"Sleep Deprivation Effects",summary:"Insufficient sleep impairs cognitive, physical and emotional functioning.",keyFacts:["Cognitive effects: impaired attention, memory consolidation, decision-making","Emotional effects: increased irritability, anxiety, emotional reactivity","Physical effects: weakened immune system, weight gain, cardiovascular risk","Microsleeps: involuntary 1-30 second lapses in attention — dangerous when driving","Total sleep deprivation: hallucinations after ~72 hours","Partial sleep deprivation: cumulative 'sleep debt' — can't be fully repaid quickly"]},
  ],
  "Research Methods": [
    {id:"experimental-design",emoji:"🔬",title:"Experimental Design",summary:"The structure of a study that allows researchers to investigate cause and effect.",keyFacts:["Independent variable (IV): what the researcher manipulates","Dependent variable (DV): what is measured","Controlled variables: everything kept constant to isolate IV","Experimental group: receives the treatment/intervention","Control group: does not receive treatment — used for comparison","Random allocation: participants randomly assigned to groups — reduces bias"],},
    {id:"data-analysis-psych",emoji:"📊",title:"Data Analysis & Validity",summary:"Evaluating research quality and interpreting statistical results.",keyFacts:["Mean, median, mode: measures of central tendency","Standard deviation: measure of spread around the mean","p-value < 0.05: results are statistically significant","Validity: does the study measure what it claims to measure?","Reliability: would the study produce same results if repeated?","Generalisation: can results be applied to the broader population?"]},
  ],

  // ── VCE LEGAL STUDIES ──
  "Civil Law": [
    {id:"tort-law",emoji:"⚖️",title:"Tort Law — Negligence",summary:"Civil wrongs where one party's carelessness causes harm to another.",keyFacts:["Elements of negligence: duty of care, breach, damage (causation + harm)","Duty of care: legal obligation to take reasonable care (e.g. doctor-patient)","Breach: failed to meet the standard of a reasonable person","Causation: breach must have caused the damage ('but for' test)","Remoteness: damage must be a foreseeable result of the breach","Remedies: compensatory damages (to restore plaintiff to original position)"]},
    {id:"dispute-resolution",emoji:"🤝",title:"Dispute Resolution Methods",summary:"Alternative methods to resolve civil disputes without going to court.",keyFacts:["Negotiation: parties discuss directly, no third party, cheapest","Mediation: neutral mediator helps parties reach agreement — non-binding","Conciliation: conciliator takes more active role, may suggest outcomes","Arbitration: arbitrator makes binding decision (like a private judge)","VCAT: Victorian Civil and Administrative Tribunal — quicker and cheaper than courts","Advantages of alternatives: faster, cheaper, less formal, preserves relationships"]},
  ],
  "Law Reform & Justice": [
    {id:"law-reform-process",emoji:"📜",title:"Law Reform",summary:"The process by which laws are changed to better reflect community values and needs.",keyFacts:["Reasons for reform: changing values, new technology, evidence of injustice","Parliament: can pass new legislation or amend existing laws","Courts: can develop common law through precedent (judge-made law)","Law Reform Commission: independent body that researches and recommends reforms","Royal Commissions: major investigations into serious systemic issues","Community groups, media and individual citizens can all advocate for reform"]},
    {id:"justice-principles",emoji:"🏛️",title:"Principles of Justice",summary:"The legal system should be fair, equitable and accessible to all.",keyFacts:["Fairness: impartial hearing, evidence tested, unbiased decision-maker","Equality: all treated equally before the law","Access: barriers to the legal system (cost, language, knowledge)","Legal aid: government-funded legal assistance for those who can't afford lawyers","Interpreting services: for those with limited English","Rule of law: everyone — including government — is subject to the law"]},
  ],

  // ── VCE HISTORY ──
  "Revolutionary Ideas & Leaders": [
    {id:"revolutionary-ideology",emoji:"💭",title:"Revolutionary Ideologies",summary:"The ideas and beliefs that motivated and justified revolutionary action.",keyFacts:["Liberalism: individual rights, limited government, rule of law","Republicanism: government based on popular sovereignty, not monarchy","Marxism/Socialism: class struggle, collective ownership, workers' revolution","Nationalism: self-determination, pride in national identity","Enlightenment: reason over tradition — challenged divine right of kings","Propaganda: revolutionary leaders used print, art and speeches to spread ideas"]},
    {id:"key-figures",emoji:"👤",title:"Key Revolutionary Leaders & Their Roles",summary:"Individuals who shaped the direction, success and character of revolutions.",keyFacts:["Leaders often emerge from educated middle class or military","Charisma and oratory: ability to inspire the masses","Competing factions: moderate vs radical revolutionaries","Role of women: often significant but frequently marginalised afterward","Leaders can be both products of revolution and drivers of its direction","Cult of personality: leaders use symbols and myths to consolidate power"]},
  ],
  "Outcomes & Significance": [
    {id:"short-long-term",emoji:"📅",title:"Short & Long-Term Outcomes",summary:"Evaluating what actually changed as a result of the revolution.",keyFacts:["Political change: new government structure, constitution, voting rights","Social change: class structure, gender roles, rights of minorities","Economic change: land ownership, industry, trade policies","Counter-revolution: attempts by conservative forces to reverse change","Short-term violence vs long-term stability — tensions between them","Did the revolution achieve its stated goals? For whom?"]},
    {id:"historiography",emoji:"📚",title:"Historiography & Historical Debate",summary:"How historians have interpreted and debated the causes and significance of revolutions.",keyFacts:["Historiography: the study of how history has been written and interpreted","Different historians emphasise: class struggle, individual leaders, ideology, economics","Revisionist historians: challenge the 'standard' interpretation with new evidence","Primary sources: documents, images, speeches from the time","Secondary sources: historians' interpretations written after the event","Evaluating sources: consider origin, purpose, value and limitation"]},
  ],

  // ── VCE ECONOMICS ──
  "Government Policy": [
    {id:"fiscal-policy",emoji:"🏛️",title:"Fiscal Policy",summary:"Government use of spending and taxation to influence economic activity.",keyFacts:["Expansionary: increase spending or cut taxes → stimulate AD","Contractionary: cut spending or raise taxes → reduce inflationary pressure","Budget deficit: spending > revenue (expansionary effect)","Budget surplus: revenue > spending (contractionary effect)","Automatic stabilisers: unemployment benefits, progressive tax — work without action","Fiscal policy is slower to implement than monetary policy (political process)"]},
    {id:"monetary-policy",emoji:"🏦",title:"Monetary Policy",summary:"Reserve Bank of Australia uses interest rates to manage inflation and growth.",keyFacts:["RBA sets the cash rate (interest rate target)","Lower cash rate: cheaper borrowing → more spending → AD increases","Higher cash rate: more expensive borrowing → less spending → inflation cools","Inflation target: RBA aims for 2-3% annual inflation","Transmission mechanism: cash rate → bank rates → borrowing/saving decisions → AD","Monetary policy is faster to implement than fiscal policy"]},
  ],
  "Labour Market": [
    {id:"unemployment",emoji:"👷",title:"Unemployment",summary:"People who are actively seeking work but cannot find it — a key macroeconomic indicator.",keyFacts:["Unemployment rate = unemployed / labour force × 100","Cyclical unemployment: caused by economic downturns (demand falls)","Structural unemployment: skills mismatch — jobs change, workers don't (or can't move)","Frictional unemployment: temporary — people between jobs","Natural rate of unemployment (NAIRU): unavoidable level in a healthy economy","Underemployment: working fewer hours than desired — also a problem"],formula:"Unemployment rate = (unemployed/labour force) × 100"},
    {id:"wages",emoji:"💼",title:"Wages & Wage Determination",summary:"How wages are set in Australia and what influences them.",keyFacts:["Fair Work Commission: sets national minimum wage annually","Enterprise bargaining: employers and employees negotiate agreements","Award wages: minimum pay rates set by industry","Inflation: real wages = nominal wages adjusted for inflation","Productivity: wages tend to rise with worker productivity","Skills and education: higher skills → higher wages in most labour markets"]},
  ],

  // ── VCE ACCOUNTING ──
  "Recording & Reporting": [
    {id:"double-entry",emoji:"📒",title:"Double-Entry Accounting",summary:"Every transaction affects at least two accounts — debits always equal credits.",keyFacts:["Accounting equation: Assets = Liabilities + Owner's Equity","Debit: left side of account — increases assets and expenses, decreases liabilities","Credit: right side — increases liabilities and equity, decreases assets","Every journal entry: debit(s) = credit(s) (must balance)","General journal: records all transactions chronologically","General ledger: individual accounts updated from journal entries"],formula:"Assets = Liabilities + Owner's Equity"},
    {id:"trial-balance",emoji:"✅",title:"Trial Balance & Error Detection",summary:"A list of all ledger accounts with their balances — checks arithmetic accuracy.",keyFacts:["Debit column total must equal credit column total","Trial balance only detects arithmetic errors — not all errors","Errors NOT detected: errors of omission (transaction not recorded at all)","Errors NOT detected: errors of commission (wrong account used)","Errors NOT detected: errors of principle (wrong type of account)","Suspense account: temporary account used while locating errors"]},
  ],
  "Financial Statements": [
    {id:"income-statement",emoji:"📈",title:"Income Statement",summary:"Shows revenue, expenses and profit for a specific accounting period.",keyFacts:["Revenue: income earned from normal business activities","COGS: Cost of Goods Sold = opening stock + purchases - closing stock","Gross Profit = Revenue - COGS","Net Profit = Gross Profit - Operating Expenses","Accrual basis: record revenue when earned, expenses when incurred","Non-cash expenses: depreciation reduces profit without cash outflow"],formula:"Gross Profit = Revenue - COGS | Net Profit = Gross Profit - Expenses"},
    {id:"balance-sheet",emoji:"⚖️",title:"Balance Sheet",summary:"Shows assets, liabilities and owner's equity at a specific point in time.",keyFacts:["Current assets: cash, receivables, inventory (converted to cash within 12 months)","Non-current assets: equipment, land, vehicles (held long-term)","Current liabilities: payables, short-term loans (due within 12 months)","Non-current liabilities: long-term loans, mortgages","Owner's equity: capital + profit - drawings","Must balance: Total Assets = Total Liabilities + Owner's Equity"]},
  ],

  // ── VCE BUSINESS MANAGEMENT ──
  "Human Resource Management": [
    {id:"motivation-theories",emoji:"⭐",title:"Motivation Theories",summary:"Theories explaining what motivates employees and how to improve performance.",keyFacts:["Maslow's hierarchy: physiological → safety → social → esteem → self-actualisation","Herzberg: hygiene factors (prevent dissatisfaction) vs motivators (drive satisfaction)","Locke's Goal Setting: specific, challenging goals improve performance","Pink's Self-Determination: autonomy, mastery, purpose drive intrinsic motivation","Taylor's Scientific Management: financial incentives motivate workers","Apply theories: different employees may respond to different motivators"]},
    {id:"employee-relations",emoji:"🤝",title:"Employee Relations & Workplace Disputes",summary:"Management of the relationship between employers and employees.",keyFacts:["Enterprise Bargaining Agreement (EBA): negotiated terms and conditions","Fair Work Commission: resolves workplace disputes, sets minimum wages","Industrial action: strikes, work bans, overtime bans — employee pressure tactics","Lockouts: employer prevents workers from working — employer pressure tactic","Grievance procedures: formal process for employees to raise complaints","Positive employee relations: reduces turnover, increases productivity"]},
  ],
  "Change Management": [
    {id:"lewin-force-field",emoji:"⚡",title:"Lewin's Force Field Analysis",summary:"A tool for analysing the forces driving and resisting change in an organisation.",keyFacts:["Driving forces: push for change (competition, technology, customer demand)","Restraining forces: resist change (employee resistance, cost, tradition)","If driving > restraining: change happens","Strategy: strengthen driving forces OR weaken restraining forces","Unfreeze → Change → Refreeze: Lewin's three-step change model","Large gap between current and desired state → more resistance"]},
    {id:"resistance-strategies",emoji:"🛡️",title:"Resistance to Change & Strategies",summary:"Why employees resist change and how managers can overcome resistance.",keyFacts:["Fear of the unknown: comfort with familiar routines","Loss of job security: fear of redundancy or role changes","Lack of communication: rumours fill information gaps","Strategies: communicate clearly and early, involve employees in planning","Training: build confidence with new skills and systems","Empathy: acknowledge concerns, provide support and incentives"]},
  ],

  // ── VCE SOFTWARE DEVELOPMENT ──
  "Programming Concepts": [
    {id:"data-structures-prog",emoji:"📦",title:"Data Types & Structures",summary:"The building blocks for storing and organising data in programs.",keyFacts:["Integer: whole numbers (e.g. 5, -3, 100)","Float/Real: decimal numbers (e.g. 3.14, -0.5)","String: text (e.g. 'hello', 'VCE 2025')","Boolean: True or False only","List/Array: ordered collection of items (e.g. [1, 2, 3])","Dictionary: key-value pairs (e.g. {'name': 'Veer', 'age': 17})"]},
    {id:"oop",emoji:"🔷",title:"Object-Oriented Programming",summary:"Programming paradigm that organises code into objects with attributes and methods.",keyFacts:["Class: blueprint/template for creating objects","Object: instance of a class with its own data","Attribute: data belonging to an object (e.g. name, age)","Method: function belonging to a class (behaviour of object)","Encapsulation: bundling data and methods, hiding internal details","Inheritance: child class inherits attributes/methods from parent class","Polymorphism: same method name, different behaviour in different classes"]},
    {id:"algorithms-prog",emoji:"🔄",title:"Algorithms & Control Structures",summary:"Step-by-step instructions that solve problems using sequence, selection and iteration.",keyFacts:["Sequence: instructions executed in order","Selection: IF/ELIF/ELSE — executes code based on condition","Iteration: FOR loops (known count) and WHILE loops (condition-based)","Pseudocode: informal language to describe algorithm logic","Trace table: manually tracking variable values through an algorithm","Nested structures: control structures inside other control structures"]},
  ],
  "Software Development Lifecycle": [
    {id:"testing",emoji:"🧪",title:"Testing Strategies",summary:"Systematic methods to find and fix errors before software is released.",keyFacts:["Syntax errors: incorrect code structure (caught by compiler/interpreter)","Logic errors: code runs but gives wrong output (hardest to find)","Runtime errors: crash during execution (e.g. division by zero)","Black-box testing: tests functionality without knowing internal code","White-box testing: tests internal logic with knowledge of code","Unit testing: tests individual components in isolation","Integration testing: tests how components work together","User acceptance testing (UAT): end users test in real conditions"]},
  ],

  // ── VCE MEDIA ──
  "Media Codes & Conventions": [
    {id:"technical-codes",emoji:"🎬",title:"Technical Codes",summary:"The technical choices that create meaning in media texts.",keyFacts:["Camera angles: low angle (powerful), high angle (vulnerable), eye-level (neutral)","Camera shots: extreme close-up (emotion), wide shot (context), mid shot (relationship)","Lighting: high-key (positive/happy), low-key (dark/sinister), backlighting (mystery)","Editing: cut, fade, dissolve — control pacing and mood","Sound: diegetic (within the story world) vs non-diegetic (soundtrack, voiceover)","Mise-en-scène: everything visible in the frame — setting, costume, props, expression"]},
    {id:"narrative-codes",emoji:"📖",title:"Narrative Codes & Genre",summary:"How stories are constructed and how genre shapes audience expectations.",keyFacts:["Narrative structure: Equilibrium → Disruption → Resolution (Todorov)","Character types: hero, villain, helper, mentor (Propp's character functions)","Genre: set of conventions audiences recognise and expect","Genre codes: iconography, settings, character types, narrative patterns","Hybridisation: combining elements of different genres","Subverting conventions: deliberately breaking genre expectations for effect"]},
  ],

  // ── VCE DRAMA ──
  "Drama Elements & Techniques": [
    {id:"elements-drama",emoji:"🎭",title:"Elements of Drama",summary:"The building blocks that all drama uses to create meaning and engage audiences.",keyFacts:["Role & Character: who the performer is being — layered, believable characterisation","Relationships: how characters relate to each other — power, conflict, intimacy","Tension: what drives drama — conflict, mystery, surprise, dilemma","Focus: where the audience's attention is directed","Space: how performers use the performance area — proxemics, levels, staging","Time: pace, rhythm, duration — slowing down or speeding up time in performance","Language: what is said and how (subtext is often more important than text)"]},
    {id:"voice-movement",emoji:"🎤",title:"Voice & Movement",summary:"The performer's primary instruments for creating and communicating character.",keyFacts:["Voice: volume, pitch, pace, tone, articulation, accent, rhythm","Projection: making voice heard without shouting","Physicality: posture, gesture, facial expression, gait","Status: how body language conveys power relationships","Stillness: can be more powerful than constant movement","Eye contact: direct, averted, shared — each communicates differently"]},
  ],

  // ── VCE MUSIC ──
  "Music Theory & Notation": [
    {id:"pitch-scales",emoji:"🎵",title:"Pitch, Scales & Keys",summary:"The fundamental building blocks of melody and harmony in Western music.",keyFacts:["Major scale: whole, whole, half, whole, whole, whole, half pattern (W W H W W W H)","Natural minor scale: W H W W H W W pattern","Key signature: sharps or flats at start of staff — indicates the key","Intervals: distance between two pitches (unison, 2nd, 3rd...octave)","Chromatic scale: all 12 semitones","Relative major/minor: share same key signature (e.g. C major and A minor)"]},
    {id:"rhythm-metre",emoji:"🥁",title:"Rhythm, Metre & Notation",summary:"How music is organised in time — beat, rhythm patterns and time signatures.",keyFacts:["Beat: steady pulse underlying music","Tempo: speed of the beat (BPM = beats per minute)","Time signature: top = beats per bar, bottom = beat note value","4/4: four crotchet beats per bar (most common)","3/4: three crotchet beats (waltz feel)","Syncopation: emphasis on off-beats — creates rhythmic interest","Note values: semibreve (4), minim (2), crotchet (1), quaver (½), semiquaver (¼)"]},
    {id:"music-analysis",emoji:"🎼",title:"Analysing Music — SHMRG",summary:"A framework for analysing and describing music systematically.",keyFacts:["S — Sound: instrumentation, timbre, texture (monophonic, homophonic, polyphonic)","H — Harmony: chords, key, major/minor, dissonance/consonance, modulation","M — Melody: shape, range, intervals, sequence, conjunct/disjunct motion","R — Rhythm: tempo, metre, syncopation, rhythmic patterns","G — Growth/Structure: form (binary AB, ternary ABA, rondo, sonata), dynamics, development","Use SHMRG as a framework for written analysis responses"]},
  ],

  // ── VCE VISUAL COMMUNICATION DESIGN ──
  "Design Process": [
    {id:"design-elements",emoji:"🎨",title:"Elements & Principles of Design",summary:"The fundamental visual tools and organising principles used in all design.",keyFacts:["Elements: line, shape, form, colour, texture, tone, space","Principles: balance, contrast, emphasis/focal point, pattern, repetition, unity, movement","Colour theory: hue, saturation, value; colour wheel relationships","Typography: typeface, font weight, tracking, leading, kerning","Visual hierarchy: arrangement that guides viewer through design","Gestalt principles: proximity, similarity, closure, figure-ground"]},
    {id:"design-methods",emoji:"📐",title:"Design Methods & Drawing Techniques",summary:"Systematic processes and technical drawing skills used in design.",keyFacts:["Freehand drawing: quick idea generation, thumbnails, sketches","Instrumental drawing: precise technical drawings using tools","CAD: computer-aided design — accuracy and easy editing","Orthographic projection: front, top, side views on 2D surface","Isometric drawing: 3D representation — no vanishing points","Rendering: adding tone, texture and colour to communicate materials"]},
  ],

  // ── VCE FOOD STUDIES ──
  "Food Safety & Hygiene": [
    {id:"food-hazards",emoji:"⚠️",title:"Food Hazards & HACCP",summary:"Identifying and controlling hazards to ensure food is safe to eat.",keyFacts:["Biological hazards: bacteria, viruses, parasites (most common cause of illness)","Chemical hazards: pesticides, cleaning agents, food additives","Physical hazards: glass, metal, bone, pits","HACCP: Hazard Analysis Critical Control Points — systematic food safety system","Critical control points: steps where hazards must be controlled","Temperature danger zone: 5°C – 60°C — bacteria multiply rapidly","2-hour/4-hour rule: discard if in danger zone >4 hours total"]},
    {id:"pathogens",emoji:"🦠",title:"Food-Borne Illness & Pathogens",summary:"Micro-organisms that cause illness through contaminated food.",keyFacts:["Salmonella: raw poultry, eggs — causes gastroenteritis 6-72 hours after consumption","Campylobacter: undercooked chicken — most common food-borne illness in Australia","Staphylococcus aureus: food handlers with skin infections — toxin not destroyed by heat","E. coli: undercooked beef, unpasteurised juice — can cause serious kidney damage","Prevent: cook to correct temperature, separate raw/cooked, chill promptly, clean hands"]},
  ],

  // ── VCE OUTDOOR ED ──
  "Personal & Social Development": [
    {id:"risk-management",emoji:"⛰️",title:"Risk Management in Outdoor Education",summary:"Identifying, assessing and managing risks in outdoor environments.",keyFacts:["Hazard: something that could cause harm (wet rocks, weather change)","Risk: likelihood and consequence of harm occurring","Risk assessment: identify hazard → assess likelihood → assess consequence → control","Hierarchy of controls: eliminate → substitute → isolate → engineering → administrative → PPE","Dynamic risk management: ongoing assessment as conditions change","Safety vs challenge: managed risk is educational — aim for 'stretch zone' not 'panic zone'"]},
    {id:"leadership",emoji:"👥",title:"Leadership & Group Dynamics",summary:"How leadership and group cohesion affect outcomes in outdoor experiences.",keyFacts:["Autocratic leadership: leader decides — best in emergencies","Democratic leadership: group input — builds ownership and morale","Laissez-faire: minimal direction — works with highly skilled, motivated groups","Tuckman's stages: Forming → Storming → Norming → Performing → Adjourning","Cohesion: task cohesion (shared goal) and social cohesion (relationships)","Communication: clear, assertive, respectful — essential for group safety"]},
  ],

  // ── VCE PE ──
  "Energy Systems & Fatigue": [
    {id:"energy-systems-pe",emoji:"⚡",title:"Three Energy Systems",summary:"The body uses three energy systems to produce ATP — the fuel for all muscle activity.",keyFacts:["ATP-PC (phosphocreatine): 0-10 seconds, explosive power (sprint start, weightlifting), no oxygen, no lactate","Anaerobic glycolysis (lactic acid): 10 seconds-2 minutes, high intensity, produces lactate causing burning sensation","Aerobic system: 2+ minutes, low-moderate intensity, uses oxygen, CO₂ and H₂O as by-products, most ATP produced","Energy system interplay: all three operate simultaneously, one dominates based on intensity","Oxygen uptake: VO₂ max is maximum oxygen body can use — key indicator of aerobic fitness"],formula:"ATP → ADP + Pi + energy (muscle contraction)"},
    {id:"fatigue-recovery",emoji:"😓",title:"Fatigue & Recovery",summary:"Why muscles fatigue and how the body recovers after exercise.",keyFacts:["Peripheral fatigue: at the muscle — lactate accumulation, fuel depletion, ion imbalance","Central fatigue: in the brain — reduced neural drive to muscles","EPOC (excess post-exercise oxygen consumption): elevated oxygen use after exercise to restore body","Active recovery: light exercise post-training — clears lactate faster than rest","Nutrition: carbohydrates restore glycogen, protein repairs muscle","Sleep: primary time for muscle repair and adaptation (growth hormone released)"]},
  ],
  "Cardiovascular & Respiratory Adaptations": [
    {id:"acute-responses",emoji:"❤️",title:"Acute Responses to Exercise",summary:"Immediate, short-term changes in heart, lungs and blood during exercise.",keyFacts:["Heart rate: increases from ~70 bpm rest to 200+ bpm max exercise","Stroke volume: increases — more blood pumped per beat","Cardiac output = HR × SV: increases to deliver more O₂ to muscles","Breathing rate: increases from ~15 to 50+ breaths/min","Tidal volume: volume of air per breath increases","Blood redistribution: vasoconstriction diverts blood to working muscles"],formula:"Cardiac output = heart rate × stroke volume"},
    {id:"chronic-adaptations",emoji:"💪",title:"Chronic Training Adaptations",summary:"Long-term structural and functional changes from regular training.",keyFacts:["Cardiac hypertrophy: heart wall thickens — more powerful contractions","Increased stroke volume: at rest and during exercise","Lower resting heart rate: trained athletes 40-60 bpm (more efficient)","Increased VO₂ max: more oxygen delivered and used by muscles","Increased mitochondrial density: more ATP produced aerobically","Increased blood volume and haemoglobin: more oxygen-carrying capacity"]},
  ],

  // ── VCE HEALTH & HUMAN DEVELOPMENT ──
  "Health & Wellbeing": [
    {id:"dimensions-health",emoji:"💚",title:"Dimensions of Health & Wellbeing",summary:"Health is multidimensional — physical, social, emotional, mental and spiritual.",keyFacts:["Physical: body functioning well, fitness, disease-free","Social: quality relationships, sense of belonging, social support","Emotional: manage feelings, resilience, positive self-concept","Mental: positive thinking, effective cognitive functioning, self-esteem","Spiritual: sense of meaning, purpose and connection (may or may not involve religion)","Dimensions are interconnected — a change in one affects others"]},
    {id:"social-determinants",emoji:"🌍",title:"Social Determinants of Health",summary:"Social, economic and environmental factors that significantly influence health outcomes.",keyFacts:["Income and social status: strong predictor of health — higher income = better health","Education: higher education links to better health literacy and outcomes","Social support networks: isolation linked to poorer mental and physical health","Employment and working conditions: job security, safe conditions matter","Access to healthcare: cost, location, cultural appropriateness","Early life experiences: ACEs (adverse childhood experiences) have lifelong impact"]},
  ],

  // ── IB SUBJECTS ──
  "Core Approaches (IB Biology)": [
    {id:"ib-bio-core",emoji:"🔬",title:"IB Biology Core Concepts",summary:"Key themes that run through all areas of IB Biology.",keyFacts:["Cell theory: all living things are made of cells, cells come from existing cells","Metabolism: sum of all chemical reactions in an organism","Heredity: passing of genetic information from parents to offspring","Evolution: change in heritable characteristics of populations over time","Ecology: study of organisms and their interactions with the environment","Structure and function: form is correlated with function at all levels of organisation"]},
  ],
  "Paper 1 — Source Analysis": [
    {id:"source-analysis",emoji:"📄",title:"IB History Source Analysis Skills",summary:"Evaluating historical sources for their value and limitations.",keyFacts:["OPVL: Origin, Purpose, Value, Limitation","Origin: who created it, when, where — affects reliability","Purpose: why was it created — intended audience affects content","Value: what useful information does it provide for the investigation","Limitation: what does it NOT tell us, bias, incompleteness","Compare and contrast sources: identify agreements, contradictions, gaps","Primary vs secondary: both have value and limitations for historians"]},
  ],
  "Theory of Knowledge (TOK)": [
    {id:"tok-knowledge",emoji:"🤔",title:"Knowledge & The Knower",summary:"Exploring what knowledge is, how we know things, and our role as knowers.",keyFacts:["Knowledge: justified true belief (but challenged by Gettier problems)","Personal knowledge: based on individual experience and intuition","Shared knowledge: accumulated by communities over time","Ways of knowing: reason, emotion, language, sense perception, intuition, memory, imagination, faith","Areas of knowledge: natural sciences, human sciences, history, arts, mathematics, ethics","Knowledge question: open, contestable question about the nature of knowledge itself"]},
    {id:"tok-exhibition",emoji:"🖼️",title:"TOK Exhibition",summary:"Connecting three objects to a prescribed TOK prompt — worth 33% of final grade.",keyFacts:["Choose one prompt from the IB prescribed list (released annually)","Select 3 objects (physical or digital) that connect to the prompt","Write ~950 words total — approximately 300 words per object","Explain HOW each object connects to the prompt (not just that it does)","Objects should connect to different aspects of the prompt","Real-world connection: objects must be from the real world, not hypothetical","Submit evidence of each object with the written component"]},
  ],
  "CAS (Creativity, Activity, Service)": [
    {id:"cas-requirements",emoji:"🌟",title:"CAS Requirements & Learning Outcomes",summary:"CAS must be completed over the two IB years — it is pass/fail but essential.",keyFacts:["Creativity: arts, design, music, theatre, creative writing, coding — anything creative","Activity: physical exercise — sport, dance, gym, hiking, martial arts","Service: unpaid contribution to community — volunteering, tutoring, environmental projects","CAS project: at least one collaborative project combining two or three strands","7 learning outcomes must be evidenced across all CAS activities","Reflections: meaningful written reflections required — not just descriptions of activities"]},
  ],
};


// ─────────────────────────────────────────────
// SUBTOPIC BOOKMARKS COMPONENT
// ─────────────────────────────────────────────
function SubtopicBookmarks({ selTopic, subject, curriculum, staticSubtopics, gs }) {
  const [aiSubtopics, setAiSubtopics] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [quizStates, setQuizStates] = useState({});
  const [deepNotes, setDeepNotes] = useState({});   // {subtopicId: {loading, content}}
  const color = getColor(subject);

  useEffect(() => {
    if (!staticSubtopics) generateAISubtopics();
  }, [selTopic]);

  const generateAISubtopics = async () => {
    const cacheKey = `ss_subtopics_${subject}_${selTopic}`.replace(/\s+/g,"_");
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setAiSubtopics(JSON.parse(cached)); return; }
    } catch {}
    setLoadingAI(true);
    try {
      const subjData = VCAA_CURRICULUM[subject];
      const area = subjData?.areas?.find(a => a.name === selTopic);
      const dotPoints = area?.dotPoints?.join("\n• ") || selTopic;
      const prompt = `Generate 5-7 subtopic study cards for "${selTopic}" in ${curriculum} ${subject}.

Official curriculum dot points:
• ${dotPoints}

For each subtopic return a study card. ONLY return valid JSON, no markdown:
[{
  "id": "short-id",
  "emoji": "single emoji",
  "title": "Specific Subtopic Name",
  "summary": "One clear sentence explanation",
  "keyFacts": ["fact 1 with detail", "fact 2 with detail", "fact 3", "fact 4", "fact 5"],
  "formula": "key formula in plain text or null"
}]

Write ALL maths in plain text — use ², √, ×, ÷, π — NEVER LaTeX.`;
      const raw = await callGemini(prompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
      setAiSubtopics(parsed);
    } catch { setAiSubtopics([]); }
    setLoadingAI(false);
  };

  const subtopics = staticSubtopics || aiSubtopics || [];

  const loadMiniQuiz = async (sub) => {
    const key = sub.id;
    if (quizStates[key]?.questions) { setQuizStates(s=>({...s,[key]:{...s[key],showQuiz:!s[key]?.showQuiz}})); return; }
    setQuizStates(s=>({...s,[key]:{loading:true,showQuiz:true}}));
    try {
      const prompt = `Generate 3 exam-style multiple choice questions about "${sub.title}" for ${curriculum} ${subject}.

Key content:
${sub.keyFacts.map(f=>`• ${f}`).join("\n")}

Write ALL maths in plain text — NO LaTeX. Return ONLY valid JSON:
[{"question":"...","options":["A...","B...","C...","D..."],"correct":0,"explanation":"..."}]`;
      const raw = await callGemini(prompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setQuizStates(s=>({...s,[key]:{loading:false,showQuiz:true,questions:parsed,qi:0,sel:null,answered:false,score:0,done:false,results:[]}}));
    } catch {
      setQuizStates(s=>({...s,[key]:{loading:false,showQuiz:false}}));
    }
  };

  const loadDeeperNotes = async (sub) => {
    const key = sub.id;
    // Toggle off if already showing
    if (deepNotes[key]?.content) {
      setDeepNotes(d => ({...d, [key]: {...d[key], visible: !d[key]?.visible}}));
      return;
    }
    setDeepNotes(d => ({...d, [key]: {loading: true, visible: true}}));
    try {
      const cacheKey = `ss_deep_${subject}_${selTopic}_${key}`.replace(/\s+/g,"_");
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setDeepNotes(d=>({...d,[key]:{loading:false,visible:true,content:cached}})); return; }

      const prompt = `You are an expert ${curriculum} tutor. Write comprehensive study notes for "${sub.title}" in ${curriculum} ${subject}.

Key content to cover:
${sub.keyFacts.map(f=>`• ${f}`).join('\n')}
${sub.formula ? `Key formula: ${sub.formula}` : ''}

Write detailed, exam-focused notes including:
## Key Concepts
[explain each concept clearly with examples]

## Worked Examples
[show step-by-step examples using this content]

## Common Mistakes to Avoid
[list 3-4 mistakes students make]

## Exam Tips
[specific tips for ${curriculum} assessment]

Write all maths in plain text — use ², √, ×, ÷, π — NEVER LaTeX. Use ## headings, **bold** key terms, - bullet points.`;

      const content = await callGemini(prompt);
      localStorage.setItem(cacheKey, content);
      setDeepNotes(d => ({...d, [key]: {loading: false, visible: true, content}}));
    } catch {
      setDeepNotes(d => ({...d, [key]: {loading: false, visible: true, content: "⚠️ Couldn't generate notes. Try again."}}));
    }
  };

  const quizChoose = (subId, optIdx) => {
    const qs = quizStates[subId];
    if (!qs||qs.answered) return;
    const correct = qs.questions[qs.qi].correct;
    const isCorrect = optIdx === correct;
    setQuizStates(s=>({...s,[subId]:{...s[subId],sel:optIdx,answered:true,score:qs.score+(isCorrect?1:0),results:[...qs.results,{ok:isCorrect}]}}));
  };

  const quizNext = (subId) => {
    const qs = quizStates[subId];
    if (!qs) return;
    if (qs.qi < qs.questions.length-1) {
      setQuizStates(s=>({...s,[subId]:{...s[subId],qi:qs.qi+1,sel:null,answered:false}}));
    } else {
      if (gs) gs.addXP(qs.score*30, `${subId} mini quiz`);
      setQuizStates(s=>({...s,[subId]:{...s[subId],done:true}}));
    }
  };

  if (loadingAI) return (
    <div style={{textAlign:"center",padding:"32px",color:"#6060a0"}}>
      <div style={{fontSize:24,marginBottom:8}}>✨</div>
      <div style={{fontSize:14,fontWeight:600}}>Generating subtopics from VCAA curriculum...</div>
      <div style={{fontSize:11,marginTop:4,color:"#40406a"}}>Saved after first load — instant next time</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>{[0,.15,.3].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}</div>
    </div>
  );

  if (subtopics.length === 0 && !loadingAI) return null;

  return (
    <div>
      <div style={{fontWeight:800,fontSize:13,color:"#50508a",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
        {staticSubtopics ? "📚 Key Subtopics" : "✨ Subtopics (AI-generated from curriculum)"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {subtopics.map((sub,i) => {
          const isOpen = expandedId === sub.id;
          const qs = quizStates[sub.id];
          return (
            <div key={sub.id||i} style={{background:"var(--bg2)",border:`1px solid ${isOpen?color+"66":"var(--border)"}`,borderRadius:14,overflow:"hidden",transition:"border-color .2s"}}>
              {/* Header */}
              <div style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}
                onClick={()=>setExpandedId(isOpen?null:sub.id)}>
                <div style={{width:40,height:40,borderRadius:10,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {sub.emoji}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{sub.title}</div>
                  <div style={{fontSize:12,color:"#6060a0",marginTop:2,lineHeight:1.4}}>{sub.summary}</div>
                </div>
                <div style={{color:"#50508a",fontSize:12,transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div style={{borderTop:"1px solid var(--border)"}}>
                  {/* Formula */}
                  {sub.formula && (
                    <div style={{margin:"14px 18px 0",background:`${color}10`,border:`1px solid ${color}30`,borderRadius:10,padding:"10px 14px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:color,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Key Formula / Rule</div>
                      <div style={{fontFamily:"monospace",fontSize:14,color:"var(--text)",fontWeight:600}}>{cleanMath(sub.formula)}</div>
                    </div>
                  )}

                  {/* Key facts */}
                  <div style={{padding:"14px 18px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#50508a",marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Key Facts</div>
                    {sub.keyFacts.map((fact,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                        <span style={{color:color,fontSize:13,flexShrink:0,marginTop:1}}>•</span>
                        <span style={{fontSize:13,color:"#c0c0d8",lineHeight:1.6}}>{cleanMath(fact)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quiz mode */}
                  {qs?.showQuiz && (
                    <div style={{margin:"0 18px 18px",background:"var(--bg3)",borderRadius:10,padding:"14px"}}>
                      {qs.loading ? (
                        <div style={{textAlign:"center",color:"#6060a0",fontSize:13,padding:"12px 0"}}>Generating questions... ✨</div>
                      ) : qs.done ? (
                        <div style={{textAlign:"center",padding:"12px 0"}}>
                          <div style={{fontSize:36,fontWeight:900,color:qs.score===3?"var(--a2)":qs.score>=2?"var(--gold)":"var(--a3)"}}>{qs.score}/{qs.questions?.length}</div>
                          <div style={{fontSize:12,color:"#7070a8",marginBottom:8}}>+{qs.score*30} XP</div>
                          <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:10}}>
                            {qs.results.map((r,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:r.ok?"var(--a2)":"var(--a3)"}}/>)}
                          </div>
                          <button className="btn btn-g btn-sm" onClick={()=>setQuizStates(s=>({...s,[sub.id]:{...s[sub.id],done:false,qi:0,sel:null,answered:false,score:0,results:[]}}))} >Try Again</button>
                        </div>
                      ) : qs.questions ? (
                        <div>
                          <div style={{fontSize:11,color:"#50508a",marginBottom:8,fontWeight:700}}>Q{qs.qi+1} of {qs.questions.length}</div>
                          <div style={{fontWeight:700,fontSize:14,lineHeight:1.5,marginBottom:12,color:"var(--text)"}}>{cleanMath(qs.questions[qs.qi]?.question)}</div>
                          {qs.questions[qs.qi]?.options?.map((opt,j)=>{
                            const isCorrect = j===qs.questions[qs.qi].correct;
                            const isSel = j===qs.sel;
                            let bg="var(--bg2)",border="1px solid var(--border)",clr="var(--text)";
                            if(qs.answered&&isCorrect){bg="rgba(92,224,198,.15)";border="1px solid var(--a2)";clr="var(--a2)";}
                            else if(qs.answered&&isSel){bg="rgba(255,107,107,.15)";border="1px solid var(--a3)";clr="var(--a3)";}
                            return(
                              <div key={j} onClick={()=>quizChoose(sub.id,j)}
                                style={{padding:"9px 12px",borderRadius:8,marginBottom:6,cursor:qs.answered?"default":"pointer",background:bg,border,color:clr,fontSize:13,transition:"all .15s"}}>
                                <strong>{String.fromCharCode(65+j)}.</strong> {cleanMath(opt)}
                                {qs.answered&&isCorrect&&<span style={{float:"right"}}>✓</span>}
                                {qs.answered&&isSel&&!isCorrect&&<span style={{float:"right"}}>✗</span>}
                              </div>
                            );
                          })}
                          {qs.answered&&(
                            <>
                              <div style={{background:"rgba(92,224,198,.08)",border:"1px solid rgba(92,224,198,.15)",borderRadius:8,padding:"9px 12px",marginTop:8,fontSize:12,color:"#9090c0"}}>
                                💡 {cleanMath(qs.questions[qs.qi]?.explanation)}
                              </div>
                              <button className="btn btn-p btn-sm" style={{marginTop:10}} onClick={()=>quizNext(sub.id)}>
                                {qs.qi<qs.questions.length-1?"Next →":"Finish"}
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Deep notes panel */}
                  {deepNotes[sub.id]?.visible && (
                    <div style={{margin:"0 18px 14px",background:"var(--bg3)",borderRadius:10,padding:"16px"}}>
                      {deepNotes[sub.id]?.loading ? (
                        <div style={{textAlign:"center",padding:"20px 0",color:"#6060a0"}}>
                          <div style={{fontSize:20,marginBottom:6}}>✨</div>
                          <div style={{fontSize:13}}>Generating deep notes for {sub.title}...</div>
                          <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:8}}>{[0,.15,.3].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                            <div style={{fontSize:12,fontWeight:700,color:color,textTransform:"uppercase",letterSpacing:".06em"}}>📖 Deep Study Notes — {sub.title}</div>
                            <button onClick={()=>setDeepNotes(d=>({...d,[sub.id]:{...d[sub.id],visible:false}}))} style={{background:"none",border:"none",color:"#50508a",cursor:"pointer",fontSize:14}}>✕</button>
                          </div>
                          <MarkdownRenderer content={deepNotes[sub.id]?.content||""}/>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{padding:"0 18px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button className="btn btn-sm" style={{background:color,color:"#fff",border:"none"}} onClick={()=>loadMiniQuiz(sub)}>
                      {qs?.showQuiz?"✕ Hide Quiz":"🎯 Practice Questions"}
                    </button>
                    <button className="btn btn-s btn-sm" onClick={()=>loadDeeperNotes(sub)}>
                      {deepNotes[sub.id]?.visible?"✕ Hide Notes":"🔍 Dive Deeper"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function SubjectsScreen({ profile, gs }) {
  const [sel, setSel] = useState(null);           // selected subject
  const [selTopic, setSelTopic] = useState(null); // selected topic area
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | study | quiz | flashcards | notes
  const [content, setContent] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  // "What are you studying right now?"
  const [currentTopic, setCurrentTopic] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ss_currentTopics")||"{}"); } catch { return {}; }
  });
  const [userNotes, setUserNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ss_userNotes")||"{}"); } catch { return {}; }
  });
  const [editingTopic, setEditingTopic] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const subjs = (Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]);
  const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label||"Year 9";

  const saveCurrentTopic = (subject, topic) => {
    const updated = { ...currentTopic, [subject]: topic };
    setCurrentTopic(updated);
    localStorage.setItem("ss_currentTopics", JSON.stringify(updated));
    setEditingTopic(false);
  };

  const saveUserNotes = (subject, notes) => {
    const updated = { ...userNotes, [subject]: notes };
    setUserNotes(updated);
    localStorage.setItem("ss_userNotes", JSON.stringify(updated));
    setEditingNotes(false);
  };

  const loadTopics = async (subject) => {
    setSel(subject); setTopicsLoading(true); setTopics([]); setSelTopic(null); setActiveTab("overview"); setContent("");
    const subjData = VCAA_CURRICULUM[subject];
    if (subjData) {
      setTopics(subjData.areas.map(a => a.name));
      setTopicsLoading(false);
      return;
    }
    try {
      const prompt = `List exactly 6 topic areas for ${subject} in the ${curriculum} Australian curriculum. Return ONLY a JSON array of strings, no markdown: ["topic1","topic2",...]`;
      const raw = await callGemini(prompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setTopics(Array.isArray(parsed) ? parsed : ["Core Concepts","Key Skills","Assessment Prep","Exam Preparation"]);
    } catch { setTopics(["Core Concepts","Key Skills","Assessment Prep","Exam Preparation"]); }
    setTopicsLoading(false);
  };

  const generateContent = async (type) => {
    setContentLoading(true); setContent(""); setActiveTab(type);
    const topic = selTopic || currentTopic[sel] || "";
    const notes = userNotes[sel] || "";
    const ctx = getCurriculumContext(sel, topic, notes, profile.yearLevel);

    const prompts = {
      study: `You are an expert ${curriculum} tutor. Using ONLY the following official curriculum content, write comprehensive study notes.

${ctx}

Write detailed, exam-focused study notes covering:
1. Key definitions and concepts (bold them using **bold**)
2. Important formulas or rules (write them in plain text — use × for multiply, ÷ for divide, ² for squared, √ for square root, NOT LaTeX)
3. Common exam question types and how to answer them
4. Worked examples where relevant
5. Key things examiners look for
6. Common student mistakes to avoid

IMPORTANT FORMATTING RULES:
- Use ## for section headings, ### for subheadings
- Use bullet points with - for lists
- Write all maths in plain readable text: use ², ³, √, ×, ÷, ≤, ≥, π, Δ — NOT LaTeX ($...$) 
- Bold key terms with **term**
- Be specific to the ${curriculum} course, not generic`,

      quiz: `Generate 5 ${curriculum} exam-style questions based on:
${ctx}
IMPORTANT: Write ALL maths in plain text — use ², ³, √, ×, ÷, π — NEVER use LaTeX ($...$).
Return ONLY valid JSON array, no markdown:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"...","marks":2}]`,

      flashcards: `Generate 8 spaced-repetition flashcards based on:
${ctx}
IMPORTANT: Write ALL maths in plain text — use ², ³, √, ×, ÷, π — NEVER use LaTeX ($...$).
Return ONLY valid JSON array, no markdown:
[{"q":"...","a":"..."}]`,

      notes: `Based on this curriculum content:
${ctx}

Create a concise dot-point revision summary perfect for last-minute exam study. Include:
• All key terms and definitions
• Important formulas/rules (write in plain text — use ², √, ×, ÷, π, Δ — NOT LaTeX)
• Key cause-effect relationships
• Common exam traps to avoid

FORMATTING: Use ## headings, - bullet points, **bold** for key terms. NO LaTeX or $ symbols.
Keep it punchy and exam-focused.`
    };

    try {
      const raw = await callGemini(prompts[type]);
      if (type === "quiz" || type === "flashcards") {
        const clean = raw.replace(/```json|```/g,"").trim();
        setContent(JSON.stringify(JSON.parse(clean)));
      } else {
        setContent(raw);
      }
    } catch(e) {
      setContent("⚠️ Error generating content. Try again.");
    }
    setContentLoading(false);
  };

  // ── TOPIC STUDY VIEW — with subtopic bookmarks ──
  if (sel && selTopic) {
    const color = getColor(sel);
    const subjData = VCAA_CURRICULUM[sel];
    const topicArea = subjData?.areas?.find(a => a.name === selTopic);
    const staticSubtopics = SUBTOPICS[selTopic] || null;

    const parsedContent = (() => {
      if (!content) return null;
      try { return JSON.parse(content); } catch { return null; }
    })();

    return (
      <div className="content fade-up">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <button className="btn btn-g btn-sm" onClick={()=>{setSelTopic(null);setContent("");setActiveTab("overview");}}>← Back</button>
          <div style={{width:3,height:24,background:color,borderRadius:2}}/>
          <div>
            <div style={{fontWeight:900,fontSize:18}}>{selTopic}</div>
            <div style={{fontSize:12,color:"#6060a0"}}>{sel} · {curriculum}</div>
          </div>
        </div>

        {/* Official VCAA dot points */}
        {topicArea?.dotPoints && (
          <div style={{background:"rgba(124,106,247,.06)",border:"1px solid rgba(124,106,247,.15)",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--accent)",marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>📋 Official VCAA Curriculum</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {topicArea.dotPoints.map((dp,i)=>(
                <span key={i} style={{fontSize:11,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:20,padding:"3px 10px",color:"#9090c0"}}>{dp.slice(0,50)}{dp.length>50?"...":""}</span>
              ))}
            </div>
          </div>
        )}

        {/* Generate full content buttons */}
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {[
            {id:"study",label:"📖 Full Study Notes"},
            {id:"quiz",label:"🎯 Full Quiz (5 Qs)"},
            {id:"flashcards",label:"🃏 Flashcard Deck"},
            {id:"notes",label:"📋 Quick Summary"},
          ].map(t=>(
            <button key={t.id} className="btn btn-sm"
              style={{background:activeTab===t.id?color:"var(--bg3)",color:activeTab===t.id?"#fff":"#7070a8",border:`1px solid ${activeTab===t.id?color:"var(--border)"}`}}
              onClick={()=>generateContent(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Generated content */}
        {contentLoading ? (
          <div className="card" style={{textAlign:"center",padding:"40px",marginBottom:20}}>
            <div style={{fontSize:28,marginBottom:10}}>✨</div>
            <div style={{fontWeight:700,marginBottom:6}}>Generating {activeTab} for {selTopic}...</div>
            <div style={{color:"#6060a0",fontSize:13,marginBottom:16}}>Using official {curriculum} curriculum</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>{[0,.2,.4].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}</div>
          </div>
        ) : content ? (
          <div style={{marginBottom:20}}>
            {(activeTab==="study"||activeTab==="notes") && !parsedContent && (
              <div className="card">
                <div className="ch"><div className="ct">{activeTab==="study"?"📖 Study Notes":"📋 Revision Summary"} — {selTopic}</div><span className="tag tag-a">{curriculum}</span></div>
                <div className="cb"><MarkdownRenderer content={content}/></div>
              </div>
            )}
            {activeTab==="quiz" && parsedContent && Array.isArray(parsedContent) && <InlineQuiz questions={parsedContent} subject={sel} gs={gs}/>}
            {activeTab==="flashcards" && parsedContent && Array.isArray(parsedContent) && <InlineFlashcards cards={parsedContent} subject={sel}/>}
          </div>
        ) : null}

        {/* ── SUBTOPIC BOOKMARKS ── */}
        <SubtopicBookmarks
          selTopic={selTopic}
          subject={sel}
          curriculum={curriculum}
          staticSubtopics={staticSubtopics}
          gs={gs}
        />
      </div>
    );
  }

  // ── SUBJECT VIEW ──
  if (sel) {
    const color = getColor(sel);
    const subjData = VCAA_CURRICULUM[sel];
    const myTopic = currentTopic[sel];
    const myNotes = userNotes[sel];

    return (
      <div className="content fade-up">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <button className="btn btn-g btn-sm" onClick={()=>setSel(null)}>← Back</button>
          <div style={{width:4,height:32,background:color,borderRadius:2}}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:900,fontSize:20}}>{sel}</div>
            <div style={{color:"#6060a0",fontSize:12}}>{curriculum} · {subjData?.assessmentType||"Assessment"}</div>
          </div>
          <Ring val={gs?.state?.masteryMap?.[sel]||50} size={56} stroke={5} color={color}/>
        </div>

        {/* What are you studying right now? */}
        <div className="card" style={{marginBottom:16,borderColor:`${color}44`}}>
          <div className="ch">
            <div className="ct">📍 What are you studying right now?</div>
            {!editingTopic && <button className="btn btn-g btn-sm" onClick={()=>{setTopicInput(myTopic||"");setEditingTopic(true);}}>
              {myTopic?"Edit":"Set topic"}
            </button>}
          </div>
          <div className="cb">
            {editingTopic ? (
              <div style={{display:"flex",gap:8}}>
                <input value={topicInput} onChange={e=>setTopicInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&saveCurrentTopic(sel,topicInput)}
                  placeholder={`e.g. "Electrochemistry", "Chapter 4 — Calculus"...`}
                  style={{flex:1,background:"var(--bg3)",border:`1px solid ${color}66`,borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,outline:"none",fontFamily:"var(--ff)"}}
                  autoFocus/>
                <button className="btn btn-p btn-sm" onClick={()=>saveCurrentTopic(sel,topicInput)}>Save</button>
                <button className="btn btn-g btn-sm" onClick={()=>setEditingTopic(false)}>Cancel</button>
              </div>
            ) : myTopic ? (
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                <span style={{fontSize:14,fontWeight:600}}>{myTopic}</span>
                <span style={{fontSize:12,color:"#50508a"}}>— all quizzes and flashcards will focus on this</span>
              </div>
            ) : (
              <div style={{color:"#50508a",fontSize:13}}>
                Tell us your current topic and every quiz, flashcard, and study note will be generated specifically for what you're learning right now.
              </div>
            )}
          </div>
        </div>

        {/* Paste your own notes */}
        <div className="card" style={{marginBottom:16}}>
          <div className="ch">
            <div className="ct">📄 Your Notes / Textbook Excerpt</div>
            {!editingNotes && <button className="btn btn-g btn-sm" onClick={()=>{setNotesInput(myNotes||"");setEditingNotes(true);}}>
              {myNotes?"Edit":"Paste notes"}
            </button>}
          </div>
          {editingNotes ? (
            <div className="cb">
              <textarea value={notesInput} onChange={e=>setNotesInput(e.target.value)}
                placeholder="Paste your textbook notes, teacher handouts, or any content here. Gemini will use THIS as the primary source for all quizzes and flashcards..."
                style={{width:"100%",minHeight:120,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",color:"var(--text)",fontSize:13,outline:"none",resize:"vertical",fontFamily:"var(--fi)",lineHeight:1.6}}/>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button className="btn btn-p btn-sm" onClick={()=>saveUserNotes(sel,notesInput)}>Save Notes</button>
                <button className="btn btn-g btn-sm" onClick={()=>setEditingNotes(false)}>Cancel</button>
                {myNotes && <button className="btn btn-g btn-sm" style={{color:"var(--a3)"}} onClick={()=>saveUserNotes(sel,"")}>Clear</button>}
              </div>
            </div>
          ) : myNotes ? (
            <div className="cb">
              <div style={{fontSize:13,color:"#9090b8",lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:80,overflow:"hidden",maskImage:"linear-gradient(180deg,black 60%,transparent)"}}>{myNotes}</div>
              <div style={{fontSize:11,color:"#50508a",marginTop:4}}>✅ {myNotes.length} characters · Gemini will use your notes as primary source</div>
            </div>
          ) : (
            <div className="cb" style={{color:"#50508a",fontSize:13}}>
              Optionally paste your textbook or teacher notes — Gemini will generate questions directly from YOUR content rather than general curriculum.
            </div>
          )}
        </div>

        {/* VCAA Topic areas */}
        {topicsLoading ? (
          <div style={{textAlign:"center",padding:32}}>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>{[0,.2,.4].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}</div>
          </div>
        ) : (
          <>
            <div style={{fontWeight:800,fontSize:14,marginBottom:12,color:"#7070a8",textTransform:"uppercase",letterSpacing:".06em"}}>
              {subjData?"📋 Official VCAA Study Areas":"📚 Topic Areas"}
            </div>
            <div className="g2" style={{marginBottom:18}}>
              {topics.map((topic,i)=>{
                const area = subjData?.areas?.[i];
                return (
                  <div key={i} className="card" style={{padding:20,cursor:"pointer",borderLeft:`4px solid ${color}`,transition:"all .2s"}}
                    onClick={()=>{setSelTopic(topic);setContent("");setActiveTab("overview");}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{topic}</div>
                    {area && (
                      <div style={{fontSize:12,color:"#6060a0",lineHeight:1.5}}>
                        {area.dotPoints.slice(0,2).map((dp,j)=>(
                          <div key={j} style={{display:"flex",gap:6,marginBottom:3}}>
                            <span style={{color:color,flexShrink:0}}>•</span>{dp}
                          </div>
                        ))}
                        {area.dotPoints.length > 2 && <div style={{color:"#50508a",marginTop:3}}>+{area.dotPoints.length-2} more dot points →</div>}
                      </div>
                    )}
                    <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                      <span className="tag tag-a">📖 Notes</span>
                      <span className="tag tag-g">🎯 Quiz</span>
                      <span className="tag tag-r">🃏 Flashcards</span>
                      <span style={{fontSize:10,color:"#50508a",padding:"2px 8px"}}>Click to study →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick generate for current topic */}
            {myTopic && (
              <div className="card" style={{borderColor:`${color}44`}}>
                <div className="ch"><div className="ct">⚡ Quick Study — {myTopic}</div><span className="tag tag-g">Current Topic</span></div>
                <div className="cb">
                  <div style={{fontSize:13,color:"#7070a8",marginBottom:14}}>Generate study materials specifically for what you're doing right now in class</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {[
                      {type:"study",label:"📖 Study Notes"},
                      {type:"quiz",label:"🎯 Practice Quiz"},
                      {type:"flashcards",label:"🃏 Flashcards"},
                      {type:"notes",label:"📋 Quick Summary"},
                    ].map(t=>(
                      <button key={t.type} className="btn btn-s btn-sm"
                        onClick={()=>{setSelTopic(myTopic);generateContent(t.type);}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── SUBJECT LIST ──
  const vceGroups = ALL_SUBJECTS.vce.groups;
  const ibGroups = ALL_SUBJECTS.ib.groups;
  const grouped = {};
  if (profile.yearLevel==="vce") {
    Object.entries(vceGroups).forEach(([g,ss])=>{ const mine=ss.filter(s=>subjs.includes(s)); if(mine.length) grouped[g]=mine; });
  } else if (profile.yearLevel==="ib") {
    Object.entries(ibGroups).forEach(([g,ss])=>{ const mine=ss.filter(s=>subjs.includes(s)); if(mine.length) grouped[g]=mine; });
  } else { grouped["My Subjects"]=subjs; }

  return (
    <div className="content fade-up">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontWeight:900,fontSize:22}}>My Subjects</div>
          <div style={{color:"#6060a0",fontSize:13,marginTop:3}}>{subjs.length} subjects · {ALL_SUBJECTS[profile.yearLevel]?.label} · Click a subject to start studying</div>
        </div>
      </div>
      {Object.entries(grouped).map(([group,ss])=>(
        <div key={group} style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:800,color:"#50508a",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>{group}</div>
          <div className="g3">
            {ss.map(s=>{
              const mastery = gs?.state?.masteryMap?.[s]||50;
              const myTopic = currentTopic[s];
              const hasVCAA = !!VCAA_CURRICULUM[s];
              return (
                <div key={s} className="subj-card" onClick={()=>loadTopics(s)} style={{paddingTop:16}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:getColor(s)}}/>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:getColor(s),textTransform:"uppercase",letterSpacing:".05em"}}>{profile.yearLevel?.toUpperCase()}</div>
                    {hasVCAA && <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>✅ VCAA curriculum</div>}
                  </div>
                  <div className="sn">{s}</div>
                  {myTopic && <div style={{fontSize:10,color:getColor(s),marginTop:4,fontWeight:600}}>📍 {myTopic}</div>}
                  <div className="mb" style={{marginTop:10,height:5}}>
                    <div className="mf" style={{width:`${mastery}%`,background:getColor(s)}}/>
                  </div>
                  <div className="ml"><span>Mastery</span><span style={{fontWeight:700,color:getColor(s)}}>{mastery}%</span></div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// INLINE QUIZ — used inside SubjectsScreen
// ─────────────────────────────────────────────
function InlineQuiz({ questions, subject, gs }) {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);
  const q = questions[qi];

  const choose = (i) => {
    if(answered) return;
    setSel(i); setAnswered(true);
    if(i===q.correct) setScore(s=>s+1);
    setResults(r=>[...r,{ok:i===q.correct}]);
  };
  const next = () => {
    if(qi<questions.length-1){setQi(i=>i+1);setSel(null);setAnswered(false);}
    else { if(gs) gs.recordQuiz(subject,score+(sel===q?.correct?1:0),questions.length); setDone(true); }
  };

  if(done) {
    const pct = Math.round((score/questions.length)*100);
    return (
      <div className="card" style={{textAlign:"center",padding:"36px 24px"}}>
        <div style={{fontSize:52,fontWeight:900,color:pct>=75?"var(--a2)":pct>=50?"var(--gold)":"var(--a3)",fontFamily:"var(--ff)"}}>{pct}%</div>
        <div style={{color:"#7070a8",marginTop:6}}>{score}/{questions.length} correct · +{score*60} XP</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
          {results.map((r,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:r.ok?"var(--a2)":"var(--a3)"}}/>)}
        </div>
        <button className="btn btn-p" style={{marginTop:16}} onClick={()=>{setQi(0);setSel(null);setAnswered(false);setScore(0);setDone(false);setResults([]);}}>Try Again</button>
      </div>
    );
  }
  if(!q) return null;
  return (
    <div className="card">
      <div className="ch">
        <div className="ct">Question {qi+1}/{questions.length} {q.marks&&<span className="tag tag-gold">{q.marks} marks</span>}</div>
        <span style={{fontSize:12,color:"#6060a0"}}>{subject}</span>
      </div>
      <div className="cb">
        <div style={{fontWeight:700,fontSize:15,lineHeight:1.5,marginBottom:20}}>{cleanMath(q.question)}</div>
        {q.options?.map((opt,i)=>{
          let cls="qopt";
          if(answered){cls+=" qdis";if(i===q.correct)cls+=" qcor";else if(i===sel)cls+=" qwrg";}
          return (
            <div key={i} className={cls} onClick={()=>choose(i)}>
              <div className="ql" style={answered&&i===q.correct?{background:"rgba(92,224,198,.2)",color:"var(--a2)"}:answered&&i===sel?{background:"rgba(255,107,107,.2)",color:"var(--a3)"}:{}}>{String.fromCharCode(65+i)}</div>
              {cleanMath(opt)}
              {answered&&i===q.correct&&<span style={{marginLeft:"auto",color:"var(--a2)"}}>✓</span>}
              {answered&&i===sel&&i!==q.correct&&<span style={{marginLeft:"auto",color:"var(--a3)"}}>✗</span>}
            </div>
          );
        })}
        {answered&&<div className="qexp fade-up"><strong style={{color:"var(--a2)"}}>💡 </strong>{cleanMath(q.explanation)}</div>}
        {answered&&<button className="btn btn-p" style={{marginTop:14}} onClick={next}>{qi<questions.length-1?"Next →":"Finish"}</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INLINE FLASHCARDS — used inside SubjectsScreen
// ─────────────────────────────────────────────
function InlineFlashcards({ cards, subject }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [done, setDone] = useState(false);
  const card = cards[idx];

  const verdict = (v) => {
    if(v==="know") setKnown(k=>[...k,idx]);
    setFlipped(false);
    setTimeout(()=>{ if(idx<cards.length-1) setIdx(i=>i+1); else setDone(true); },200);
  };

  if(done) return (
    <div className="card" style={{textAlign:"center",padding:"36px"}}>
      <div style={{fontSize:48}}>🃏</div>
      <div style={{fontWeight:900,fontSize:42,color:"var(--a2)",margin:"10px 0"}}>{known.length}/{cards.length}</div>
      <div style={{color:"#7070a8",fontSize:14}}>Cards mastered — {subject}</div>
      <button className="btn btn-p" style={{marginTop:16}} onClick={()=>{setIdx(0);setFlipped(false);setKnown([]);setDone(false);}}>Restart</button>
    </div>
  );
  if(!card) return null;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontWeight:700,fontSize:13,color:"#7070a8"}}>{idx+1}/{cards.length} · {subject}</span>
        <div style={{height:4,width:160,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#7C6AF7,#5CE0C6)",width:`${(idx/cards.length)*100}%`}}/>
        </div>
      </div>
      <div className="fc-wrap" onClick={()=>setFlipped(f=>!f)}>
        <div className={`fc-inner${flipped?" flip":""}`} style={{minHeight:180}}>
          <div className="fc-face fc-front">
            <div className="fc-sub">{subject}</div>
            <div className="fc-q" style={{fontSize:17}}>{cleanMath(card.q)}</div>
            <div className="fc-hint">Tap to reveal</div>
          </div>
          <div className="fc-face fc-back">
            <div className="fc-sub" style={{color:"var(--a2)"}}>Answer</div>
            <div className="fc-a">{cleanMath(card.a)}</div>
          </div>
        </div>
      </div>
      {flipped && (
        <div style={{display:"flex",gap:12,marginTop:16}} className="fade-up">
          <button className="btn btn-full" style={{flex:1,justifyContent:"center",border:"1.5px solid rgba(255,107,107,.4)",color:"var(--a3)",background:"rgba(255,107,107,.05)"}} onClick={()=>verdict("rev")}>✗ Still Learning</button>
          <button className="btn btn-full" style={{flex:1,justifyContent:"center",border:"1.5px solid rgba(92,224,198,.4)",color:"var(--a2)",background:"rgba(92,224,198,.05)"}} onClick={()=>verdict("know")}>✓ Got It!</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// QUIZ — Gemini generates questions for YOUR subjects
// ─────────────────────────────────────────────
function QuizScreen({ profile, gs }) {
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selSubj, setSelSubj] = useState((Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[])[0] || "");

  const generateQuiz = async (subject) => {
    setLoading(true); setError(""); setQuestions([]);
    setQi(0); setSel(null); setAnswered(false); setScore(0); setDone(false); setResults([]);

    try {
      // Get current topic and user notes from localStorage
      const currentTopics = JSON.parse(localStorage.getItem("ss_currentTopics")||"{}");
      const userNotes = JSON.parse(localStorage.getItem("ss_userNotes")||"{}");
      const currentTopic = currentTopics[subject] || "";
      const notes = userNotes[subject] || "";
      const ctx = getCurriculumContext(subject, currentTopic, notes, profile.yearLevel);

      const prompt = `You are a ${profile.yearLevel==="ib"?"IB Diploma":"VCE"} exam question generator for Australian students.

Generate exactly 6 multiple choice questions based on:
${ctx}
${currentTopic ? `Focus specifically on: ${currentTopic}` : "Cover a range of topics from the curriculum above."}

CRITICAL FORMATTING RULES:
- Write ALL maths in plain text — use ², ³, √, ×, ÷, ≤, ≥, π, Δ, θ — NEVER use LaTeX ($...$) or backslash commands
- Example: write "√72 - √18" NOT "$\\sqrt{72} - \\sqrt{18}$"
- Example: write "x² + 3x - 4" NOT "$x^2 + 3x - 4$"
- Questions must be genuine exam style with correct difficulty
- Each question has exactly 4 options (A, B, C, D)
- Only ONE correct answer
- Include a clear explanation for the correct answer
- Use Australian curriculum content and spelling

Respond ONLY with valid JSON, no markdown, no backticks:
[{"subject":"${selSubj}","question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`;

      const raw = await callGemini(prompt);
      // Robust JSON extraction — handles markdown, extra text, etc.
      let clean = raw.replace(/```json\n?|```\n?/g, "").trim();
      // Find the JSON array
      const start = clean.indexOf("[");
      const end = clean.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("No JSON array found");
      clean = clean.slice(start, end + 1);
      const parsed = JSON.parse(clean);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Bad response");
      // Validate each question has options array
      const valid = parsed.filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2);
      if (valid.length === 0) throw new Error("No valid questions");
      setQuestions(valid);
    } catch(e) {
      setError("Couldn't generate questions — " + (e.message || "try again"));
    }
    setLoading(false);
  };

  useEffect(()=>{ if(selSubj) generateQuiz(selSubj); }, [selSubj]);

  const q = questions[qi];
  const choose = (i) => {
    if(answered) return;
    setSel(i); setAnswered(true);
    if(i===q.correct) setScore(s=>s+1);
    setResults(r=>[...r,{ok:i===q.correct}]);
  };
  const next = () => {
    if(qi<questions.length-1){setQi(i=>i+1);setSel(null);setAnswered(false);}
    else {
      // Record to game state when quiz finishes
      const finalScore = score + (sel===q?.correct ? 1 : 0);
      if(gs) gs.recordQuiz(selSubj, finalScore, questions.length);
      setDone(true);
    }
  };
  const restart = () => generateQuiz(selSubj);

  // Subject selector
  const SubjectPicker = ()=>(
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
      {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).map(s=>(
        <button key={s} onClick={()=>setSelSubj(s)}
          className="btn btn-sm"
          style={{background:selSubj===s?getColor(s):"var(--bg3)",color:selSubj===s?"#fff":"#7070a8",border:`1px solid ${selSubj===s?getColor(s):"var(--border)"}`}}>
          {s}
        </button>
      ))}
    </div>
  );

  if(loading) return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div className="card" style={{textAlign:"center",padding:"60px 24px"}}>
        <div style={{fontSize:36,marginBottom:16}}>✨</div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Generating your {selSubj} quiz...</div>
        <div style={{color:"#6060a0",fontSize:13}}>Gemini is creating personalised {profile.yearLevel?.toUpperCase()} questions for you</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:20}}>
          {[0,.2,.4].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`,width:10,height:10}}/>)}
        </div>
      </div>
    </div>
  );

  if(error) return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div className="card" style={{textAlign:"center",padding:"48px 24px"}}>
        <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
        <div style={{fontWeight:700,marginBottom:8}}>{error}</div>
        <button className="btn btn-p" style={{marginTop:12}} onClick={()=>generateQuiz(selSubj)}>Try Again</button>
      </div>
    </div>
  );

  if(done) {
    const pct = Math.round((score/questions.length)*100);
    return (
      <div className="content fade-up">
        <SubjectPicker/>
        <div className="card">
          <div style={{textAlign:"center",padding:"48px 24px"}}>
            <div style={{fontSize:64,fontWeight:900,color:pct>=75?"var(--a2)":pct>=50?"var(--gold)":"var(--a3)",fontFamily:"var(--ff)"}}>{pct}%</div>
            <div style={{fontSize:16,color:"#7070a8",marginTop:6}}>{score}/{questions.length} correct · +{score*60} XP earned</div>
            <div style={{marginTop:8,fontSize:13,color:"#9090b8"}}>{selSubj} · {profile.yearLevel?.toUpperCase()}</div>
            <div style={{marginTop:14,fontSize:14,color:"#9090b8"}}>
              {pct>=75?"🎉 Excellent! You're on track.":pct>=50?"👍 Good effort — review the missed topics.":"📚 Let's revisit these with the AI Tutor."}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16}}>
              {results.map((r,i)=><div key={i} style={{width:11,height:11,borderRadius:"50%",background:r.ok?"var(--a2)":"var(--a3)"}}/>)}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24}}>
              <button className="btn btn-p" onClick={restart}>New Quiz 🎲</button>
              <button className="btn btn-s" onClick={()=>setDone(false)}>Review Answers</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(!q) return null;

  return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontWeight:900,fontSize:20}}>Practice Quiz</div>
          <span className="tag tag-a">{q.subject || selSubj}</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontWeight:700,color:"#6060a0"}}>Q {qi+1} / {questions.length}</span>
          <button className="btn btn-g btn-sm" onClick={restart}>New Quiz 🎲</button>
        </div>
      </div>
      <div style={{height:5,background:"var(--bg3)",borderRadius:3,marginBottom:22,overflow:"hidden"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#7C6AF7,#5CE0C6)",width:`${((qi+(answered?1:0))/questions.length)*100}%`,transition:"width .3s ease",borderRadius:3}}/>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div className="cb">
          <div style={{fontWeight:700,fontSize:16,lineHeight:1.5,marginBottom:22}}>{cleanMath(q.question)}</div>
          {q.options?.map((opt,i)=>{
            let cls="qopt";
            if(answered){cls+=" qdis";if(i===q.correct)cls+=" qcor";else if(i===sel)cls+=" qwrg";}
            return (
              <div key={i} className={cls} onClick={()=>choose(i)}>
                <div className="ql" style={answered&&i===q.correct?{background:"rgba(92,224,198,.2)",color:"var(--a2)"}:answered&&i===sel?{background:"rgba(255,107,107,.2)",color:"var(--a3)"}:{}}>{String.fromCharCode(65+i)}</div>
                {cleanMath(opt)}
                {answered&&i===q.correct&&<span style={{marginLeft:"auto",color:"var(--a2)"}}>✓</span>}
                {answered&&i===sel&&i!==q.correct&&<span style={{marginLeft:"auto",color:"var(--a3)"}}>✗</span>}
              </div>
            );
          })}
          {answered&&<div className="qexp fade-up"><strong style={{color:"var(--a2)"}}>💡 </strong>{cleanMath(q.explanation)}</div>}
        </div>
      </div>
      {answered&&(
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}} className="fade-up">
          <button className="btn btn-s">🤖 Ask Claude</button>
          <button className="btn btn-p" onClick={next}>{qi<questions.length-1?"Next →":"Results 🎯"}</button>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
// FLASHCARDS
// ─────────────────────────────────────────────
function FlashcardsScreen({ profile }) {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [rev, setRev] = useState([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selSubj, setSelSubj] = useState((Array.isArray(profile?.selectedSubjects)?profile.selectedSubjects:[])[0] || "");

  const generateCards = async (subject) => {
    setLoading(true); setError(""); setCards([]);
    setIdx(0); setFlipped(false); setKnown([]); setRev([]); setDone(false);
    try {
      const currentTopics = JSON.parse(localStorage.getItem("ss_currentTopics")||"{}");
      const userNotes = JSON.parse(localStorage.getItem("ss_userNotes")||"{}");
      const currentTopic = currentTopics[subject] || "";
      const notes = userNotes[subject] || "";
      const ctx = getCurriculumContext(subject, currentTopic, notes, profile.yearLevel);

      const prompt = `Generate 10 spaced-repetition flashcards based on this official curriculum content:
${ctx}
${currentTopic ? `Focus on: ${currentTopic}` : "Cover key concepts across the curriculum."}

CRITICAL FORMATTING RULES:
- Write ALL maths in plain text — use ², ³, √, ×, ÷, ≤, ≥, π, Δ — NEVER use LaTeX ($...$)
- Example: write "√72 - √18" NOT "$\\sqrt{72} - \\sqrt{18}$"
- Questions should be concise, answers clear but complete
- Focus on exam-relevant content

Return ONLY valid JSON, no markdown:
[{"q":"question","a":"answer","subject":"${selSubj}"}]`;
      const raw = await callGemini(prompt);
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      if(!Array.isArray(parsed)||parsed.length===0) throw new Error("Bad response");
      setCards(parsed);
    } catch(e) {
      setError("Couldn't generate flashcards. Check your Gemini API key in the AI Tutor tab.");
    }
    setLoading(false);
  };

  useEffect(()=>{ if(selSubj) generateCards(selSubj); },[selSubj]);

  const verdict = (v) => {
    if(v==="know") setKnown(k=>[...k,idx]); else setRev(r=>[...r,idx]);
    setFlipped(false);
    setTimeout(()=>{ if(idx<cards.length-1) setIdx(i=>i+1); else setDone(true); },220);
  };

  const SubjectPicker = ()=>(
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
      {(Array.isArray(profile?.selectedSubjects)?profile.selectedSubjects:[]).map(s=>(
        <button key={s} onClick={()=>setSelSubj(s)} className="btn btn-sm"
          style={{background:selSubj===s?getColor(s):"var(--bg3)",color:selSubj===s?"#fff":"#7070a8",border:`1px solid ${selSubj===s?getColor(s):"var(--border)"}`}}>
          {s}
        </button>
      ))}
    </div>
  );

  if(loading) return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div className="card" style={{textAlign:"center",padding:"60px 24px"}}>
        <div style={{fontSize:36,marginBottom:16}}>🃏</div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Creating your {selSubj} flashcards...</div>
        <div style={{color:"#6060a0",fontSize:13}}>Gemini is generating personalised cards from the {profile.yearLevel?.toUpperCase()} curriculum</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:20}}>
          {[0,.2,.4].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`,width:10,height:10}}/>)}
        </div>
      </div>
    </div>
  );

  if(error) return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div className="card" style={{textAlign:"center",padding:"48px 24px"}}>
        <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
        <div style={{fontWeight:700,marginBottom:8}}>{error}</div>
        <button className="btn btn-p" style={{marginTop:12}} onClick={()=>generateCards(selSubj)}>Try Again</button>
      </div>
    </div>
  );

  const card = cards[idx];

  if(done) return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div className="card" style={{textAlign:"center",padding:"48px 24px"}}>
        <div style={{fontSize:48}}>🃏</div>
        <div style={{fontWeight:900,fontSize:52,color:"var(--a2)",margin:"12px 0"}}>{known.length}/{cards.length}</div>
        <div style={{color:"#7070a8",fontSize:14}}>Cards mastered — {selSubj}</div>
        <div style={{display:"flex",gap:24,justifyContent:"center",margin:"20px 0"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color:"var(--a2)"}}>{known.length}</div><div style={{fontSize:11,color:"#6060a0"}}>Know it ✓</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color:"var(--a3)"}}>{rev.length}</div><div style={{fontSize:11,color:"#6060a0"}}>Review again</div></div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button className="btn btn-p" onClick={()=>generateCards(selSubj)}>New Deck 🎲</button>
          <button className="btn btn-s" onClick={()=>{setIdx(0);setFlipped(false);setKnown([]);setRev([]);setDone(false);}}>Restart Same</button>
        </div>
      </div>
    </div>
  );

  if(!card) return null;

  return (
    <div className="content fade-up">
      <SubjectPicker/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><div style={{fontWeight:900,fontSize:20}}>Flashcards</div><div style={{color:"#6060a0",fontSize:12,marginTop:3}}>Spaced Repetition · Tap to flip</div></div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontWeight:700,color:"#6060a0"}}>{idx+1}/{cards.length}</span>
          <button className="btn btn-g btn-sm" onClick={()=>generateCards(selSubj)}>New Deck 🎲</button>
        </div>
      </div>
      <div style={{height:5,background:"var(--bg3)",borderRadius:3,marginBottom:22,overflow:"hidden"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#7C6AF7,#5CE0C6)",width:`${(idx/cards.length)*100}%`,transition:"width .3s",borderRadius:3}}/>
      </div>
      <div>
        <div className="fc-wrap" onClick={()=>setFlipped(f=>!f)}>
          <div className={`fc-inner${flipped?" flip":""}`} style={{minHeight:220}}>
            <div className="fc-face fc-front">
              <div className="fc-sub">{card.subject||selSubj}</div>
              <div className="fc-q">{cleanMath(card.q)}</div>
              <div className="fc-hint">Tap to reveal</div>
            </div>
            <div className="fc-face fc-back">
              <div className="fc-sub" style={{color:"var(--a2)"}}>Answer</div>
              <div className="fc-a">{cleanMath(card.a)}</div>
            </div>
          </div>
        </div>
        {flipped&&(
          <div style={{display:"flex",gap:12,marginTop:18}} className="fade-up">
            <button className="btn btn-full" style={{flex:1,justifyContent:"center",border:"1.5px solid rgba(255,107,107,.4)",color:"var(--a3)",background:"rgba(255,107,107,.05)"}} onClick={()=>verdict("rev")}>✗ Still Learning</button>
            <button className="btn btn-full" style={{flex:1,justifyContent:"center",border:"1.5px solid rgba(92,224,198,.4)",color:"var(--a2)",background:"rgba(92,224,198,.05)"}} onClick={()=>verdict("know")}>✓ Got It!</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CLAUDE AI TUTOR
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// GEMINI AI TUTOR
// ─────────────────────────────────────────────
function AIScreen({ profile }) {
  const firstName = profile.userName?.split(" ")[0] || "there";
  const curriculum = profile.yearLevel === "ib" ? "IB Diploma" : profile.yearLevel === "vce" ? "VCE" : ALL_SUBJECTS[profile.yearLevel]?.label || "Victorian secondary";
  const MEMORY_KEY = `ss_chat_${profile.userName||"user"}`;

  const welcomeMsg = {role:"ai", text:`Hey ${firstName}! I'm your AI tutor — powered by Google Gemini.\n\nI know you're studying ${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).slice(0,3).join(", ")}${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).length > 3 ? ` and ${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).length - 3} more` : ""} in ${curriculum}.\n\nAsk me anything, or upload a photo of your homework, worksheet or textbook — I'll answer it directly.`};

  const [msgs, setMsgs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(MEMORY_KEY) || "null");
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return [welcomeMsg];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save text messages (not images - too large)
      const toSave = msgs.map(m => ({...m, images: undefined})).slice(-30); // keep last 30
      localStorage.setItem(MEMORY_KEY, JSON.stringify(toSave));
    } catch {}
  }, [msgs]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]); // [{base64, preview, mediaType}]
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const systemPrompt = `You are an expert tutor for Australian secondary students in ${curriculum}.
Student: ${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).join(", ")} · Goal: ${profile.futurePath || "academic success"}
VCAA curriculum context: ${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).slice(0,3).map(s => { const d = VCAA_CURRICULUM[s]; return d ? `${s}: ${d.areas?.map(a=>a.name).join(", ")}` : s; }).join(" | ")}
Rules: Australian English. Warm and direct. Plain text maths (², √, ×). Bold **key terms**. If image uploaded, analyse it carefully and solve any questions shown step by step.`;

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(",")[1];
        setImages(prev => [...prev, { base64, preview: e.target.result, mediaType: file.type, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Paste support
  useEffect(() => {
    const onPaste = (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imgs = items.filter(i => i.type.startsWith("image/"));
      if (imgs.length) { imgs.forEach(i => { const f = i.getAsFile(); if(f) processFiles([f]); }); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg && images.length === 0) return;
    if (loading) return;
    setInput("");
    const currentImages = [...images];
    setImages([]);
    const userMsg = { role:"user", text: msg || "Please help me with this.", images: currentImages };
    const updatedMsgs = [...msgs, userMsg];
    setMsgs(updatedMsgs);
    setLoading(true);

    try {
      const contents = updatedMsgs.map(m => {
        const parts = [];
        if (m.text) parts.push({ text: m.text });
        if (m.images) m.images.forEach(img => parts.push({ inline_data: { mime_type: img.mediaType, data: img.base64 } }));
        return { role: m.role === "ai" ? "model" : "user", parts };
      });

      const res = await fetch("/api/gemini", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1500 } })
      });
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error || "Sorry, try again.";
      setMsgs(m => [...m, { role:"ai", text: reply }]);
    } catch {
      setMsgs(m => [...m, { role:"ai", text: "Connection error — check your internet and try again." }]);
    }
    setLoading(false);
  }, [input, images, msgs, loading, systemPrompt]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const sugs = [
    ...((Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).slice(0,3).map(s => `Explain a key concept in ${s}`) || []),
    "Give me practice exam questions",
    `What do I need for ${profile.futurePath === "medicine" ? "Medicine" : profile.futurePath === "law" ? "Law" : "my goal"}?`,
  ];

  // Drag and drop handlers
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); };

  return (
    <div className="chat-wrap" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>

      {/* Drag overlay */}
      {dragging && (
        <div style={{position:"absolute",inset:0,background:"rgba(200,169,110,.1)",border:"3px dashed var(--gold)",borderRadius:"var(--r2)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:8}}>📷</div>
            <div style={{fontWeight:800,fontSize:18,color:"var(--gold)"}}>Drop image to upload</div>
          </div>
        </div>
      )}

      <div className="chat-msgs">
        {msgs.map((m,i) => (
          <div key={i} className={`msg ${m.role} fade-up`}>
            <div className={`m-av ${m.role}`} style={{background:m.role==="ai"?"var(--text)":"var(--gold-light)",color:m.role==="ai"?"var(--bg2)":"var(--gold)",border:m.role==="ai"?"1.5px solid var(--border)":"1.5px solid var(--gold)"}}>
              {m.role==="ai"?"AI":(profile.userName?.[0]?.toUpperCase()||"Y")}
            </div>
            <div className="m-bub">
              {m.images?.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {m.images.map((img,j) => (
                    <img key={j} src={img.preview} alt="uploaded"
                      style={{width:90,height:90,objectFit:"cover",borderRadius:"var(--r)",border:"1.5px solid var(--border)"}}/>
                  ))}
                </div>
              )}
              <div style={{whiteSpace:"pre-wrap",lineHeight:1.7}}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="m-av ai" style={{background:"var(--text)",color:"var(--bg2)",border:"1.5px solid var(--border)"}}>AI</div>
            <div className="m-bub" style={{display:"flex",gap:6,alignItems:"center",padding:"14px 18px"}}>
              {[0,.15,.3].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-in-area">
        {/* Suggestion chips */}
        <div className="chat-sug-row">
          {sugs.map(s => <button key={s} className="sug" onClick={() => send(s)}>{s}</button>)}
          <button className="sug" onClick={() => fileRef.current?.click()}>Upload homework photo</button>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
            {images.map((img,i) => (
              <div key={i} style={{position:"relative"}}>
                <img src={img.preview} alt="preview"
                  style={{width:60,height:60,objectFit:"cover",borderRadius:"var(--r)",border:"1.5px solid var(--border)"}}/>
                <button onClick={() => setImages(p => p.filter((_,j) => j!==i))}
                  style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:"var(--text)",color:"var(--bg2)",border:"none",cursor:"pointer",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden file inputs */}
        {/* Desktop: any file */}
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}}
          onChange={e => { processFiles(e.target.files); e.target.value=""; }}/>
        {/* Mobile: camera */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
          onChange={e => { processFiles(e.target.files); e.target.value=""; }}/>

        {/* Input row */}
        <div className="chat-row">
          {/* Attach file — desktop */}
          <button onClick={() => fileRef.current?.click()} title="Attach image or file"
            style={{width:40,height:40,borderRadius:"var(--r)",border:"1.5px solid var(--border-light)",background:"var(--bg3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-light)"}>
            📎
          </button>
          {/* Camera — shows on mobile, useful on desktop too */}
          <button onClick={() => cameraRef.current?.click()} title="Take a photo"
            style={{width:40,height:40,borderRadius:"var(--r)",border:"1.5px solid var(--border-light)",background:"var(--bg3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-light)"}>
            📷
          </button>

          <textarea className="chat-inp" rows={2}
            placeholder={images.length > 0 ? "Add a question about the image (or just send)..." : `Ask anything, or paste/drop a homework image...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); send(); } }}/>

          <button className="btn btn-primary" onClick={() => send()}
            disabled={!input.trim() && images.length===0}
            style={{padding:"11px 16px",alignSelf:"flex-end",borderRadius:"var(--r2)"}}>
            ↑
          </button>
        </div>

        <div style={{fontSize:10,color:"var(--muted2)",marginTop:8,display:"flex",gap:12,alignItems:"center",justifyContent:"space-between"}}>
          <span>Powered by Google Gemini · {curriculum} · Chat saved</span>
          <button onClick={()=>{ localStorage.removeItem(MEMORY_KEY); setMsgs([welcomeMsg]); }}
            style={{fontSize:10,color:"var(--muted)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--ff)",padding:0,textDecoration:"underline"}}>
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
}

function PlannerScreen({ profile, gs }) {
  const { state, addEvent, removeEvent, addMinutes } = gs;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek===0 ? -6 : 1-dayOfWeek;
  const dates = Array.from({length:7},(_,i)=>{
    const d = new Date(today); d.setDate(today.getDate()+mondayOffset+i); return d;
  });
  const todayIdx = dayOfWeek===0?6:dayOfWeek-1;

  const subjs = (Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]);
  const [goals, setGoals] = useState(()=>{ try{return JSON.parse(localStorage.getItem("ss_goals")||"[]");}catch{return [];} });
  const [newGoal, setNewGoal] = useState("");
  const [timer, setTimer] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [genPlan, setGenPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState("");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({title:"",subject:subjs[0]||"",date:"",type:"SAC"});

  useEffect(()=>{
    if(!running) return;
    const t = setInterval(()=>{
      setTimer(s=>{
        if(s<=1){ setRunning(false); addMinutes(25); return 25*60; }
        return s-1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[running]);

  const saveGoals = (g)=>{ setGoals(g); localStorage.setItem("ss_goals",JSON.stringify(g)); };
  const addGoal = ()=>{ if(!newGoal.trim()) return; saveGoals([...goals,{text:newGoal,done:false}]); setNewGoal(""); };
  const toggleGoal = (i)=>{ const g=[...goals]; g[i].done=!g[i].done; saveGoals(g); };

  const handleAddEvent = ()=>{
    if(!newEvent.title||!newEvent.date) return;
    addEvent({...newEvent, color:getColor(newEvent.subject)});
    setNewEvent({title:"",subject:subjs[0]||"",date:"",type:"SAC"});
    setShowAddEvent(false);
  };

  const generatePlan = async () => {
    setGenPlan(true); setAiPlan("");
    try {
      const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label;
      const prompt = `Create a focused weekly study plan for a ${curriculum} student.
Subjects: ${subjs.join(", ")}
Study intensity: ${profile.hoursPerWeek||"moderate"}
Goal: ${profile.futurePath||"academic success"}

Write a practical 7-day plan with specific daily tasks. Keep it concise, motivating, and realistic. Use Australian curriculum context.`;
      const res = await callGemini(prompt);
      setAiPlan(res);
    } catch { setAiPlan("Couldn't generate plan — try again."); }
    setGenPlan(false);
  };

  const mm = String(Math.floor(timer/60)).padStart(2,"0");
  const ss2 = String(timer%60).padStart(2,"0");

  // Map events to calendar days
  const evMap = {};
  (state.calendarEvents||[]).forEach(ev=>{
    const evDate = new Date(ev.date);
    dates.forEach((d,i)=>{
      if(evDate.toDateString()===d.toDateString()) {
        if(!evMap[i]) evMap[i]=[];
        evMap[i].push(ev);
      }
    });
  });

  // All upcoming events sorted
  const upcoming = (state.calendarEvents||[])
    .filter(e=>new Date(e.date)>=new Date())
    .sort((a,b)=>new Date(a.date)-new Date(b.date));

  return (
    <div className="content fade-up">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontWeight:900,fontSize:22}}>Study Planner</div>
          <div style={{color:"#6060a0",fontSize:13,marginTop:3}}>{today.toLocaleDateString("en-AU",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-s btn-sm" onClick={()=>setShowAddEvent(v=>!v)}>+ Add Event</button>
          <button className="btn btn-p btn-sm" onClick={generatePlan} disabled={genPlan}>{genPlan?"✨ Generating...":"✨ AI Generate Plan"}</button>
        </div>
      </div>

      {/* Add event form */}
      {showAddEvent && (
        <div className="card" style={{marginBottom:16,borderColor:"rgba(124,106,247,.3)"}}>
          <div className="ch"><div className="ct">📅 Add Assessment or Event</div><button className="btn btn-g btn-sm" onClick={()=>setShowAddEvent(false)}>✕</button></div>
          <div className="cb">
            <div className="g2" style={{gap:10,marginBottom:10}}>
              <input placeholder="Title (e.g. Calculus SAC, Practice Exam...)"
                value={newEvent.title} onChange={e=>setNewEvent(v=>({...v,title:e.target.value}))}
                style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,outline:"none",fontFamily:"var(--ff)"}}/>
              <input type="date" value={newEvent.date} onChange={e=>setNewEvent(v=>({...v,date:e.target.value}))}
                style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,outline:"none",fontFamily:"var(--ff)"}}/>
            </div>
            <div className="g2" style={{gap:10,marginBottom:12}}>
              <select value={newEvent.subject} onChange={e=>setNewEvent(v=>({...v,subject:e.target.value}))}
                style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,outline:"none",fontFamily:"var(--ff)"}}>
                {subjs.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newEvent.type} onChange={e=>setNewEvent(v=>({...v,type:e.target.value}))}
                style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,outline:"none",fontFamily:"var(--ff)"}}>
                {["SAC","EXAM","Assignment","Test","Revision","Other"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn btn-p" onClick={handleAddEvent}>Add to Calendar ✓</button>
          </div>
        </div>
      )}

      {aiPlan && (
        <div className="card" style={{marginBottom:18,borderColor:"rgba(124,106,247,.3)"}}>
          <div className="ch"><div className="ct">✨ Your AI Study Plan</div><button className="btn btn-g btn-sm" onClick={()=>setAiPlan("")}>✕</button></div>
          <div className="cb" style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.7,color:"#c0c0d8"}}>{aiPlan}</div>
        </div>
      )}

      {/* Weekly calendar */}
      <div className="card" style={{marginBottom:18}}>
        <div className="cb">
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
            {days.map((d,i)=>(
              <div key={i} className={`plan-day${i===todayIdx?" today":""}`}>
                <div className="plan-dl">{d}</div>
                <div className="plan-dn">{dates[i].getDate()}</div>
                {(evMap[i]||[]).map((e,j)=>(
                  <div key={j} className="plan-ev" style={{background:`${e.color||"#7C6AF7"}22`,color:e.color||"#7C6AF7",cursor:"pointer"}}
                    onClick={()=>removeEvent(e.id)} title="Click to remove">
                    {e.title?.slice(0,8)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{fontSize:10,color:"#40406a",marginTop:8,textAlign:"right"}}>Click an event on the calendar to remove it</div>
        </div>
      </div>

      <div className="g2">
        {/* Upcoming events */}
        <div className="card">
          <div className="ch"><div className="ct">📋 Upcoming Events</div><span style={{fontSize:11,color:"#50508a"}}>{upcoming.length} events</span></div>
          <div style={{padding:"0 16px"}}>
            {upcoming.length===0 ? (
              <div style={{padding:"16px 0",color:"#50508a",fontSize:13,textAlign:"center"}}>No upcoming events — add one above!</div>
            ) : upcoming.slice(0,6).map((u,i)=>{
              const daysLeft = Math.ceil((new Date(u.date)-new Date())/(1000*60*60*24));
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<upcoming.length-1?"1px solid var(--border)":"none"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:u.color||getColor(u.subject),flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700}}>{u.title}</div>
                    <div style={{fontSize:11,color:"#6060a0"}}><span className={`tag ${u.type==="SAC"?"tag-a":u.type==="EXAM"?"tag-r":"tag-gold"}`}>{u.type}</span> {u.subject}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:daysLeft<=5?"var(--a3)":daysLeft<=12?"var(--gold)":"var(--a2)"}}>{daysLeft}d</div>
                    <div style={{fontSize:10,color:"#50508a"}}>{new Date(u.date).toLocaleDateString("en-AU",{month:"short",day:"numeric"})}</div>
                  </div>
                  <button onClick={()=>removeEvent(u.id)} style={{background:"none",border:"none",color:"#40406a",cursor:"pointer",fontSize:14,padding:"2px"}}>✕</button>
                </div>
              );
            })}
          </div>

          {/* Goals */}
          <div className="ch" style={{marginTop:4}}><div className="ct">✅ Today's Goals</div><button className="btn btn-g btn-sm" onClick={()=>saveGoals([])}>Clear</button></div>
          <div className="cb">
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGoal()}
                placeholder="Add a study goal..."
                style={{flex:1,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:13,outline:"none",fontFamily:"var(--ff)"}}/>
              <button className="btn btn-p btn-sm" onClick={addGoal}>Add</button>
            </div>
            {goals.length===0&&<div style={{color:"#50508a",fontSize:13,textAlign:"center",padding:"8px 0"}}>No goals yet!</div>}
            {goals.map((g,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 0",borderBottom:i<goals.length-1?"1px solid var(--border)":"none"}}>
                <input type="checkbox" checked={g.done} onChange={()=>toggleGoal(i)} style={{accentColor:"var(--accent)",width:15,height:15,cursor:"pointer"}}/>
                <span style={{fontSize:13,flex:1,textDecoration:g.done?"line-through":"none",color:g.done?"#50508a":"var(--text)"}}>{g.text}</span>
                <button onClick={()=>saveGoals(goals.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#40406a",cursor:"pointer",fontSize:12}}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Pomodoro */}
          <div className="card">
            <div className="ch"><div className="ct">⏱️ Pomodoro Timer</div></div>
            <div className="cb" style={{textAlign:"center"}}>
              <div style={{fontWeight:900,fontSize:52,color:running?"var(--a2)":"var(--accent)",letterSpacing:-2,fontFamily:"var(--ff)",transition:"color .3s"}}>{mm}:{ss2}</div>
              <div style={{color:"#6060a0",fontSize:12,marginBottom:14}}>{running?"Focus — you've got this! 🔥":"25 min session · earns XP on complete"}</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button className="btn btn-p btn-sm" onClick={()=>setRunning(r=>!r)}>{running?"⏸ Pause":"▶ Start"}</button>
                <button className="btn btn-g btn-sm" onClick={()=>{setTimer(25*60);setRunning(false);}}>↺ Reset</button>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="card">
            <div className="ch"><div className="ct">📚 My Subjects</div></div>
            <div style={{padding:"8px 16px"}}>
              {subjs.slice(0,6).map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<Math.min(subjs.length,6)-1?"1px solid var(--border)":"none"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:getColor(s),flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:600,flex:1}}>{s}</span>
                  <span style={{fontSize:10,color:getColor(s),fontWeight:700}}>{gs.state.masteryMap?.[s]||50}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────
function AnalyticsScreen({ profile, gs }) {
  const { state, predictATAR } = gs;
  const isIB = profile.yearLevel === "ib";
  const predicted = predictATAR();
  const [targetATAR, setTargetATAR] = useState(() => {
    const saved = localStorage.getItem("ss_targetATAR");
    if (saved) return parseFloat(saved);
    return {medicine:99,law:95,engineering:90,cs:85,business:80,arts_hum:70,science:85,education:65,creative:60,trades:50}[profile.futurePath] || 75;
  });

  const updateTarget = (val) => {
    setTargetATAR(val);
    localStorage.setItem("ss_targetATAR", val);
  };

  // Build last 12 weeks of activity for chart
  const weeks = Array.from({length:12},(_,i)=>{
    const d = new Date();
    d.setDate(d.getDate() - (11-i)*7);
    const weekKey = d.toISOString().slice(0,7);
    const sessions = Object.entries(state.heatmap||{})
      .filter(([k])=>k.startsWith(weekKey))
      .reduce((a,[,v])=>a+v,0);
    return { label: d.toLocaleDateString("en-AU",{month:"short",day:"numeric"}), val: sessions };
  });
  const maxW = Math.max(...weeks.map(w=>w.val), 1);

  // Per-subject mastery from real data
  const subjMastery = (Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).map(s=>({
    name:s, mastery: state.masteryMap?.[s] || 50
  })) || [];

  // Quiz accuracy by subject
  const bySubject = {};
  (state.quizHistory||[]).forEach(q=>{
    if(!bySubject[q.subject]) bySubject[q.subject]={total:0,correct:0,count:0};
    bySubject[q.subject].correct += q.score;
    bySubject[q.subject].total += q.total;
    bySubject[q.subject].count++;
  });

  const totalQuizzes = state.quizHistory?.length || 0;
  const avgAcc = totalQuizzes > 0
    ? Math.round((state.quizHistory||[]).reduce((a,b)=>a+b.pct,0)/totalQuizzes)
    : 0;
  const totalHours = Math.round((state.totalMinutes||0)/60);

  const currentNum = parseFloat(predicted) || 0;
  const gap = isIB ? null : Math.max(0, targetATAR - currentNum).toFixed(2);

  return (
    <div className="content fade-up">
      <div style={{fontWeight:900,fontSize:22,marginBottom:18}}>Analytics & Insights</div>

      <div className="g4" style={{marginBottom:18}}>
        <div className="stat" style={{background:"rgba(124,106,247,.08)",border:"1px solid rgba(124,106,247,.2)"}}>
          <div className="sv" style={{color:"#7C6AF7",fontSize:26}}>{predicted}</div>
          <div className="sl">{isIB?"Predicted IB Score":"Predicted ATAR"}</div>
          <div className="sc up">{gap!==null&&gap>0?`${gap} below target`:"On track for goal! 🎯"}</div>
        </div>
        <div className="stat">
          <div className="sv" style={{color:"#5CE0C6",fontSize:26}}>{state.xp?.toLocaleString()||0}</div>
          <div className="sl">Total XP · Lv {state.level||1}</div>
          <div className="sc up">{totalQuizzes} quizzes completed</div>
        </div>
        <div className="stat">
          <div className="sv" style={{color:"#FFD700",fontSize:26}}>{avgAcc}%</div>
          <div className="sl">Average Accuracy</div>
          <div className="sc up">{totalQuizzes>0?`From ${totalQuizzes} quizzes`:"Take a quiz to start!"}</div>
        </div>
        <div className="stat">
          <div className="sv" style={{color:"#FF6B6B",fontSize:26}}>🔥{state.streak||0}</div>
          <div className="sl">Current Streak</div>
          <div className="sc up">Best: {state.bestStreak||0} days</div>
        </div>
      </div>

      {/* ATAR Goal Tracker */}
      {!isIB && (
        <div className="card" style={{marginBottom:18}}>
          <div className="ch">
            <div className="ct">🎯 ATAR Goal Tracker</div>
            <span className="tag tag-a">{profile.futurePath||"No goal set"}</span>
          </div>
          <div className="cb">
            <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:14}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:36,fontWeight:900,color:"#7C6AF7"}}>{predicted}</div>
                <div style={{fontSize:11,color:"#50508a"}}>Current Prediction</div>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#50508a",marginBottom:4}}>
                  <span>0</span><span>Target: {targetATAR}</span><span>99.95</span>
                </div>
                <div style={{height:10,background:"var(--bg3)",borderRadius:5,overflow:"hidden",position:"relative"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(currentNum/99.95)*100}%`,background:"linear-gradient(90deg,#7C6AF7,#5CE0C6)",borderRadius:5,transition:"width 1s ease"}}/>
                  <div style={{position:"absolute",top:0,height:"100%",left:`${(targetATAR/99.95)*100}%`,width:2,background:"var(--gold)"}}/>
                </div>
                <div style={{fontSize:11,color:"#50508a",marginTop:4}}>
                  {gap>0?`📈 ${gap} ATAR points to reach your ${profile.futurePath} goal`:"🎉 You're on track for your goal!"}
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:36,fontWeight:900,color:"var(--gold)"}}>{targetATAR}</div>
                <div style={{fontSize:11,color:"#50508a"}}>Goal</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"var(--muted)",background:"var(--bg3)",borderRadius:8,padding:"10px 14px",marginBottom:12}}>
              💡 Your ATAR prediction improves as you complete quizzes and raise your subject mastery scores.
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>
                <span>Set your target ATAR</span>
                <span style={{color:"var(--gold)",fontWeight:900}}>{targetATAR}</span>
              </div>
              <input type="range" min="50" max="99.95" step="0.05" value={targetATAR}
                onChange={e=>updateTarget(parseFloat(e.target.value))}
                style={{width:"100%",accentColor:"var(--gold)",cursor:"pointer"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted2)",marginTop:2}}>
                <span>50</span><span>75</span><span>90</span><span>99.95</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity chart */}
      <div className="card" style={{marginBottom:18}}>
        <div className="ch"><div className="ct">📈 Study Sessions — Last 12 Weeks</div></div>
        <div className="cb">
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120}}>
            {weeks.map((w,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:9,color:"#50508a"}}>{w.val||""}</div>
                <div style={{width:"100%",background:w.val>0?"linear-gradient(180deg,#7C6AF7,#5CE0C6)":"var(--bg3)",borderRadius:"3px 3px 0 0",height:`${Math.max(4,(w.val/maxW)*100)}px`,transition:"height 1s ease"}}/>
                <div style={{fontSize:8,color:"#40406a",textAlign:"center",lineHeight:1.2}}>{w.label}</div>
              </div>
            ))}
          </div>
          {weeks.every(w=>w.val===0)&&<div style={{textAlign:"center",color:"#50508a",fontSize:12,marginTop:8}}>Complete quizzes and flashcards to see your activity here!</div>}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="ch"><div className="ct">📚 Subject Mastery</div></div>
          <div className="cb">
            {subjMastery.length===0 ? (
              <div style={{color:"#50508a",fontSize:13}}>Take quizzes to build your mastery scores!</div>
            ) : subjMastery.sort((a,b)=>b.mastery-a.mastery).map((s,i)=>(
              <div key={s.name} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12,fontWeight:600}}>
                  <span>{s.name}</span>
                  <span style={{color:getColor(s.name),fontWeight:700}}>{s.mastery}%</span>
                </div>
                <div className="mb" style={{height:7}}>
                  <div className="mf" style={{width:`${s.mastery}%`,background:`linear-gradient(90deg,${getColor(s.name)},${getColor(s.name)}99)`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="ch"><div className="ct">⚠️ Focus Areas</div></div>
            <div className="cb">
              {subjMastery.length === 0 ? (
                <div style={{color:"var(--muted)",fontSize:13}}>Take quizzes to identify your weak areas!</div>
              ) : subjMastery.sort((a,b)=>a.mastery-b.mastery).slice(0,3).map((s,i)=>(
                <div key={s.name} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12,fontWeight:600}}>
                    <span style={{color:"var(--text)"}}>{s.name}</span>
                    <span style={{fontWeight:700,color:"var(--danger)"}}>{s.mastery}%</span>
                  </div>
                  <div className="mb" style={{height:6}}><div className="mf" style={{width:`${s.mastery}%`,background:"var(--danger)"}}/></div>
                </div>
              ))}
              <button className="btn btn-primary btn-sm btn-full" style={{marginTop:4}}
                onClick={async()=>{
                  const weak = subjMastery.sort((a,b)=>a.mastery-b.mastery).slice(0,3).map(s=>s.name);
                  if(!weak.length){alert("Take some quizzes first to identify your weak areas!");return;}
                  const btn = document.activeElement;
                  btn.textContent="Generating..."; btn.disabled=true;
                  try {
                    const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label||"Year 9";
                    const prompt = `Create a targeted study plan for a ${curriculum} student who needs to improve in: ${weak.join(", ")}.

For each weak subject, provide:
1. The 2-3 most important concepts to review
2. Specific study strategies for that subject
3. A 3-day focused action plan

Keep it practical, motivating and specific to the Australian ${curriculum} curriculum.`;
                    const res = await callGemini(prompt);
                    setAiPlan(res);
                  } catch(e) { setAiPlan("Couldn't generate plan — try again."); }
                  btn.textContent="✨ AI Study Plan for Weak Areas"; btn.disabled=false;
                }}>
                ✨ AI Study Plan for Weak Areas
              </button>
            </div>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">📋 Quiz History</div></div>
            <div style={{padding:"0 16px"}}>
              {(state.quizHistory||[]).length===0 ? (
                <div style={{padding:"14px 0",color:"#50508a",fontSize:13,textAlign:"center"}}>No quizzes yet!</div>
              ) : (state.quizHistory||[]).slice(0,6).map((q,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<5?"1px solid var(--border)":"none"}}>
                  <div style={{width:34,height:34,borderRadius:7,background:q.pct>=75?"rgba(92,224,198,.12)":q.pct>=50?"rgba(255,215,0,.12)":"rgba(255,107,107,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:q.pct>=75?"var(--a2)":q.pct>=50?"var(--gold)":"var(--a3)",flexShrink:0}}>{q.pct}%</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600}}>{q.subject}</div>
                    <div style={{fontSize:10,color:"#50508a"}}>{q.score}/{q.total} · {new Date(q.date).toLocaleDateString("en-AU",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS SCREEN
// ─────────────────────────────────────────────
function NotifToggles() {
  const NOTIFS = [
    {label:"📅 SAC & Exam Countdowns",desc:"7, 3 and 1 day reminders",key:"sac"},
    {label:"🔥 Daily Streak Reminder",desc:"Keep your streak alive",key:"streak"},
    {label:"⚡ XP Milestones",desc:"Level up and achievement alerts",key:"xp"},
    {label:"📊 Weekly Summary",desc:"Sunday progress report",key:"weekly"},
  ];
  const [vals, setVals] = useState(() =>
    Object.fromEntries(NOTIFS.map(n => [n.key, JSON.parse(localStorage.getItem(`notif_${n.key}`) ?? "true")]))
  );
  const toggle = (key) => {
    const next = !vals[key];
    localStorage.setItem(`notif_${key}`, JSON.stringify(next));
    setVals(v => ({...v, [key]: next}));
  };
  return (
    <>
      {NOTIFS.map((n,i) => (
        <div key={n.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<3?"1px solid var(--border)":"none"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>{n.label}</div>
            <div style={{fontSize:11,color:"#50508a",marginTop:2}}>{n.desc}</div>
          </div>
          <button onClick={()=>toggle(n.key)}
            style={{width:44,height:24,borderRadius:12,background:vals[n.key]?"var(--accent)":"var(--bg3)",border:`1px solid ${vals[n.key]?"var(--accent)":"var(--border)"}`,cursor:"pointer",position:"relative",flexShrink:0,transition:"all .2s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:vals[n.key]?22:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
          </button>
        </div>
      ))}
    </>
  );
}

function SettingsScreen({ profile, onUpdateProfile, onSignOut }) {
  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [yearLevel, setYearLevel] = useState(profile.yearLevel);
  const [selectedSubjects, setSelectedSubjects] = useState((Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]));
  const [futurePath, setFuturePath] = useState(profile.futurePath || "");
  const [hoursPerWeek, setHoursPerWeek] = useState(profile.hoursPerWeek || "moderate");
  const [saved, setSaved] = useState(false);

  const YEAR_LEVELS = [{id:"year9",label:"Year 9"},{id:"year10",label:"Year 10"},{id:"vce",label:"VCE"},{id:"ib",label:"IB Diploma"}];
  const FUTURE_PATHS = [
    {id:"medicine",label:"🩺 Medicine / Health"},{id:"law",label:"⚖️ Law"},{id:"engineering",label:"⚙️ Engineering"},
    {id:"cs",label:"💻 Computer Science"},{id:"business",label:"💼 Business"},{id:"science",label:"🔬 Science"},
    {id:"arts_hum",label:"🎨 Arts / Humanities"},{id:"education",label:"📖 Education"},{id:"trades",label:"🔧 Trades"},
  ];
  const HOURS = [{id:"light",label:"Light (1-2h/day)"},{id:"moderate",label:"Moderate (2-3h/day)"},{id:"intensive",label:"Intensive (3-5h/day)"},{id:"extreme",label:"Extreme (5h+/day)"}];

  const subjectGroups = yearLevel === "vce" ? ALL_SUBJECTS.vce.groups
    : yearLevel === "ib" ? ALL_SUBJECTS.ib.groups
    : yearLevel === "year9" ? {"Core":ALL_SUBJECTS.year9.core,"Electives":ALL_SUBJECTS.year9.elective}
    : {"Core":ALL_SUBJECTS.year10.core,"Electives":ALL_SUBJECTS.year10.elective};

  const save = () => {
    const updated = {...profile, yearLevel, selectedSubjects, futurePath, hoursPerWeek};
    onUpdateProfile(updated);
    setSaved(true); setEditing(false);
    setTimeout(()=>setSaved(false),2000);
  };

  const TABS = [{id:"profile",label:"👤 Profile"},{id:"subjects",label:"📚 Subjects"},{id:"notifications",label:"🔔 Alerts"},{id:"about",label:"ℹ️ About"}];

  return (
    <div className="content fade-up">
      <div style={{fontWeight:900,fontSize:22,marginBottom:20}}>Settings</div>
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`btn btn-sm ${tab===t.id?"btn-p":"btn-g"}`}>{t.label}</button>)}
      </div>

      {tab==="profile"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="ch"><div className="ct">👤 Your Profile</div><button className="btn btn-s btn-sm" onClick={()=>setEditing(e=>!e)}>{editing?"Cancel":"Edit"}</button></div>
            <div className="cb">
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#7C6AF7,#5CE0C6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",flexShrink:0}}>
                  {profile.userName?.[0]?.toUpperCase()||"S"}
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:18}}>{profile.userName}</div>
                  <div style={{fontSize:13,color:"#6060a0"}}>{profile.email}</div>
                  <div style={{fontSize:12,color:"#50508a",marginTop:4}}>{ALL_SUBJECTS[profile.yearLevel]?.label||profile.yearLevel} · {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).length||0} subjects</div>
                </div>
              </div>
              {!editing?(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {label:"Year Level",value:ALL_SUBJECTS[profile.yearLevel]?.label||profile.yearLevel},
                    {label:"Career Goal",value:FUTURE_PATHS.find(f=>f.id===profile.futurePath)?.label||profile.futurePath||"Not set"},
                    {label:"Study Intensity",value:HOURS.find(h=>h.id===profile.hoursPerWeek)?.label||"Moderate"},
                    {label:"Subjects",value:`${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).length||0} selected`},
                  ].map((item,i)=>(
                    <div key={i} style={{background:"var(--bg3)",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:"#50508a",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{item.label}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{item.value}</div>
                    </div>
                  ))}
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#7070a8",marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Year Level</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {YEAR_LEVELS.map(y=><button key={y.id} onClick={()=>{setYearLevel(y.id);setSelectedSubjects([]);}} className={`btn btn-sm ${yearLevel===y.id?"btn-p":"btn-g"}`}>{y.label}</button>)}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#7070a8",marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Career Goal</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {FUTURE_PATHS.map(f=><button key={f.id} onClick={()=>setFuturePath(f.id)} className={`btn btn-sm ${futurePath===f.id?"btn-p":"btn-g"}`} style={{justifyContent:"flex-start"}}>{f.label}</button>)}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#7070a8",marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Study Intensity</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {HOURS.map(h=><button key={h.id} onClick={()=>setHoursPerWeek(h.id)} className={`btn btn-sm ${hoursPerWeek===h.id?"btn-p":"btn-g"}`}>{h.label}</button>)}
                    </div>
                  </div>
                  <button className="btn btn-p" onClick={save} style={{padding:"12px"}}>{saved?"✅ Saved!":"Save Changes"}</button>
                </div>
              )}
            </div>
          </div>
          <div className="card" style={{borderColor:"var(--danger)"}}>
            <div className="ch"><div className="ct" style={{color:"var(--danger)"}}>Account</div></div>
            <div className="cb" style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button className="btn btn-danger btn-sm" onClick={onSignOut}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {tab==="subjects"&&(
        <div className="card">
          <div className="ch"><div className="ct">📚 My Subjects</div><span style={{fontSize:12,color:"#50508a"}}>{selectedSubjects.length}/12</span></div>
          <div className="cb">
            <div style={{fontSize:13,color:"#7070a8",marginBottom:14}}>Tap to add or remove. Changes save immediately.</div>
            {Object.entries(subjectGroups).map(([group,subjects])=>(
              <div key={group} style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:800,color:"#50508a",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>{group}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {subjects.map(s=>{
                    const sel = selectedSubjects.includes(s);
                    return(
                      <button key={s} onClick={()=>{
                        const updated = sel ? selectedSubjects.filter(x=>x!==s) : selectedSubjects.length<12?[...selectedSubjects,s]:selectedSubjects;
                        setSelectedSubjects(updated);
                        onUpdateProfile({...profile,selectedSubjects:updated});
                      }}
                        style={{padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:sel?getColor(s):"var(--bg3)",color:sel?"#fff":"#7070a8",border:`1px solid ${sel?getColor(s):"var(--border)"}`,transition:"all .15s"}}>
                        {sel&&"✓ "}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="notifications"&&(
        <div className="card">
          <div className="ch"><div className="ct">🔔 Notification Preferences</div></div>
          <div className="cb">
            <NotifToggles/>
          </div>
        </div>
      )}

      {tab==="about"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="cb" style={{textAlign:"center",padding:"24px"}}>
              <img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Ace" style={{width:80,height:80,borderRadius:18,marginBottom:12}}/>
              <div style={{fontWeight:900,fontSize:22,marginBottom:4}}>Study Ace</div>
              <div style={{color:"#6060a0",fontSize:13,marginBottom:4}}>Victorian Education Platform · Years 9–12</div>
              <div style={{fontSize:12,color:"#50508a"}}>Version 1.0.0</div>
            </div>
          </div>
          <div className="card">
            <div className="ch"><div className="ct">📋 Platform Info</div></div>
            <div className="cb">
              {[
                {label:"AI Model",value:"Google Gemini 2.0 Flash (OpenRouter)"},
                {label:"Curriculum",value:"VCAA 2024-2028 + IB Diploma"},
                {label:"Subjects",value:"88 subjects across Years 9-12"},
                {label:"Auth",value:"Google OAuth via Supabase"},
                {label:"Hosting",value:"Vercel"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<4?"1px solid var(--border)":"none",fontSize:13}}>
                  <span style={{color:"#7070a8"}}>{item.label}</span>
                  <span style={{fontWeight:600,color:"var(--text)"}}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SEARCH SCREEN
// ─────────────────────────────────────────────
function SearchScreen({ profile, setScreen }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(()=>{
    if(!query.trim()){setResults([]);return;}
    const q=query.toLowerCase();
    const found=[];
    (Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).forEach(sub=>{
      if(sub.toLowerCase().includes(q))
        found.push({type:"subject",title:sub,subtitle:"Subject",color:getColor(sub),action:"subjects"});
    });
    Object.entries(VCAA_CURRICULUM).forEach(([sub,data])=>{
      if(!(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).includes(sub))return;
      data.areas?.forEach(area=>{
        if(area.name.toLowerCase().includes(q))
          found.push({type:"topic",title:area.name,subtitle:sub,color:getColor(sub),action:"subjects"});
        area.dotPoints?.forEach(dp=>{
          if(dp.toLowerCase().includes(q))
            found.push({type:"dotpoint",title:dp.slice(0,55)+(dp.length>55?"...":""),subtitle:`${sub} → ${area.name}`,color:getColor(sub),action:"subjects"});
        });
      });
    });
    const screens=[
      {name:"dashboard",label:"Dashboard",icon:"⊞"},
      {name:"planner",label:"Study Planner",icon:"📅"},
      {name:"analytics",label:"Analytics",icon:"📊"},
      {name:"ai",label:"AI Tutor",icon:"✨"},
      {name:"groups",label:"Study Groups",icon:"👥"},
      {name:"tutors",label:"Tutor Marketplace",icon:"🎓"},
      {name:"settings",label:"Settings",icon:"⚙️"},
    ];
    screens.forEach(s=>{
      if(s.label.toLowerCase().includes(q))
        found.push({type:"screen",title:s.icon+" "+s.label,subtitle:"Navigate to",color:"#7C6AF7",action:s.name});
    });
    setResults(found.slice(0,20));
  },[query]);

  const QUICK=[
    {icon:"📚",label:"My Subjects",screen:"subjects"},
    {icon:"✨",label:"AI Tutor",screen:"ai"},
    {icon:"📅",label:"Study Planner",screen:"planner"},
    {icon:"📊",label:"Analytics",screen:"analytics"},
    {icon:"👥",label:"Study Groups",screen:"groups"},
    {icon:"🎓",label:"Tutor Marketplace",screen:"tutors"},
  ];

  return(
    <div className="content fade-up">
      <div style={{fontWeight:900,fontSize:22,marginBottom:20}}>Search</div>
      <div style={{position:"relative",marginBottom:20}}>
        <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#50508a"}}>🔍</div>
        <input autoFocus value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search subjects, topics, curriculum points..."
          style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 14px 14px 44px",color:"var(--text)",fontSize:15,outline:"none",fontFamily:"var(--ff)",boxSizing:"border-box"}}/>
        {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#50508a",cursor:"pointer",fontSize:18}}>✕</button>}
      </div>
      {!query&&(
        <div>
          <div style={{fontWeight:700,fontSize:13,color:"#50508a",marginBottom:12,textTransform:"uppercase",letterSpacing:".08em"}}>Quick Links</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {QUICK.map((q,i)=>(
              <button key={i} onClick={()=>setScreen(q.screen)} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{q.icon}</span>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {query&&results.length===0&&(
        <div style={{textAlign:"center",padding:"40px",color:"#50508a"}}>
          <div style={{fontSize:32,marginBottom:8}}>🔍</div>
          <div>No results for "{query}"</div>
        </div>
      )}
      {results.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:12,color:"#50508a",marginBottom:4}}>{results.length} result{results.length!==1?"s":""}</div>
          {results.map((r,i)=>(
            <button key={i} onClick={()=>setScreen(r.action)} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,width:"100%"}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${r.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                {{subject:"📚",topic:"📖",dotpoint:"•",screen:"🔗"}[r.type]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{r.title}</div>
                <div style={{fontSize:11,color:"#50508a",marginTop:2}}>{r.subtitle}</div>
              </div>
              <div style={{fontSize:12,color:r.color,fontWeight:700}}>→</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDY GROUPS — full rebuild with persistence,
// image upload, reliable chat, leaderboard
// ─────────────────────────────────────────────
const SB = "https://ybxfjndeckyynhgsgqma.supabase.co/rest/v1";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieGZqbmRlY2t5eW5oZ3NncW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTcxNTYsImV4cCI6MjA5Mzg5MzE1Nn0.CaPL1ydby2DsPMbM_IsDovZiGWxz7PF0j_cTuLVw4dk";
const sh = (token, extra={}) => ({ "Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${token}`, Prefer:"return=representation", ...extra });
const sg = async (path, token, opts={}) => {
  const r = await fetch(`${SB}${path}`, { headers:sh(token), ...opts });
  return r.json();
};

function StudyGroupsScreen({ profile, user, gs }) {
  const [tab, setTab] = useState("mine");
  const [allGroups, setAllGroups] = useState([]);
  const [myGroupIds, setMyGroupIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("ss_my_groups")||"[]")); } catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState((Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[])[0]||"");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const token = user?.session?.access_token;
  const userId = user?.userId;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Get my memberships
      const memberships = await sg(`/group_members?user_id=eq.${userId}&select=group_id`, token);
      const ids = Array.isArray(memberships) ? memberships.map(m=>m.group_id) : [];
      const newSet = new Set(ids);
      setMyGroupIds(newSet);
      localStorage.setItem("ss_my_groups", JSON.stringify(ids));

      // Get all groups
      const groups = await sg("/study_groups?order=created_at.desc&select=*", token);
      setAllGroups(Array.isArray(groups) ? groups : []);
    } catch(e) { console.error("loadAll error:", e); }
    setLoading(false);
  };

  const doJoinGroup = async (group) => {
    try {
      await fetch(`${SB}/group_members`, {
        method: "POST",
        headers: { "Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${token}`, Prefer:"resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ group_id:group.id, user_id:userId, display_name:profile.userName, role:"member" })
      });
      await fetch(`${SB}/leaderboard_members`, {
        method: "POST",
        headers: { "Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${token}`, Prefer:"resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ leaderboard_id:group.id, user_id:userId, display_name:profile.userName, xp:gs.state.xp||0, level:gs.state.level||1, streak:gs.state.streak||0 })
      }).catch(()=>{});
      const newIds = new Set([...myGroupIds, group.id]);
      setMyGroupIds(newIds);
      localStorage.setItem("ss_my_groups", JSON.stringify([...newIds]));
      setAllGroups(prev => prev.map(g => g.id===group.id ? {...g, member_count:(g.member_count||1)+1} : g));
      setActiveGroup(group);
    } catch(e) { alert("Couldn't join: "+(e.message||"try again")); }
  };

  const joinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoining(true); setError("");
    try {
      const data = await sg(`/study_groups?code=eq.${code}&select=*`, token);
      if (!Array.isArray(data) || data.length === 0) {
        setError("No group found with that code. Check and try again."); setJoining(false); return;
      }
      const group = data[0];
      if (myGroupIds.has(group.id)) { setActiveGroup(group); setJoining(false); return; }
      await doJoinGroup(group);
      setJoinCode("");
    } catch(e) { setError("Error: "+(e.message||"try again")); }
    setJoining(false);
  };

  const createGroup = async () => {
    if (!newName.trim()) return;
    if (!token) { setError("Not logged in — please sign out and sign back in."); return; }
    setCreating(true); setError("");
    try {
      const code = "ACE-"+Math.random().toString(36).slice(2,6).toUpperCase();
      // Use minimal return to avoid empty JSON issue, then fetch the created group
      const res = await fetch(`${SB}/study_groups`, {
        method: "POST",
        headers: { "Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${token}`, Prefer:"return=minimal" },
        body: JSON.stringify({ name:newName.trim(), subject:newSubject, description:newDesc.trim(), created_by:userId, member_count:1, code, is_public:newPublic })
      });
      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try { const errData = await res.json(); errMsg = errData?.message || errData?.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      // Fetch the group we just created by code
      const data = await sg(`/study_groups?code=eq.${code}&select=*`, token);
      const group = Array.isArray(data) ? data[0] : data;
      if (!group?.id) throw new Error("Group creation failed");
      // Join as creator
      await fetch(`${SB}/group_members`, {
        method: "POST",
        headers: { "Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${token}`, Prefer:"resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ group_id:group.id, user_id:userId, display_name:profile.userName, role:"creator" })
      });
      await fetch(`${SB}/leaderboard_members`, {
        method: "POST",
        headers: { "Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${token}`, Prefer:"resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ leaderboard_id:group.id, user_id:userId, display_name:profile.userName, xp:gs.state.xp||0, level:gs.state.level||1, streak:gs.state.streak||0 })
      }).catch(()=>{});
      const newIds = new Set([...myGroupIds, group.id]);
      setMyGroupIds(newIds);
      localStorage.setItem("ss_my_groups", JSON.stringify([...newIds]));
      setAllGroups(prev => [group, ...prev]);
      setNewName(""); setNewDesc("");
      setActiveGroup(group);
    } catch(e) { setError("Couldn't create: "+(e.message||"try again")); }
    setCreating(false);
  };

  if (activeGroup) return (
    <GroupView group={activeGroup} profile={profile} user={user} gs={gs}
      isMember={myGroupIds.has(activeGroup.id)}
      onBack={()=>{ setActiveGroup(null); loadAll(); }}
      onJoin={()=>doJoinGroup(activeGroup)}/>
  );

  const myGroups = allGroups.filter(g => myGroupIds.has(g.id));
  const otherGroups = allGroups.filter(g => !myGroupIds.has(g.id) && g.is_public !== false);

  return (
    <div className="content fade-up">
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:900,fontSize:22,letterSpacing:"-.03em",color:"var(--text)"}}>Study Groups</div>
        <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>Group chat · XP leaderboard · Invite friends with a code</div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[{id:"mine",label:"My Groups"},{id:"discover",label:"Discover"},{id:"join",label:"Join with Code"},{id:"create",label:"Create Group"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setError("");}}
            className={`btn btn-sm ${tab===t.id?"btn-primary":"btn-secondary"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="mine" && (
        loading ? <div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading your groups...</div>
        : myGroups.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontSize:48,marginBottom:16}}>👥</div>
            <div style={{fontWeight:700,fontSize:18,color:"var(--text)",marginBottom:8}}>No groups yet</div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>Create a group and invite friends, or join with a code</div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn btn-primary btn-sm" onClick={()=>setTab("create")}>Create Group</button>
              <button className="btn btn-secondary btn-sm" onClick={()=>setTab("join")}>Join with Code</button>
            </div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {myGroups.map(g=><SGroupCard key={g.id} group={g} isMember={true} onOpen={()=>setActiveGroup(g)}/>)}
          </div>
        )
      )}

      {tab==="discover" && (
        loading ? <div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading...</div>
        : otherGroups.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:8}}>No other groups yet</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setTab("create")}>Create the first one</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {otherGroups.map(g=><SGroupCard key={g.id} group={g} isMember={false} onJoin={()=>doJoinGroup(g)} onOpen={()=>setActiveGroup(g)}/>)}
          </div>
        )
      )}

      {tab==="join" && (
        <div className="card" style={{maxWidth:400}}>
          <div className="card-head"><div className="card-title">Join with Invite Code</div></div>
          <div className="card-body" style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:13,color:"var(--muted)"}}>Enter the code your friend shared with you.</div>
            <input className="input" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
              placeholder="ACE-XXXX" maxLength={8}
              style={{fontSize:22,fontWeight:800,letterSpacing:".12em",textAlign:"center"}}
              onKeyDown={e=>e.key==="Enter"&&joinByCode()}/>
            {error&&<div style={{fontSize:12,color:"var(--danger)",padding:"8px 12px",background:"var(--danger-bg)",borderRadius:"var(--r)",border:"1px solid var(--danger)"}}>{error}</div>}
            <button className="btn btn-primary" onClick={joinByCode} disabled={joining||!joinCode.trim()}>
              {joining?"Finding group...":"Join Group"}
            </button>
          </div>
        </div>
      )}

      {tab==="create" && (
        <div className="card" style={{maxWidth:520}}>
          <div className="card-head"><div className="card-title">Create a Study Group</div></div>
          <div className="card-body" style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Group Name *</div>
              <input className="input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Year 12 Chemistry Squad"/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Subject</div>
              <select className="input" value={newSubject} onChange={e=>setNewSubject(e.target.value)}>
                {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Description (optional)</div>
              <textarea className="input" value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="What will this group focus on?"/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderTop:"1px solid var(--border-light)"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Public Group</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{newPublic?"Anyone can discover and join":"Only joinable via invite code"}</div>
              </div>
              <div className={`switch ${newPublic?"on":""}`} onClick={()=>setNewPublic(p=>!p)}>
                <div className="switch-knob"/>
              </div>
            </div>
            {error&&<div style={{fontSize:12,color:"var(--danger)",padding:"8px 12px",background:"var(--danger-bg)",borderRadius:"var(--r)",border:"1px solid var(--danger)"}}>{error}</div>}
            <button className="btn btn-primary" onClick={createGroup} disabled={creating||!newName.trim()}>
              {creating?"Creating...":"Create Group & Get Invite Code"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SGroupCard({ group, isMember, onOpen, onJoin }) {
  const color = getColor(group.subject);
  return (
    <div className="card" style={{borderLeft:`3px solid ${color}`,cursor:isMember?"pointer":"default"}} onClick={isMember?onOpen:undefined}>
      <div className="card-body">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15,color:"var(--text)",letterSpacing:"-.01em"}}>{group.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <div style={{fontSize:12,fontWeight:700,color}}>{group.subject}</div>
              {group.is_public===false && <span style={{fontSize:10,background:"var(--bg4)",color:"var(--muted)",borderRadius:20,padding:"1px 7px",fontWeight:700,border:"1px solid var(--border-light)"}}>🔒 Private</span>}
            </div>
          </div>
          <span style={{fontSize:11,color:"var(--muted)",background:"var(--bg3)",border:"1px solid var(--border-light)",borderRadius:20,padding:"3px 10px",fontWeight:600,flexShrink:0,marginLeft:8}}>
            {group.member_count||1} member{(group.member_count||1)!==1?"s":""}
          </span>
        </div>
        {group.description&&<div style={{fontSize:13,color:"var(--muted)",marginBottom:12,lineHeight:1.5}}>{group.description}</div>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {isMember
            ? <button className="btn btn-primary btn-sm" onClick={onOpen}>Open Group</button>
            : <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();onJoin();}}>Join Group</button>
          }
          {group.code&&<span style={{fontSize:11,color:"var(--muted)"}}>Code: <strong style={{color:"var(--gold)"}}>{group.code}</strong></span>}
        </div>
      </div>
    </div>
  );
}

function GroupView({ group, profile, user, gs, isMember, onBack, onJoin }) {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imgPreview, setImgPreview] = useState(null); // {base64, dataUrl}
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const fileRef = useRef(null);
  const token = user?.session?.access_token;
  const userId = user?.userId;
  const { state } = gs;
  const color = getColor(group.subject);

  useEffect(() => {
    loadMessages();
    syncLeaderboard();
    pollRef.current = setInterval(loadMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await sg(`/group_messages?group_id=eq.${group.id}&order=created_at.asc&limit=80`, token);
      if (Array.isArray(data)) setMessages(data);
    } catch {}
    setLoadingMsgs(false);
  };

  const syncLeaderboard = async () => {
    try {
      await sg("/leaderboard_members", token, {
        method: "POST",
        headers: sh(token, {Prefer:"resolution=merge-duplicates,return=minimal"}),
        body: JSON.stringify({ leaderboard_id:group.id, user_id:userId, display_name:profile.userName, xp:state.xp||0, level:state.level||1, streak:state.streak||0 })
      });
      const data = await sg(`/leaderboard_members?leaderboard_id=eq.${group.id}&order=xp.desc&select=*`, token);
      if (Array.isArray(data)) setMembers(data);
    } catch {}
  };

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(",")[1];
      setImgPreview({ base64, dataUrl, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if ((!input.trim() && !imgPreview) || sending) return;
    setSending(true);
    try {
      let content = input.trim();
      // If there's an image, embed it as a special format
      if (imgPreview) {
        content = `[IMG:${imgPreview.mediaType}:${imgPreview.base64}]${content ? "\n"+content : ""}`;
      }
      const temp = { id:"tmp-"+Date.now(), group_id:group.id, user_id:userId, display_name:profile.userName, content, created_at:new Date().toISOString() };
      setMessages(m=>[...m, temp]);
      setInput(""); setImgPreview(null);
      await sg("/group_messages", token, {
        method: "POST",
        headers: sh(token, {Prefer:"return=minimal"}),
        body: JSON.stringify({ group_id:group.id, user_id:userId, display_name:profile.userName, content })
      });
      await loadMessages();
    } catch {}
    setSending(false);
  };

  const copyCode = () => {
    if (group.code) { navigator.clipboard.writeText(group.code); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  };

  const rankIcon = i => i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;

  // Render message content — handles images embedded as [IMG:...]
  const renderContent = (content) => {
    if (!content) return null;
    if (content.startsWith("[IMG:")) {
      const end = content.indexOf("]");
      const parts = content.slice(5, end).split(":");
      const mediaType = parts[0]+":"+parts[1];
      const base64 = parts.slice(2).join(":");
      const text = content.slice(end+1).trim();
      return (
        <>
          <img src={`data:${mediaType};base64,${base64}`} alt="shared image"
            style={{maxWidth:"100%",maxHeight:200,borderRadius:"var(--r)",border:"1.5px solid var(--border)",display:"block",marginBottom:text?6:0}}/>
          {text && <div style={{whiteSpace:"pre-wrap"}}>{text}</div>}
        </>
      );
    }
    return <div style={{whiteSpace:"pre-wrap"}}>{content}</div>;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 56px)"}}>
      {/* Header */}
      <div style={{padding:"10px 20px",borderBottom:"1.5px solid var(--border)",background:"var(--bg2)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div style={{width:34,height:34,borderRadius:"var(--r)",background:color+"22",border:`1.5px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📚</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:800,fontSize:14,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{group.name}</div>
          <div style={{fontSize:11,color:"var(--muted)"}}>{group.subject}</div>
        </div>
        {group.code && (
          <button onClick={copyCode} style={{background:"var(--gold-light)",border:"1.5px solid var(--gold)",borderRadius:"var(--r)",padding:"5px 10px",cursor:"pointer",fontFamily:"var(--ff)",flexShrink:0,textAlign:"center"}}>
            <div style={{fontSize:12,fontWeight:900,letterSpacing:".08em",color:"var(--gold)"}}>{group.code}</div>
            <div style={{fontSize:9,color:"var(--muted)",fontWeight:600}}>{copied?"Copied!":"Tap to copy"}</div>
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",borderBottom:"1.5px solid var(--border)",background:"var(--bg2)",flexShrink:0}}>
        {[{id:"chat",label:"💬 Chat"},{id:"leaderboard",label:"🏆 Rankings"},{id:"info",label:"ℹ Info"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="leaderboard")syncLeaderboard();}}
            style={{flex:1,padding:"10px 4px",border:"none",borderBottom:tab===t.id?"2.5px solid var(--text)":"2.5px solid transparent",background:"transparent",color:tab===t.id?"var(--text)":"var(--muted)",fontWeight:tab===t.id?800:600,fontSize:12,cursor:"pointer",fontFamily:"var(--ff)",transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CHAT */}
      {tab==="chat" && (<>
        <div style={{flex:1,overflowY:"auto",padding:"14px 20px",display:"flex",flexDirection:"column",gap:10}}>
          {!isMember ? (
            <div style={{textAlign:"center",padding:"40px 24px"}}>
              <div style={{fontWeight:700,color:"var(--text)",marginBottom:8}}>Join to see messages</div>
              <button className="btn btn-primary btn-sm" onClick={onJoin}>Join Group</button>
            </div>
          ) : loadingMsgs ? (
            <div style={{textAlign:"center",color:"var(--muted)",marginTop:40}}>Loading messages...</div>
          ) : messages.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 24px"}}>
              <div style={{fontSize:32,marginBottom:8}}>💬</div>
              <div style={{fontWeight:700,color:"var(--text)",marginBottom:4}}>No messages yet</div>
              <div style={{fontSize:13,color:"var(--muted)"}}>Be the first to say something!</div>
            </div>
          ) : messages.map((msg,i) => {
            const isMe = msg.user_id===userId;
            const showName = !isMe&&(i===0||messages[i-1].user_id!==msg.user_id);
            return (
              <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                {!isMe&&<div className="av" style={{width:26,height:26,fontSize:10,flexShrink:0,alignSelf:"flex-start",marginTop:showName?18:0}}>{msg.display_name?.[0]?.toUpperCase()||"?"}</div>}
                <div style={{maxWidth:"70%"}}>
                  {showName&&<div style={{fontSize:10,fontWeight:700,color:"var(--muted)",marginBottom:3,paddingLeft:2}}>{msg.display_name}</div>}
                  <div style={{padding:"10px 14px",borderRadius:isMe?"var(--r2) var(--r2) 4px var(--r2)":"var(--r2) var(--r2) var(--r2) 4px",background:isMe?"var(--text)":"var(--bg2)",color:isMe?"var(--bg2)":"var(--text)",border:"1.5px solid",borderColor:isMe?"var(--text)":"var(--border-light)",fontSize:13,lineHeight:1.6}}>
                    {renderContent(msg.content)}
                  </div>
                  <div style={{fontSize:10,color:"var(--muted2)",marginTop:2,textAlign:isMe?"right":"left"}}>
                    {new Date(msg.created_at).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>

        {isMember && (
          <div style={{borderTop:"1.5px solid var(--border)",background:"var(--bg2)",flexShrink:0,padding:"10px 16px 12px"}}>
            {imgPreview && (
              <div style={{marginBottom:8,position:"relative",display:"inline-block"}}>
                <img src={imgPreview.dataUrl} alt="preview" style={{height:60,borderRadius:"var(--r)",border:"1.5px solid var(--border)",objectFit:"cover"}}/>
                <button onClick={()=>setImgPreview(null)} style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:"var(--danger)",color:"#fff",border:"none",cursor:"pointer",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleImageSelect(e.target.files[0]);e.target.value="";}}/>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <button onClick={()=>fileRef.current?.click()} style={{width:38,height:38,borderRadius:"var(--r)",border:"1.5px solid var(--border-light)",background:"var(--bg3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📷</button>
              <input className="input" value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder={`Message ${group.name}...`} style={{flex:1}}/>
              <button className="btn btn-primary" onClick={send} disabled={(!input.trim()&&!imgPreview)||sending} style={{padding:"10px 16px",flexShrink:0}}>
                {sending?"...":"Send"}
              </button>
            </div>
          </div>
        )}
      </>)}

      {/* LEADERBOARD */}
      {tab==="leaderboard" && (
        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
          <div style={{fontWeight:800,fontSize:16,color:"var(--text)",marginBottom:16}}>🏆 {group.name} Rankings</div>
          {members.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 24px",color:"var(--muted)"}}>
              <div style={{fontWeight:700,color:"var(--text)",marginBottom:4}}>No rankings yet</div>
              <div style={{fontSize:13}}>Earn XP by completing quizzes to appear here</div>
            </div>
          ) : (
            <div className="card">
              <div style={{padding:"0 18px"}}>
                {members.map((m,i)=>(
                  <div key={m.id||i} className={`lb-row${m.user_id===userId?" me":""}`}>
                    <div style={{fontSize:18,width:30,textAlign:"center",flexShrink:0}}>{rankIcon(i)}</div>
                    <div className="av" style={{width:30,height:30,fontSize:11,flexShrink:0,background:m.user_id===userId?"var(--text)":"var(--bg4)"}}>{m.display_name?.[0]?.toUpperCase()||"?"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:"var(--text)",display:"flex",alignItems:"center",gap:6}}>
                        {m.display_name}
                        {m.user_id===userId&&<span style={{fontSize:9,background:"var(--text)",color:"var(--bg2)",borderRadius:20,padding:"1px 6px",fontWeight:800}}>You</span>}
                      </div>
                      <div style={{fontSize:11,color:"var(--muted)"}}>Level {m.level||1} · {m.streak||0} streak</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:800,fontSize:14,color:"var(--text)"}}>{(m.xp||0).toLocaleString()}</div>
                      <div style={{fontSize:10,color:"var(--muted)"}}>XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INFO */}
      {tab==="info" && (
        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-head"><div className="card-title">Group Details</div></div>
            <div className="card-body">
              {[{l:"Name",v:group.name},{l:"Subject",v:group.subject},{l:"Members",v:group.member_count||1},group.description&&{l:"Description",v:group.description}].filter(Boolean).map((item,i,arr)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?"1px solid var(--border-light)":"none",fontSize:13}}>
                  <span style={{color:"var(--muted)",fontWeight:600}}>{item.l}</span>
                  <span style={{fontWeight:700,color:"var(--text)"}}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>
          {group.code && (
            <div className="card" style={{borderColor:"var(--gold)"}}>
              <div className="card-head"><div className="card-title">📨 Invite Friends</div></div>
              <div className="card-body" style={{textAlign:"center"}}>
                <div style={{fontSize:34,fontWeight:900,letterSpacing:".12em",color:"var(--gold)",marginBottom:8}}>{group.code}</div>
                <div style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>Share this code with friends — they enter it under "Join with Code" to instantly join</div>
                <button className="btn btn-primary btn-sm" onClick={copyCode}>{copied?"✓ Copied!":"Copy Invite Code"}</button>
              </div>
            </div>
          )}
          {group.created_by === userId && (
            <div className="card" style={{marginTop:14}}>
              <div className="card-head"><div className="card-title">👑 Owner Settings</div></div>
              <div className="card-body">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Public Group</div>
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{group.is_public!==false?"Visible in Discover":"Hidden — invite code only"}</div>
                  </div>
                  <div className={`switch ${group.is_public!==false?"on":""}`} onClick={async()=>{
                    const newVal = group.is_public===false;
                    await fetch(`${SB}/study_groups?id=eq.${group.id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${token}`,Prefer:"return=minimal"},body:JSON.stringify({is_public:newVal})}).catch(()=>{});
                    group.is_public = newVal;
                  }}>
                    <div className="switch-knob"/>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TutorMarketplaceScreen({ profile, user }) {
  const [tab, setTab] = useState("browse");
  const [tutors, setTutors] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const token = user?.session?.access_token;
  const userId = user?.userId;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [all, mine] = await Promise.all([
        supabase.getTutors(token),
        supabase.getMyTutorProfile(userId, token),
      ]);
      setTutors(Array.isArray(all)?all:[]);
      setMyProfile(mine);
    } catch {}
    setLoading(false);
  };

  const filtered = tutors.filter(t => !subjectFilter || t.subjects?.includes(subjectFilter));

  if (selectedTutor) return <TutorDetailView tutor={selectedTutor} profile={profile} user={user} onBack={()=>setSelectedTutor(null)} onReviewed={loadAll}/>;

  return (
    <div className="content fade-up">
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:900,fontSize:22,letterSpacing:"-.03em",color:"var(--text)"}}>Tutor Marketplace</div>
        <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>Expert tutors for your subjects · Sessions from $60/hr</div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[{id:"browse",label:"Find a Tutor"},{id:"mine",label:"My Tutor Profile"},{id:"become",label:"Become a Tutor"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`btn btn-sm ${tab===t.id?"btn-primary":"btn-secondary"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="browse" && (
        <div>
          <select className="input" style={{maxWidth:220,marginBottom:16}} value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}>
            <option value="">All subjects</option>
            {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {loading ? (
            <div style={{textAlign:"center",padding:"40px",color:"var(--muted)"}}>Loading tutors...</div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 24px"}}>
              <div style={{fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:8}}>No tutors yet</div>
              <button className="btn btn-primary btn-sm" onClick={()=>setTab("become")}>Be the first tutor</button>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {filtered.map(tutor => (
                <div key={tutor.id} className="card" style={{cursor:"pointer"}} onClick={()=>setSelectedTutor(tutor)}>
                  <div className="card-body">
                    <div style={{display:"flex",gap:14,marginBottom:10}}>
                      <div className="av" style={{width:48,height:48,fontSize:18,flexShrink:0,borderRadius:"var(--r)"}}>{tutor.name?.[0]?.toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:15,color:"var(--text)",letterSpacing:"-.01em",marginBottom:3}}>{tutor.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:"var(--gold)",fontSize:12}}>{"★".repeat(Math.round(tutor.rating||5))}</span>
                          <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{tutor.rating||5} · {tutor.review_count||0} reviews</span>
                          <span style={{fontSize:12,fontWeight:800,color:"var(--text)"}}>${tutor.price_per_hour||60}/hr</span>
                          {!tutor.available && <span style={{fontSize:10,background:"var(--danger-bg)",color:"var(--danger)",borderRadius:20,padding:"2px 8px",fontWeight:700,border:"1px solid var(--danger)"}}>Unavailable</span>}
                        </div>
                      </div>
                    </div>
                    {tutor.bio && <div style={{fontSize:13,color:"var(--muted)",marginBottom:10,lineHeight:1.6}}>{tutor.bio}</div>}
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {(tutor.subjects||[]).map(s=>(
                        <span key={s} style={{fontSize:11,background:getColor(s)+"18",color:getColor(s),border:`1px solid ${getColor(s)}44`,borderRadius:20,padding:"3px 10px",fontWeight:700}}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="mine" && (
        myProfile ? (
          <div className="card" style={{maxWidth:520}}>
            <div className="card-head">
              <div className="card-title">Your Tutor Profile</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>setTab("become")}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{color:"var(--danger)"}} onClick={async()=>{
                  if(confirm("Delete your tutor profile?")) { await supabase.deleteTutorProfile(userId,token); setMyProfile(null); setTab("browse"); loadAll(); }
                }}>Delete</button>
              </div>
            </div>
            <div className="card-body">
              <div style={{fontWeight:800,fontSize:16,color:"var(--text)",marginBottom:4}}>{myProfile.name}</div>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:10,lineHeight:1.6}}>{myProfile.bio}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {(myProfile.subjects||[]).map(s=><span key={s} style={{fontSize:11,background:getColor(s)+"18",color:getColor(s),border:`1px solid ${getColor(s)}44`,borderRadius:20,padding:"3px 10px",fontWeight:700}}>{s}</span>)}
              </div>
              <div style={{fontSize:13,color:"var(--muted)"}}>${myProfile.price_per_hour}/hr · {myProfile.contact_email}</div>
            </div>
          </div>
        ) : (
          <div style={{textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:8}}>You're not listed as a tutor</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setTab("become")}>Create Tutor Profile</button>
          </div>
        )
      )}

      {tab==="become" && (
        <TutorProfileForm profile={profile} user={user} existing={myProfile} onSaved={(p)=>{setMyProfile(p);loadAll();setTab("mine");}}/>
      )}
    </div>
  );
}

function TutorDetailView({ tutor, profile, user, onBack, onReviewed }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const token = user?.session?.access_token;

  useEffect(()=>{ supabase.getReviews(tutor.id,token).then(r=>{ if(Array.isArray(r)) setReviews(r); }); },[]);

  const submitReview = async () => {
    setSubmitting(true);
    try {
      await supabase.addReview(tutor.id,user.userId,profile.userName,rating,comment,token);
      setComment(""); setShowReview(false);
      const r = await supabase.getReviews(tutor.id,token);
      if(Array.isArray(r)) setReviews(r);
      onReviewed();
    } catch(e) { alert("Couldn't submit: "+(e.message||"")); }
    setSubmitting(false);
  };

  return (
    <div className="content fade-up">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{marginBottom:20}}>← Back to tutors</button>
      <div className="card" style={{marginBottom:16}}>
        <div className="card-body">
          <div style={{display:"flex",gap:16,marginBottom:14}}>
            <div className="av" style={{width:60,height:60,fontSize:22,flexShrink:0,borderRadius:"var(--r)"}}>{tutor.name?.[0]?.toUpperCase()}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:20,color:"var(--text)",letterSpacing:"-.02em",marginBottom:3}}>{tutor.name}</div>
              <div style={{color:"var(--gold)",fontSize:14}}>{"★".repeat(Math.round(tutor.rating||5))}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{tutor.rating||5}/5 · {tutor.review_count||0} reviews · ${tutor.price_per_hour||60}/hr</div>
            </div>
          </div>
          {tutor.bio && <div style={{fontSize:14,color:"var(--text2)",lineHeight:1.7,marginBottom:12}}>{tutor.bio}</div>}
          {tutor.qualifications && <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 14px",marginBottom:12,fontSize:13,color:"var(--muted)"}}><strong style={{color:"var(--text)"}}>Qualifications: </strong>{tutor.qualifications}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{(tutor.subjects||[]).map(s=><span key={s} style={{fontSize:11,background:getColor(s)+"18",color:getColor(s),border:`1px solid ${getColor(s)}44`,borderRadius:20,padding:"3px 10px",fontWeight:700}}>{s}</span>)}</div>
          {tutor.contact_email && tutor.available && (
            <a href={`mailto:${tutor.contact_email}?subject=Tutoring Enquiry — Study Ace&body=Hi ${tutor.name},%0A%0AI found your profile on Study Ace and would like to enquire about tutoring.%0A%0AYear level: ${profile.yearLevel?.toUpperCase()}%0ASubjects: ${(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).join(", ")}%0A%0AThanks,%0A${profile.userName}`}
              className="btn btn-primary" style={{display:"inline-flex"}}>Contact {tutor.name?.split(" ")[0]}</a>
          )}
          {!tutor.available && <span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>Currently unavailable</span>}
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">Reviews ({reviews.length})</div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowReview(r=>!r)}>{showReview?"Cancel":"Leave Review"}</button>
        </div>
        <div className="card-body">
          {showReview && (
            <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"14px",marginBottom:14,border:"1.5px solid var(--border-light)"}}>
              <div style={{display:"flex",gap:4,marginBottom:10}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} style={{fontSize:22,background:"none",border:"none",cursor:"pointer",color:n<=rating?"var(--gold)":"var(--muted2)"}}>★</button>)}</div>
              <textarea className="input" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience..." style={{marginBottom:10}}/>
              <button className="btn btn-primary btn-sm" onClick={submitReview} disabled={submitting||!comment.trim()}>{submitting?"Submitting...":"Submit Review"}</button>
            </div>
          )}
          {reviews.length===0 ? (
            <div style={{color:"var(--muted)",fontSize:13,textAlign:"center",padding:"16px 0"}}>No reviews yet — be the first!</div>
          ) : reviews.map((r,i)=>(
            <div key={r.id} style={{padding:"10px 0",borderBottom:i<reviews.length-1?"1px solid var(--border-light)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div className="av" style={{width:26,height:26,fontSize:10}}>{r.reviewer_name?.[0]||"?"}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{r.reviewer_name}</div><div style={{color:"var(--gold)",fontSize:11}}>{"★".repeat(r.rating)}</div></div>
                <div style={{fontSize:10,color:"var(--muted)"}}>{new Date(r.created_at).toLocaleDateString("en-AU",{month:"short",year:"numeric"})}</div>
              </div>
              {r.comment && <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,paddingLeft:34}}>{r.comment}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TutorProfileForm({ profile, user, existing, onSaved }) {
  const [name, setName] = useState(existing?.name||profile.userName||"");
  const [bio, setBio] = useState(existing?.bio||"");
  const [quals, setQuals] = useState(existing?.qualifications||"");
  const [subjects, setSubjects] = useState(existing?.subjects||(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).slice(0,3)||[]);
  const [price, setPrice] = useState(existing?.price_per_hour||60);
  const [email, setEmail] = useState(existing?.contact_email||user?.email||"");
  const [available, setAvailable] = useState(existing?.available??true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = user?.session?.access_token;

  const toggle = (s) => setSubjects(p => p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const save = async () => {
    if (!name.trim()||!bio.trim()||!email.trim()||subjects.length===0) { setError("Fill in all required fields and select at least one subject."); return; }
    setLoading(true); setError("");
    try {
      const data = {user_id:user.userId,name:name.trim(),bio:bio.trim(),qualifications:quals.trim(),subjects,price_per_hour:price,contact_email:email.trim(),available};
      const result = existing ? await supabase.updateTutorProfile(user.userId,data,token) : await supabase.createTutorProfile(data,token);
      onSaved(Array.isArray(result)?result[0]:result);
    } catch(e) { setError("Couldn't save: "+(e.message||"")); }
    setLoading(false);
  };

  return (
    <div className="card" style={{maxWidth:540}}>
      <div className="card-head"><div className="card-title">{existing?"Edit Tutor Profile":"Become a Tutor"}</div></div>
      <div className="card-body" style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Full Name *</div><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></div>
        <div><div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Bio *</div><textarea className="input" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Your background, teaching style, why students love you..."/></div>
        <div><div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Qualifications</div><input className="input" value={quals} onChange={e=>setQuals(e.target.value)} placeholder="e.g. 99.95 ATAR, 3 years tutoring, studying Medicine at UniMelb"/></div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Subjects You Teach *</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).map(s=>(
              <button key={s} onClick={()=>toggle(s)} style={{padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"1.5px solid",transition:"all .15s",background:subjects.includes(s)?"var(--text)":"var(--bg3)",color:subjects.includes(s)?"var(--bg2)":"var(--muted)",borderColor:subjects.includes(s)?"var(--text)":"var(--border-light)"}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Rate ($/hr) *</div><input className="input" type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} min={20} max={300}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Contact Email *</div><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid var(--border-light)"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Available for bookings</div><div style={{fontSize:11,color:"var(--muted)"}}>Toggle off if taking a break</div></div>
          <div className={`switch ${available?"on":""}`} onClick={()=>setAvailable(a=>!a)}><div className="switch-knob"/></div>
        </div>
        {error && <div style={{fontSize:12,color:"var(--danger)",padding:"8px 12px",background:"var(--danger-bg)",borderRadius:"var(--r)",border:"1px solid var(--danger)"}}>{error}</div>}
        <button className="btn btn-primary" onClick={save} disabled={loading}>{loading?"Saving...":existing?"Save Changes":"Create Profile"}</button>
      </div>
    </div>
  );
}


function NotificationsPanel({ profile, gs, onClose }) {
  const {state}=gs;
  const notifications=[];
  (state.calendarEvents||[]).filter(e=>new Date(e.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3).forEach(e=>{
    const days=Math.ceil((new Date(e.date)-new Date())/(1000*60*60*24));
    notifications.push({icon:"📅",title:`${e.title} in ${days} day${days!==1?"s":""}`,subtitle:`${e.subject} · ${new Date(e.date).toLocaleDateString("en-AU",{month:"short",day:"numeric"})}`,color:days<=3?"var(--a3)":days<=7?"var(--gold)":"var(--a2)",time:"Upcoming"});
  });
  if(state.streak>0) notifications.push({icon:"🔥",title:`${state.streak} day streak! Keep it up!`,subtitle:"Study today to maintain your streak",color:"#FF6B6B",time:"Today"});
  if(state.xp>=100) notifications.push({icon:"⚡",title:`Level ${state.level} — ${500-(state.xp%500)} XP to next level`,subtitle:"Keep studying to level up",color:"var(--accent)",time:"Progress"});
  const weakSubjects=(Array.isArray(profile.selectedSubjects)?profile.selectedSubjects:[]).filter(s=>(state.masteryMap?.[s]||50)<60);
  if(weakSubjects?.length>0) notifications.push({icon:"⚠️",title:`${weakSubjects[0]} needs attention`,subtitle:`Mastery at ${state.masteryMap?.[weakSubjects[0]]||50}% — take a quiz`,color:"var(--gold)",time:"Study tip"});
  if(notifications.length===0) notifications.push({icon:"✅",title:"You're all caught up!",subtitle:"No new notifications",color:"var(--a2)",time:"Now"});

  return(
    <div style={{position:"absolute",top:65,right:16,width:320,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,.4)",zIndex:1000,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:15}}>🔔 Notifications</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#50508a",cursor:"pointer",fontSize:16}}>✕</button>
      </div>
      <div style={{maxHeight:380,overflowY:"auto"}}>
        {notifications.map((n,i)=>(
          <div key={i} style={{padding:"12px 16px",borderBottom:i<notifications.length-1?"1px solid var(--border)":"none",display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{fontSize:20,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{n.title}</div>
              <div style={{fontSize:11,color:"#50508a",marginTop:2}}>{n.subtitle}</div>
            </div>
            <div style={{fontSize:10,color:n.color,fontWeight:700,flexShrink:0}}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [stage, setStage] = useState("loading");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("ss_theme") || "dark");

  // Apply theme to HTML element so CSS vars work everywhere before React paints
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.background = theme === "dark" ? "#111110" : "#F2EDE4";
    localStorage.setItem("ss_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const gs = useGameState(profile || {});
  const xpPct = profile ? ((gs.state.xp % 500) / 500) * 100 : 0;

  // ── On mount: check for existing session or OAuth callback ──
  useEffect(() => {
    const init = async () => {
      try {
        const toArray = (v) => {
          if (Array.isArray(v)) return v;
          if (!v) return [];
          if (typeof v === "string") {
            // Handle "{Mathematics,Science}" PostgreSQL array format
            if (v.startsWith("{") && v.endsWith("}")) {
              return v.slice(1,-1).split(",").map(s=>s.trim().replace(/^"|"$/g,'')).filter(Boolean);
            }
            try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch {}
            return v ? [v] : [];
          }
          return [];
        };

        const normaliseProfile = (saved, userName) => ({
          yearLevel: saved.year_level || saved.yearLevel || "year9",
          selectedSubjects: toArray(saved.selected_subjects || saved.selectedSubjects),
          futurePath: saved.future_path || saved.futurePath || "",
          hoursPerWeek: saved.hours_per_week || saved.hoursPerWeek || "moderate",
          userName: saved.display_name || userName || "Student",
          email: saved.email || "",
        });

        const localProfile = (() => {
          try { return JSON.parse(localStorage.getItem("ss_profile") || "null"); } catch { return null; }
        })();

        // 1. OAuth callback
        if (window.location.hash.includes("access_token")) {
          try {
            const session = await supabase.auth.handleCallback();
            if (session?.access_token) {
              const u = { name: session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Student", email: session.user?.email, provider: "google", session, userId: session.user?.id };
              setUser(u);
              if (localProfile?.yearLevel) { setProfile({...localProfile, userName:u.name}); setStage("app"); return; }
              try {
                const saved = await supabase.loadProfile(session.user?.id, session.access_token);
                if (saved?.year_level || saved?.yearLevel) { const p = normaliseProfile(saved, u.name); setProfile(p); localStorage.setItem("ss_profile", JSON.stringify(p)); setStage("app"); return; }
              } catch {}
              setStage("onboarding"); return;
            }
          } catch { /* fall through */ }
        }

        // 2. Existing session
        try {
          const session = supabase.auth.getSession();
          if (session?.access_token && session?.user) {
            const u = { name: session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Student", email: session.user?.email, provider: session.user?.app_metadata?.provider || "email", session, userId: session.user?.id };
            setUser(u);
            if (localProfile?.yearLevel) { setProfile({...localProfile, userName:u.name}); setStage("app"); return; }
            try {
              const saved = await supabase.loadProfile(session.user?.id, session.access_token);
              if (saved?.year_level || saved?.yearLevel) { const p = normaliseProfile(saved, u.name); setProfile(p); localStorage.setItem("ss_profile", JSON.stringify(p)); setStage("app"); return; }
            } catch {}
            setStage("onboarding"); return;
          }
        } catch {}

        // 3. No session
        setStage("auth");
      } catch (e) {
        console.error("Init error:", e);
        setStage("auth"); // Never show white screen
      }
    };
    init();
  }, []);

  const handleAuth = async (u) => {
    setUser(u);
    // Check localStorage first — instant
    const localProfile = (() => {
      try { return JSON.parse(localStorage.getItem("ss_profile") || "null"); } catch { return null; }
    })();
    if (localProfile?.yearLevel) {
      setProfile({ ...localProfile, userName: u.name });
      setStage("app");
      return;
    }
    // Try Supabase
    if (u.session?.access_token && u.userId) {
      try {
        const saved = await supabase.loadProfile(u.userId, u.session.access_token);
        const yearLevel = saved?.year_level || saved?.yearLevel;
        if (yearLevel) {
          const p = {
            yearLevel,
            selectedSubjects: saved.selected_subjects || saved.selectedSubjects || [],
            futurePath: saved.future_path || saved.futurePath,
            hoursPerWeek: saved.hours_per_week || saved.hoursPerWeek,
            studyGoal: saved.study_goal || saved.studyGoal,
            userName: saved.display_name || u.name,
            email: u.email,
          };
          setProfile(p);
          localStorage.setItem("ss_profile", JSON.stringify(p));
          setStage("app");
          return;
        }
      } catch {}
    }
    setStage("onboarding");
  };

  const handleOnboard = async (data) => {
    const fullProfile = { ...data, userName: user.name, email: user.email, provider: user.provider };
    setProfile(fullProfile);
    // Save to localStorage immediately — fastest
    localStorage.setItem("ss_profile", JSON.stringify(fullProfile));
    // Save to Supabase if we have a real session
    if (user.userId && user.session?.access_token) {
      try {
        await supabase.saveProfile(user.userId, {
          year_level: data.yearLevel,
          selected_subjects: data.selectedSubjects,
          future_path: data.futurePath,
          hours_per_week: data.hoursPerWeek,
          study_goal: data.studyGoal,
          display_name: user.name,
        }, user.session.access_token);
      } catch (e) {
        console.warn("Profile save to Supabase failed:", e);
      }
    }
    setStage("app");
  };

  const handleUpdateProfile = (updated) => {
    setProfile(updated);
    localStorage.setItem("ss_profile", JSON.stringify(updated));
    if (user?.userId && user?.session?.access_token) {
      supabase.saveProfile(user.userId, {
        year_level: updated.yearLevel,
        selected_subjects: updated.selectedSubjects,
        future_path: updated.futurePath,
        hours_per_week: updated.hoursPerWeek,
        display_name: updated.userName,
      }, user.session.access_token).catch(() => {});
    }
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
    localStorage.removeItem("ss_profile");
    setStage("auth");
    setUser(null);
    setProfile(null);
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTarget, setSearchTarget] = useState(null);

  const NAV = [
    {id:"dashboard",icon:"⊞",label:"Dashboard",section:"learn"},
    {id:"subjects",icon:"📚",label:"Subjects",section:"learn"},
    {id:"ai",icon:"✨",label:"AI Tutor",badge:"FREE",section:"learn"},
    {id:"planner",icon:"📅",label:"Study Planner",section:"track"},
    {id:"analytics",icon:"📊",label:"Analytics",section:"track"},
    {id:"groups",icon:"👥",label:"Study Groups",section:"community"},
    {id:"tutors",icon:"🎓",label:"Tutor Marketplace",section:"community"},
    {id:"search",icon:"🔍",label:"Search",section:"hidden"},
    {id:"settings",icon:"⚙️",label:"Settings",section:"hidden"},
  ];

  const TITLES = {
    dashboard:"Dashboard",subjects:"My Subjects",quiz:"Practice Quiz",
    flashcards:"Flashcards",ai:"AI Tutor",planner:"Study Planner",
    analytics:"Analytics",groups:"Study Groups",leaderboard:"Leaderboard",
    tutors:"Tutor Marketplace",search:"Search",settings:"Settings"
  };

  // ── Loading screen ──
  if (stage === "loading") return (
    <>
      <style>{css}</style>
      <div style={{position:"fixed",inset:0,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
        <img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Ace" style={{width:100,height:100,objectFit:"contain",borderRadius:22,marginBottom:16}}/>
        <div style={{display:"flex",gap:8}}>
          {[0,.15,.3].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`,width:10,height:10}}/>)}
        </div>
      </div>
    </>
  );

  if (stage === "auth") return (
    <><style>{css}</style><AuthScreen onAuth={handleAuth}/></>
  );

  if (stage === "onboarding") return (
    <><style>{css}</style><Onboarding user={user} onComplete={handleOnboard}/></>
  );

  const SCREENS = {
    dashboard:   <Dashboard profile={profile} setScreen={setScreen} gs={gs}/>,
    subjects:    <SubjectsScreen profile={profile} gs={gs}/>,
    quiz:        <QuizScreen profile={profile} gs={gs}/>,
    flashcards:  <FlashcardsScreen profile={profile}/>,
    ai:          <AIScreen profile={profile}/>,
    planner:     <PlannerScreen profile={profile} gs={gs}/>,
    analytics:   <AnalyticsScreen profile={profile} gs={gs}/>,
    groups:      <StudyGroupsScreen profile={profile} user={user} gs={gs}/>,
    leaderboard: <StudyGroupsScreen profile={profile} user={user} gs={gs}/>,
    tutors:      <TutorMarketplaceScreen profile={profile} user={user}/>,
    search:      <SearchScreen profile={profile} setScreen={setScreen} setSearchTarget={setSearchTarget}/>,
    settings:    <SettingsScreen profile={profile} onUpdateProfile={handleUpdateProfile} onSignOut={handleSignOut} theme={theme} onToggleTheme={toggleTheme}/>,
  };

  const isIB = profile?.yearLevel === "ib";
  const yearLabel = isIB ? "IB Diploma" : ALL_SUBJECTS[profile?.yearLevel]?.label || "VCE";
  const notifCount = (gs.state.calendarEvents||[]).filter(e=>new Date(e.date)>=new Date()).length;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR — desktop only */}
        <div className="sidebar">
          <div className="logo">
            <img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Ace" style={{width:34,height:34,objectFit:"contain",borderRadius:"var(--r)",flexShrink:0,border:"1.5px solid var(--border)"}}/>
            <div>
              <div className="logo-text">Study Ace</div>
              <span className="logo-sub">VCE · IB · Years 9–12</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-lbl">Learn</div>
            {NAV.filter(n=>n.section==="learn").map(n=>(
              <button key={n.id} className={`ni${screen===n.id?" active":""}`} onClick={()=>setScreen(n.id)}>
                <span className="ni-icon">{n.icon}</span>{n.label}
                {n.badge&&<span className="ni-badge">{n.badge}</span>}
              </button>
            ))}
          </div>

          <div className="nav-section" style={{marginTop:8}}>
            <div className="nav-lbl">Track</div>
            {NAV.filter(n=>n.section==="track").map(n=>(
              <button key={n.id} className={`ni${screen===n.id?" active":""}`} onClick={()=>setScreen(n.id)}>
                <span className="ni-icon">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>

          <div className="nav-section" style={{marginTop:8}}>
            <div className="nav-lbl">Community</div>
            {NAV.filter(n=>n.section==="community").map(n=>(
              <button key={n.id} className={`ni${screen===n.id?" active":""}`} onClick={()=>setScreen(n.id)}>
                <span className="ni-icon">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>

          <div className="sb-bottom">
            <div className="xp-row">
              <div className="xp-lbl"><span>Level {gs.state.level||1} · {(gs.state.xp||0).toLocaleString()} XP</span><span>{500-((gs.state.xp||0)%500)} to next</span></div>
              <div className="xp-track"><div className="xp-fill" style={{width:`${xpPct}%`}}/></div>
            </div>
            <button className="user-row" onClick={()=>setScreen("settings")} style={{width:"100%",background:"none",border:"1.5px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:9,padding:8,borderRadius:"var(--r)",transition:"all .15s",fontFamily:"var(--ff)"}}>
              <div className="av">{(profile?.userName||user?.name||"Y")[0].toUpperCase()}</div>
              <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                <div className="u-name">{profile?.userName || user?.name || "Student"}</div>
                <div className="u-sub">{yearLabel} · {user?.provider === "google" ? "Google" : "Email"}</div>
              </div>
              <span style={{color:"var(--muted)",fontSize:14}}>⚙</span>
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="main" onClick={()=>showNotifications&&setShowNotifications(false)}>
          <div className="topbar">
            <div className="topbar-title">{TITLES[screen]||"Study Ace"}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div className="chip chip-fire">🔥 {gs.state.streak||0}</div>
              <div className="chip chip-xp">⚡ {(gs.state.xp||0).toLocaleString()}</div>
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{fontSize:15,background:"none",border:"1.5px solid var(--border-light)",fontFamily:"var(--ff)",cursor:"pointer"}}>
                {theme==="light"?"🌙":"☀️"}
              </button>
              <button className="icon-btn" onClick={e=>{e.stopPropagation();setShowNotifications(n=>!n)}} style={{background:"none",border:"1.5px solid var(--border-light)",cursor:"pointer",fontFamily:"var(--ff)",fontSize:15,position:"relative"}}>
                🔔
                {notifCount>0&&<div style={{position:"absolute",top:-3,right:-3,width:14,height:14,background:"var(--danger)",borderRadius:"50%",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,border:"1.5px solid var(--bg2)"}}>{notifCount}</div>}
              </button>
              <button className="icon-btn" onClick={()=>setScreen("search")} style={{background:"none",border:"1.5px solid var(--border-light)",cursor:"pointer",fontFamily:"var(--ff)",fontSize:15}}>🔍</button>
            </div>
          </div>
          {showNotifications && (
            <NotificationsPanel profile={profile} gs={gs} onClose={()=>setShowNotifications(false)}/>
          )}
          {SCREENS[screen] || SCREENS.dashboard}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="mobile-nav">
          {[
            {id:"dashboard",icon:"⊞",label:"Home"},
            {id:"subjects",icon:"📚",label:"Subjects"},
            {id:"ai",icon:"✦",label:"AI Tutor"},
            {id:"groups",icon:"👥",label:"Groups"},
            {id:"settings",icon:"⚙",label:"Settings"},
          ].map(n=>(
            <button key={n.id} className={`mobile-nav-item${screen===n.id?" active":""}`} onClick={()=>setScreen(n.id)}>
              <div className="mobile-nav-icon-wrap">
                <span className="mobile-nav-icon">{n.icon}</span>
              </div>
              <span className="mobile-nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
