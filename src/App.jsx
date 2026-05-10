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
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#08080f;--bg2:#111120;--bg3:#18182e;--bg4:#1f1f38;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.13);
  --text:#f0f0fa;--muted:#6060858;--muted2:#9090b8;
  --accent:#7C6AF7;--a2:#5CE0C6;--a3:#FF6B6B;--gold:#FFD700;
  --green:#56C785;
  --ff:'Cabinet Grotesk',sans-serif;--fi:'Instrument Serif',serif;
  --r:12px;--r2:18px;
}
html,body{background:var(--bg);color:var(--text);font-family:var(--ff);height:100%;overflow:hidden;}

/* SCROLLBAR */
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}

/* LAYOUT */
.app{display:flex;height:100vh;overflow:hidden;}

/* ── SIDEBAR ── */
.sidebar{
  width:230px;min-width:230px;background:var(--bg2);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;padding:20px 0;overflow:hidden;
}
.logo{
  padding:0 18px 24px;font-size:22px;font-weight:900;
  background:linear-gradient(135deg,#7C6AF7,#5CE0C6);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  letter-spacing:-0.5px;
}
.logo-sub{display:block;font-size:10px;font-weight:600;color:#6060a0;-webkit-text-fill-color:#6060a0;letter-spacing:.08em;margin-top:2px;}
.nav-section{padding:0 10px;margin-bottom:4px;}
.nav-lbl{font-size:9px;font-weight:800;color:#50508a;letter-spacing:.12em;text-transform:uppercase;padding:0 8px;margin-bottom:5px;}
.ni{
  display:flex;align-items:center;gap:9px;padding:9px 10px;
  border-radius:9px;cursor:pointer;font-size:13px;font-weight:600;color:#7070a0;
  transition:all .15s;position:relative;margin-bottom:2px;
}
.ni:hover{background:rgba(255,255,255,0.05);color:var(--text);}
.ni.active{background:rgba(124,106,247,0.15);color:var(--accent);}
.ni.active::before{content:'';position:absolute;left:0;top:22%;bottom:22%;width:3px;background:var(--accent);border-radius:0 3px 3px 0;}
.ni-icon{font-size:15px;width:20px;text-align:center;}
.ni-badge{margin-left:auto;background:var(--a3);color:#fff;font-size:9px;font-weight:800;padding:2px 6px;border-radius:20px;}
.ni-badge.new{background:var(--green);}

.sb-bottom{margin-top:auto;padding:14px 10px 0;border-top:1px solid var(--border);}
.user-row{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;cursor:pointer;}
.user-row:hover{background:rgba(255,255,255,0.04);}
.av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7C6AF7,#5CE0C6);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;}
.u-name{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.u-sub{font-size:10px;color:#6060a0;margin-top:1px;}
.xp-row{padding:4px 10px 14px;display:flex;flex-direction:column;gap:3px;}
.xp-lbl{display:flex;justify-content:space-between;font-size:10px;color:#6060a0;}
.xp-track{height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;}
.xp-fill{height:100%;background:linear-gradient(90deg,#7C6AF7,#5CE0C6);border-radius:2px;}

/* ── MAIN ── */
.main{flex:1;overflow-y:auto;background:var(--bg);display:flex;flex-direction:column;}
.topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(8,8,15,.88);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  padding:14px 26px;display:flex;align-items:center;gap:14px;flex-shrink:0;
}
.topbar-title{font-size:20px;font-weight:900;flex:1;}
.chip{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;font-size:12px;font-weight:700;}
.chip-fire{background:rgba(255,107,107,.15);border:1px solid rgba(255,107,107,.3);color:#FF6B6B;}
.chip-xp{background:rgba(124,106,247,.15);border:1px solid rgba(124,106,247,.3);color:#7C6AF7;}
.icon-btn{width:34px;height:34px;border-radius:9px;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;transition:all .15s;}
.icon-btn:hover{border-color:var(--border2);}
.content{padding:22px 26px 50px;flex:1;}

/* ── CARDS ── */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;}
.ch{padding:16px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.ct{font-size:14px;font-weight:800;}
.cb{padding:18px;}
.cl{font-size:12px;color:var(--accent);cursor:pointer;}
.cl:hover{text-decoration:underline;}

/* ── GRID ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}
.gc2{grid-column:span 2;}

/* ── STATS ── */
.stat{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:18px;}
.sv{font-size:28px;font-weight:900;line-height:1;margin-bottom:3px;}
.sl{font-size:11px;color:#7070a8;font-weight:600;margin-bottom:6px;}
.sc{font-size:11px;font-weight:700;}
.sc.up{color:var(--a2);}
.sc.dn{color:var(--a3);}

/* ── SUBJECT CARD ── */
.subj-card{
  background:var(--bg2);border:1px solid var(--border);
  border-radius:var(--r2);padding:18px;cursor:pointer;
  transition:all .2s;position:relative;overflow:hidden;
}
.subj-card:hover{transform:translateY(-2px);border-color:var(--border2);box-shadow:0 8px 28px rgba(0,0,0,.35);}
.subj-icon{font-size:26px;margin-bottom:10px;display:block;}
.sn{font-size:14px;font-weight:800;margin-bottom:2px;}
.su{font-size:10px;color:#6060a0;margin-bottom:12px;}
.mb{height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-bottom:5px;}
.mf{height:100%;border-radius:3px;transition:width 1s ease;}
.ml{display:flex;justify-content:space-between;font-size:10px;color:#6060a0;}

/* ── BUTTONS ── */
.btn{font-family:var(--ff);font-size:13px;font-weight:700;padding:9px 18px;border-radius:9px;border:none;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:7px;}
.btn-p{background:var(--accent);color:#fff;}
.btn-p:hover{background:#6a58e8;transform:translateY(-1px);}
.btn-s{background:var(--bg3);color:var(--text);border:1px solid var(--border);}
.btn-s:hover{border-color:var(--border2);}
.btn-g{background:transparent;color:#7070a8;border:1px solid var(--border);}
.btn-g:hover{color:var(--text);border-color:var(--border2);}
.btn-sm{font-size:11px;padding:6px 13px;border-radius:7px;}
.btn-full{width:100%;justify-content:center;}

/* ── TAGS ── */
.tag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;display:inline-block;}
.tag-a{background:rgba(124,106,247,.15);color:var(--accent);border:1px solid rgba(124,106,247,.2);}
.tag-g{background:rgba(92,224,198,.15);color:var(--a2);border:1px solid rgba(92,224,198,.2);}
.tag-r{background:rgba(255,107,107,.15);color:var(--a3);border:1px solid rgba(255,107,107,.2);}
.tag-gold{background:rgba(255,215,0,.15);color:var(--gold);border:1px solid rgba(255,215,0,.2);}

/* ── MASTERY BAR ── */
.mast-row{margin-bottom:12px;}
.mast-hd{display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:5px;}

/* ── QUIZ ── */
.qopt{
  padding:12px 16px;border-radius:10px;border:1.5px solid var(--border);
  cursor:pointer;font-size:13px;font-weight:500;
  transition:all .15s;margin-bottom:8px;display:flex;align-items:center;gap:10px;
}
.qopt:hover:not(.qdis){border-color:var(--accent);background:rgba(124,106,247,.08);}
.qopt.qcor{border-color:var(--a2)!important;background:rgba(92,224,198,.1)!important;color:var(--a2);}
.qopt.qwrg{border-color:var(--a3)!important;background:rgba(255,107,107,.1)!important;color:var(--a3);}
.qopt.qdis{cursor:default;}
.ql{width:26px;height:26px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
.qexp{padding:14px;background:rgba(92,224,198,.07);border:1px solid rgba(92,224,198,.18);border-radius:10px;font-size:13px;line-height:1.6;color:#9090c0;margin-top:14px;}

/* ── FLASHCARD ── */
.fc-wrap{perspective:1200px;cursor:pointer;}
.fc-inner{position:relative;width:100%;transition:transform .6s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;}
.fc-inner.flip{transform:rotateY(180deg);}
.fc-face{backface-visibility:hidden;border-radius:var(--r2);padding:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:200px;}
.fc-front{background:var(--bg2);border:1px solid var(--border2);}
.fc-back{background:linear-gradient(135deg,#1a1535,#0d2033);border:1px solid rgba(124,106,247,.3);position:absolute;inset:0;transform:rotateY(180deg);}
.fc-q{font-size:18px;font-weight:700;line-height:1.4;}
.fc-a{font-family:var(--fi);font-size:15px;line-height:1.7;color:#9090c0;font-style:italic;}
.fc-sub{font-size:10px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;}
.fc-hint{font-size:11px;color:#50508a;margin-top:16px;}

/* ── CHAT ── */
.chat-wrap{display:flex;flex-direction:column;height:calc(100vh - 65px);}
.chat-msgs{flex:1;overflow-y:auto;padding:18px 24px;display:flex;flex-direction:column;gap:14px;}
.msg{display:flex;gap:9px;max-width:82%;}
.msg.user{align-self:flex-end;flex-direction:row-reverse;}
.m-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;}
.m-ai-av{background:linear-gradient(135deg,#7C6AF7,#5CE0C6);}
.m-u-av{background:var(--bg3);border:1px solid var(--border2);}
.m-bub{padding:11px 15px;border-radius:14px;font-size:13px;line-height:1.65;}
.msg.ai .m-bub{background:var(--bg2);border:1px solid var(--border);border-bottom-left-radius:3px;}
.msg.user .m-bub{background:var(--accent);color:#fff;border-bottom-right-radius:3px;}
.chat-in-area{padding:14px 24px 16px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;flex-shrink:0;}
.chat-sug-row{display:flex;flex-wrap:wrap;gap:6px;}
.sug{display:inline-flex;align-items:center;padding:5px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:20px;font-size:11px;color:#7070a8;cursor:pointer;transition:all .15s;}
.sug:hover{border-color:var(--accent);color:var(--accent);}
.chat-row{display:flex;gap:8px;}
.chat-inp{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--ff);font-size:13px;outline:none;resize:none;}
.chat-inp:focus{border-color:var(--accent);}
.chat-inp::placeholder{color:#40406a;}

/* ── ONBOARDING ── */
.ob-wrap{
  position:fixed;inset:0;background:var(--bg);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  z-index:100;overflow-y:auto;
}
.ob-inner{width:100%;max-width:620px;padding:32px 24px;}
.ob-logo{font-size:28px;font-weight:900;background:linear-gradient(135deg,#7C6AF7,#5CE0C6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin-bottom:4px;}
.ob-tag{text-align:center;font-size:12px;color:#50508a;letter-spacing:.06em;margin-bottom:32px;}
.ob-step{font-size:10px;font-weight:700;color:#50508a;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;}
.ob-title{font-size:26px;font-weight:900;margin-bottom:6px;line-height:1.2;}
.ob-sub{font-size:14px;color:#7070a8;margin-bottom:24px;line-height:1.5;}
.ob-prog{height:3px;background:var(--bg3);border-radius:2px;margin-bottom:36px;overflow:hidden;}
.ob-fill{height:100%;background:linear-gradient(90deg,#7C6AF7,#5CE0C6);border-radius:2px;transition:width .4s ease;}
.ob-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.ob-opt{
  padding:14px 16px;border-radius:12px;border:1.5px solid var(--border);
  cursor:pointer;transition:all .15s;
}
.ob-opt:hover{border-color:rgba(124,106,247,.5);background:rgba(124,106,247,.06);}
.ob-opt.sel{border-color:var(--accent);background:rgba(124,106,247,.12);}
.ob-opt-top{display:flex;align-items:center;gap:10px;margin-bottom:4px;}
.ob-opt-icon{font-size:22px;}
.ob-opt-label{font-size:13px;font-weight:700;}
.ob-opt-sub{font-size:11px;color:#6060a0;margin-left:32px;}
.ob-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:12px;}
.ob-subj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-height:280px;overflow-y:auto;padding-right:4px;}
.ob-subj-btn{
  padding:8px 10px;border-radius:8px;border:1px solid var(--border);
  cursor:pointer;font-size:11px;font-weight:600;color:#7070a8;
  transition:all .15s;text-align:left;background:var(--bg3);
}
.ob-subj-btn:hover{border-color:rgba(124,106,247,.4);color:var(--text);}
.ob-subj-btn.sel{border-color:var(--accent);background:rgba(124,106,247,.12);color:var(--accent);}

/* ── AUTH ── */
.auth-wrap{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:200;}
.auth-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:36px 32px;width:100%;max-width:400px;}
.auth-logo{font-size:24px;font-weight:900;background:linear-gradient(135deg,#7C6AF7,#5CE0C6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin-bottom:4px;}
.auth-sub{text-align:center;font-size:13px;color:#6060a0;margin-bottom:28px;}
.auth-btn{
  width:100%;padding:13px;border-radius:11px;border:1px solid var(--border2);
  background:var(--bg3);color:var(--text);font-family:var(--ff);font-size:14px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
  transition:all .15s;margin-bottom:10px;
}
.auth-btn:hover{background:var(--bg4);border-color:var(--border2);transform:translateY(-1px);}
.auth-btn.google{border-color:rgba(66,133,244,.4);}
.auth-btn.google:hover{background:rgba(66,133,244,.1);}
.auth-btn.apple{border-color:rgba(255,255,255,.2);}
.auth-btn.apple:hover{background:rgba(255,255,255,.07);}
.auth-or{text-align:center;font-size:12px;color:#40406a;margin:14px 0;position:relative;}
.auth-or::before,.auth-or::after{content:'';position:absolute;top:50%;width:40%;height:1px;background:var(--border);}
.auth-or::before{left:0;}.auth-or::after{right:0;}
.auth-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:9px;padding:11px 14px;color:var(--text);font-family:var(--ff);font-size:13px;outline:none;margin-bottom:10px;}
.auth-input:focus{border-color:var(--accent);}
.auth-input::placeholder{color:#40406a;}

/* ── PLANNER ── */
.plan-day{background:var(--bg3);border-radius:10px;padding:10px 8px;text-align:center;min-height:80px;}
.plan-day.today{background:rgba(124,106,247,.12);border:1px solid rgba(124,106,247,.25);}
.plan-dl{font-size:9px;font-weight:800;color:#50508a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}
.plan-dn{font-size:17px;font-weight:900;margin-bottom:6px;}
.plan-day.today .plan-dn{color:var(--accent);}
.plan-ev{font-size:9px;font-weight:600;padding:2px 4px;border-radius:3px;margin-top:3px;text-align:left;}

/* ── HEATMAP ── */
.heat{display:grid;grid-template-columns:repeat(17,1fr);gap:3px;}
.hc{aspect-ratio:1;border-radius:3px;cursor:pointer;transition:transform .15s;}
.hc:hover{transform:scale(1.4);}
.h0{background:var(--bg3);}
.h1{background:rgba(92,224,198,.2);}
.h2{background:rgba(92,224,198,.45);}
.h3{background:rgba(92,224,198,.7);}
.h4{background:rgb(92,224,198);}

/* ── LEADERBOARD ── */
.lb-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;margin-bottom:5px;transition:all .15s;}
.lb-row:hover{background:rgba(255,255,255,.03);}
.lb-row.me{background:rgba(124,106,247,.1);border:1px solid rgba(124,106,247,.2);}
.lb-rank{font-size:13px;font-weight:800;width:26px;color:#50508a;}
.lb-rank.gold{color:var(--gold);}
.lb-rank.silver{color:#C0C0C0;}
.lb-rank.bronze{color:#CD7F32;}

/* ── RING ── */
.ring-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;}
.ring-lbl{position:absolute;font-weight:900;text-align:center;}

/* ── ANIMATIONS ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.fade-up{animation:fadeUp .35s ease forwards;}
.typing-dot{width:7px;height:7px;border-radius:50%;background:#7070a8;animation:pulse 1.2s infinite;}
.skeleton{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg4) 50%,var(--bg3) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}

/* ── UPCOMING ── */
.up-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.up-item:last-child{border-bottom:none;}
.up-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.up-info{flex:1;}
.up-name{font-size:13px;font-weight:700;margin-bottom:2px;}
.up-sub{font-size:11px;color:#6060a0;}
.up-days{font-size:13px;font-weight:800;text-align:right;}

/* ── ACHIEVEMENT ── */
.ach{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg3);border-radius:10px;margin-bottom:7px;}
.ach:not(.earned){opacity:.45;}
.ach-ic{font-size:26px;width:44px;height:44px;background:var(--bg2);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ach-name{font-size:13px;font-weight:800;margin-bottom:2px;}
.ach-desc{font-size:11px;color:#6060a0;}

/* RESPONSIVE */
@media(max-width:768px){
  .sidebar{display:none;}
  .g4{grid-template-columns:1fr 1fr;}
  .g3{grid-template-columns:1fr 1fr;}
  .g2{grid-template-columns:1fr;}
  .ob-grid{grid-template-columns:1fr;}
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
        <div style={{textAlign:"center",marginBottom:8}}>
          <img 
            src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" 
            alt="Study Space" 
            style={{width:110,height:110,objectFit:"contain",borderRadius:24}}
            onError={e=>{e.target.style.display="none";}}
          />
        </div>
        <div className="auth-sub" style={{fontWeight:800,fontSize:20,color:"var(--text)",WebkitTextFillColor:"var(--text)",marginBottom:2}}>Study Space</div>
        <div className="auth-sub">{mode === "login" ? "Welcome back — ready to study?" : "Join Victorian students getting better grades"}</div>

        {!configured && (
          <div style={{background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.25)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#c8b800",lineHeight:1.6}}>
            ⚠️ <strong>Demo mode</strong> — Supabase not connected yet.<br/>
            Email login will still work for testing. See the setup guide to enable real auth.
          </div>
        )}

        {/* Google */}
        <button className="auth-btn google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="auth-or">or use email</div>

        {!showMagic ? (
          <>
            {mode === "signup" && (
              <input className="auth-input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>
            )}
            <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e=>{setEmail(e.target.value);setError("");}}/>
            <input className="auth-input" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEmail()}/>

            {error && <div style={{fontSize:12,color:error.startsWith("✅")?"var(--a2)":"var(--a3)",marginBottom:10,padding:"8px 12px",background:error.startsWith("✅")?"rgba(92,224,198,.1)":"rgba(255,107,107,.1)",borderRadius:8}}>{error}</div>}

            <button className="btn btn-p btn-full" style={{padding:13}} onClick={handleEmail} disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            {mode === "login" && (
              <button className="auth-btn" style={{marginTop:8,border:"1px solid var(--border)"}} onClick={()=>setShowMagic(true)}>
                ✉️ Send magic link instead
              </button>
            )}
          </>
        ) : magicSent ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>✉️</div>
            <div style={{fontWeight:700,marginBottom:6}}>Magic link sent!</div>
            <div style={{fontSize:13,color:"#6060a0"}}>Check your email at <strong>{email}</strong> and click the link to sign in.</div>
            <button className="btn btn-g btn-sm" style={{marginTop:16}} onClick={()=>{setShowMagic(false);setMagicSent(false);}}>← Back</button>
          </div>
        ) : (
          <>
            <div style={{fontSize:13,color:"#7070a8",marginBottom:12}}>Enter your email and we'll send a one-click sign-in link. No password needed.</div>
            <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
            {error && <div style={{fontSize:12,color:"var(--a3)",marginBottom:8}}>{error}</div>}
            <button className="btn btn-p btn-full" style={{padding:12}} onClick={handleMagicLink} disabled={loading}>{loading?"Sending...":"Send Magic Link ✉️"}</button>
            <button className="btn btn-g btn-sm btn-full" style={{marginTop:8}} onClick={()=>setShowMagic(false)}>← Use password instead</button>
          </>
        )}

        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"#50508a"}}>
          {mode==="login" ? "No account? " : "Already registered? "}
          <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:700}} onClick={()=>{setMode(m=>m==="login"?"signup":"login");setError("");}}>
            {mode==="login" ? "Sign Up Free" : "Log In"}
          </span>
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"#30305a",lineHeight:1.6}}>
          By continuing you agree to our Terms & Privacy Policy.<br/>Designed for students aged 13+.
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
          <div key={o.id} className={`ob-opt${data.yearLevel===o.id?" sel":""}`} onClick={()=>setData(d=>({...d,yearLevel:o.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{o.icon}</span><span className="ob-opt-label">{o.label}</span></div>
            <div className="ob-opt-sub">{o.sub}</div>
          </div>
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
          <div key={p.id} className={`ob-opt${data.futurePath===p.id?" sel":""}`} onClick={()=>setData(d=>({...d,futurePath:p.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{p.icon}</span><span className="ob-opt-label">{p.label}</span></div>
            <div className="ob-opt-sub">{p.atar !== "—" ? `Typical ATAR: ${p.atar}` : "Portfolio / skills-based"}</div>
          </div>
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
          <div key={o.id} className={`ob-opt${data.hoursPerWeek===o.id?" sel":""}`} onClick={()=>setData(d=>({...d,hoursPerWeek:o.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{o.icon}</span><span className="ob-opt-label">{o.label}</span></div>
            <div className="ob-opt-sub">{o.hours} · {o.desc}</div>
          </div>
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
          <div key={o.id} className={`ob-opt${data.studyGoal===o.id?" sel":""}`} style={{padding:"12px 16px"}} onClick={()=>setData(d=>({...d,studyGoal:o.id}))}>
            <div className="ob-opt-top"><span className="ob-opt-icon">{o.icon}</span><span className="ob-opt-label">{o.label}</span></div>
          </div>
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
        Enter Study Space 🚀
      </button>
    </>
  );

  const steps = [step0, subjectStep, step2, step3, step4, step5];

  return (
    <div className="ob-wrap">
      <div className="ob-inner">
        <div className="ob-logo"><img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Space" style={{width:90,height:90,objectFit:"contain",borderRadius:20,marginBottom:4}}/></div>
        <div className="ob-tag" style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:2,WebkitTextFillColor:"var(--text)"}}>Study Space</div>
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
    try { return { ...defaultState, ...JSON.parse(localStorage.getItem(key) || "{}") }; }
    catch { return defaultState; }
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
    const oldMastery = s.masteryMap[subject] || 50;
    const newMastery = Math.min(100, Math.round(oldMastery * 0.7 + pct * 0.3));
    const masteryMap = { ...s.masteryMap, [subject]: newMastery };
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
    const subjects = profile?.selectedSubjects || [];
    if (!subjects.length) return profile?.yearLevel === "ib" ? "38/45" : "75.00";
    const masteries = subjects.map(sub => s.masteryMap[sub] || 50);
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
          {isIB?"IB Diploma":ALL_SUBJECTS[profile.yearLevel]?.label} · {profile.selectedSubjects?.length} subjects · {today.toLocaleDateString("en-AU",{weekday:"long",month:"long",day:"numeric"})}
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
            {profile.selectedSubjects?.slice(0,4).map(s=>{
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
              <button className="btn btn-p btn-full" onClick={()=>setScreen("quiz")}>🎯 Practice Quiz</button>
              <button className="btn btn-s btn-full" onClick={()=>setScreen("flashcards")}>🃏 Flashcards</button>
              <button className="btn btn-g btn-full" onClick={()=>setScreen("ai")}>✨ Ask Gemini AI Tutor</button>
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
async function callGemini(prompt, _apiKey) {
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

// ─────────────────────────────────────────────
// MATH CLEANER — converts LaTeX to readable text
// Applied to ALL AI-generated content before display
// ─────────────────────────────────────────────
function cleanMath(text) {
  if (!text) return text;
  return text
    // Remove $...$ LaTeX delimiters and convert contents
    .replace(/\$\$([^$]+)\$\$/g, (_, m) => convertLatex(m))
    .replace(/\$([^$\n]+)\$/g, (_, m) => convertLatex(m))
    // Common LaTeX commands outside of $ delimiters
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
    .replace(/\\gamma/g, 'γ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\cdot/g, '·')
    .replace(/\\circ/g, '°')
    // Superscripts
    .replace(/\^{([^}]+)}/g, (_, e) => e.split('').map(toSup).join(''))
    .replace(/\^2(?!\d)/g, '²')
    .replace(/\^3(?!\d)/g, '³')
    .replace(/\^n/g, 'ⁿ')
    .replace(/\^-1/g, '⁻¹')
    // Subscripts
    .replace(/_{([^}]+)}/g, (_, s) => s.split('').map(toSub).join(''))
    // Clean leftover backslashes
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/\\\\/g, '');
}

function toSup(c) {
  const map = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','x':'ˣ'};
  return map[c] || c;
}

function toSub(c) {
  const map = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎','n':'ₙ','x':'ₓ'};
  return map[c] || c;
}

function convertLatex(math) {
  return math
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√')
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
    .replace(/\\gamma/g, 'γ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\infty/g, '∞')
    .replace(/\\cdot/g, '·')
    .replace(/\^{([^}]+)}/g, (_, e) => e.split('').map(toSup).join(''))
    .replace(/\^2(?!\d)/g, '²')
    .replace(/\^3(?!\d)/g, '³')
    .replace(/_{([^}]+)}/g, (_, s) => s.split('').map(toSub).join(''))
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .trim();
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
// SUBJECTS SCREEN — Full curriculum-powered
// ─────────────────────────────────────────────
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

  const subjs = profile.selectedSubjects || [];
  const apiKey = localStorage.getItem("gemini_key");
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
    if (!apiKey) { setTopics(["Core Concepts","Key Skills","Assessment Prep","Exam Preparation"]); setTopicsLoading(false); return; }
    try {
      const prompt = `List exactly 6 topic areas for ${subject} in the ${curriculum} Australian curriculum. Return ONLY a JSON array of strings, no markdown: ["topic1","topic2",...]`;
      const raw = await callGemini(prompt, apiKey);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setTopics(Array.isArray(parsed) ? parsed : ["Core Concepts","Key Skills","Assessment Prep","Exam Preparation"]);
    } catch { setTopics(["Core Concepts","Key Skills","Assessment Prep","Exam Preparation"]); }
    setTopicsLoading(false);
  };

  const generateContent = async (type) => {
    if (!apiKey) { setContent("⚠️ Add your Gemini API key in the AI Tutor tab first."); return; }
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
      const raw = await callGemini(prompts[type], apiKey);
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

  // ── TOPIC STUDY VIEW ──
  if (sel && selTopic) {
    const color = getColor(sel);
    const parsedContent = (() => {
      if (!content) return null;
      try { return JSON.parse(content); } catch { return null; }
    })();

    return (
      <div className="content fade-up">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <button className="btn btn-g btn-sm" onClick={()=>setSelTopic(null)}>← Back</button>
          <div style={{width:3,height:24,background:color,borderRadius:2}}/>
          <div>
            <div style={{fontWeight:900,fontSize:18}}>{selTopic}</div>
            <div style={{fontSize:12,color:"#6060a0"}}>{sel} · {curriculum}</div>
          </div>
        </div>

        {/* Action tabs */}
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {[
            {id:"study",label:"📖 Study Notes",desc:"Detailed notes"},
            {id:"quiz",label:"🎯 Practice Quiz",desc:"5 exam questions"},
            {id:"flashcards",label:"🃏 Flashcards",desc:"8 revision cards"},
            {id:"notes",label:"📋 Revision Summary",desc:"Quick dot points"},
          ].map(t=>(
            <button key={t.id} className="btn btn-sm"
              style={{background:activeTab===t.id?color:"var(--bg3)",color:activeTab===t.id?"#fff":"#7070a8",border:`1px solid ${activeTab===t.id?color:"var(--border)"}`}}
              onClick={()=>generateContent(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        {contentLoading ? (
          <div className="card" style={{textAlign:"center",padding:"48px"}}>
            <div style={{fontSize:32,marginBottom:12}}>✨</div>
            <div style={{fontWeight:700,marginBottom:6}}>Generating {activeTab} for {selTopic}...</div>
            <div style={{color:"#6060a0",fontSize:13,marginBottom:16}}>Using official {curriculum} curriculum as source</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {[0,.2,.4].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}
            </div>
          </div>
        ) : content ? (
          <div>
            {/* Study notes or revision summary */}
            {(activeTab==="study"||activeTab==="notes") && !parsedContent && (
              <div className="card">
                <div className="ch">
                  <div className="ct">{activeTab==="study"?"📖 Study Notes":"📋 Revision Summary"} — {selTopic}</div>
                  <span className="tag tag-a">{curriculum}</span>
                </div>
                <div className="cb">
                  <MarkdownRenderer content={content}/>
                </div>
              </div>
            )}

            {/* Inline quiz */}
            {activeTab==="quiz" && parsedContent && Array.isArray(parsedContent) && (
              <InlineQuiz questions={parsedContent} subject={sel} gs={gs}/>
            )}

            {/* Inline flashcards */}
            {activeTab==="flashcards" && parsedContent && Array.isArray(parsedContent) && (
              <InlineFlashcards cards={parsedContent} subject={sel}/>
            )}
          </div>
        ) : (
          <div className="card" style={{textAlign:"center",padding:"48px"}}>
            <div style={{fontSize:48,marginBottom:12}}>👆</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Choose what to generate</div>
            <div style={{color:"#6060a0",fontSize:13}}>Select Study Notes, Quiz, Flashcards or Revision Summary above</div>
          </div>
        )}
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
                <div key={s} className="subj-card" onClick={()=>loadTopics(s)} style={{paddingTop:20}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:getColor(s)}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:getColor(s),textTransform:"uppercase",letterSpacing:".05em"}}>{profile.yearLevel?.toUpperCase()}</div>
                      {hasVCAA && <div style={{fontSize:9,color:"#50508a",marginTop:2}}>✅ VCAA curriculum loaded</div>}
                    </div>
                    <Ring val={mastery} size={44} stroke={4} color={getColor(s)}/>
                  </div>
                  <div className="sn">{s}</div>
                  {myTopic && <div style={{fontSize:10,color:getColor(s),marginTop:4,fontWeight:600}}>📍 {myTopic}</div>}
                  <div className="mb" style={{marginTop:8,height:5}}>
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
  const [selSubj, setSelSubj] = useState(profile.selectedSubjects?.[0] || "");
  const apiKey = localStorage.getItem("gemini_key");

  const generateQuiz = async (subject) => {
    setLoading(true); setError(""); setQuestions([]);
    setQi(0); setSel(null); setAnswered(false); setScore(0); setDone(false); setResults([]);

    if(!apiKey) { setError("Add your Gemini API key in the AI Tutor tab first."); setLoading(false); return; }

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

      const raw = await callGemini(prompt, apiKey);
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      if(!Array.isArray(parsed) || parsed.length===0) throw new Error("Bad response");
      setQuestions(parsed);
    } catch(e) {
      setError("Couldn't generate questions. Check your Gemini API key in the AI Tutor tab.");
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
      {profile.selectedSubjects?.map(s=>(
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
  const [selSubj, setSelSubj] = useState(profile?.selectedSubjects?.[0] || "");
  const apiKey = localStorage.getItem("gemini_key");

  const generateCards = async (subject) => {
    setLoading(true); setError(""); setCards([]);
    setIdx(0); setFlipped(false); setKnown([]); setRev([]); setDone(false);
    if(!apiKey){ setError("Add your Gemini API key in the AI Tutor tab first."); setLoading(false); return; }
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
      const raw = await callGemini(prompt, apiKey);
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
      {profile?.selectedSubjects?.map(s=>(
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

  const [msgs, setMsgs] = useState([
    {role:"ai", text:`Hey ${firstName}! 👋 I'm your Gemini AI tutor — powered by Google's Gemini 2.0 Flash.\n\nI know you're studying ${profile.selectedSubjects?.slice(0,3).join(", ")}${profile.selectedSubjects?.length > 3 ? ` and ${profile.selectedSubjects.length - 3} more` : ""} in ${curriculum}.\n\nAsk me anything — concept explanations, practice questions, essay feedback, exam strategies, or "help me understand [topic]". What are we working on today?`}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const systemPrompt = `You are an expert tutor for Australian secondary students specialising in ${curriculum}.

Student profile:
- Year level: ${profile.yearLevel || "VCE"}
- Subjects: ${profile.selectedSubjects?.join(", ") || "General"}
- Future goal: ${profile.futurePath || "Not specified"}
- Study intensity: ${profile.hoursPerWeek || "moderate"}

OFFICIAL VCAA CURRICULUM CONTENT YOU MUST USE:
${profile.selectedSubjects?.slice(0,3).map(s => {
  const data = VCAA_CURRICULUM[s];
  if (!data) return `${s}: General ${curriculum} curriculum`;
  return `${s} (${data.assessmentType}):\n${data.areas.map(a => `  ${a.name}: ${a.dotPoints.slice(0,3).join("; ")}`).join("\n")}`;
}).join("\n\n")}

Rules:
- Use Australian English spellings
- Be warm, encouraging, and direct like a great private tutor
- Give VCAA-specific examples relevant to SAC and exam assessment
- Reference specific dot points from the curriculum above when relevant
- Use **bold** for key terms and bullet points for lists
- Keep responses concise but thorough
- Write all maths in plain readable text: use ², ³, √, ×, ÷, ≤, ≥, π, Δ — NOT LaTeX ($...$)
- If asked for practice questions, make them genuine exam-style with mark allocations`;

  const sugs = [
    ...(profile.selectedSubjects?.slice(0,3).map(s => `Explain a key concept in ${s}`) || []),
    "Give me practice exam questions",
    "Help me write a study plan",
    `What do I need for ${profile.futurePath === "medicine" ? "Medicine" : profile.futurePath === "law" ? "Law" : profile.futurePath === "engineering" ? "Engineering" : "my chosen career"}?`,
  ];

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const updatedMsgs = [...msgs, {role:"user", text:msg}];
    setMsgs(updatedMsgs);
    setLoading(true);

    try {
      const contents = updatedMsgs.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      const data = await res.json();

      if (data.error) {
        setMsgs(m=>[...m, {role:"ai", text:`⚠️ ${data.error}`}]);
        setLoading(false);
        return;
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I couldn't generate a response. Please try again.";
      setMsgs(m=>[...m, {role:"ai", text:reply}]);
    } catch(e) {
      setMsgs(m=>[...m, {role:"ai", text:"⚠️ Connection error. Please check your internet and try again."}]);
    }
    setLoading(false);
  }, [input, msgs, loading, systemPrompt]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, loading]);

  return (
    <div className="chat-wrap">
      <div className="chat-msgs">
        {msgs.map((m,i)=>(
          <div key={i} className={`msg ${m.role} fade-up`}>
            <div className={`m-av ${m.role==="ai"?"m-ai-av":"m-u-av"}`}>{m.role==="ai"?"✨":(profile.userName?.[0]||"Y")}</div>
            <div className="m-bub" style={{whiteSpace:"pre-wrap"}}>{m.text}</div>
          </div>
        ))}
        {loading&&<TypingIndicator/>}
        <div ref={bottomRef}/>
      </div>
      <div className="chat-in-area">
        <div className="chat-sug-row">
          {sugs.map(s=><button key={s} className="sug" onClick={()=>send(s)}>{s}</button>)}
        </div>
        <div className="chat-row">
          <textarea className="chat-inp" rows={2}
            placeholder={`Ask Gemini anything about ${profile.selectedSubjects?.[0] || "your subjects"}...`}
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}/>
          <button className="btn btn-p" onClick={()=>send()} style={{alignSelf:"flex-end",padding:"10px 14px"}}>↑</button>
        </div>
        <div style={{fontSize:10,color:"#40406a"}}>✨ Powered by Google Gemini 2.0 Flash · Curriculum-grounded for {curriculum}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PLANNER
// ─────────────────────────────────────────────
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

  const subjs = profile.selectedSubjects || [];
  const [goals, setGoals] = useState(()=>{ try{return JSON.parse(localStorage.getItem("ss_goals")||"[]");}catch{return [];} });
  const [newGoal, setNewGoal] = useState("");
  const [timer, setTimer] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [genPlan, setGenPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState("");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({title:"",subject:subjs[0]||"",date:"",type:"SAC"});
  const apiKey = localStorage.getItem("gemini_key");

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
    if(!apiKey){ setAiPlan("Add your Gemini API key in the AI Tutor tab to generate a personalised study plan."); setGenPlan(false); return; }
    try {
      const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label;
      const prompt = `Create a focused weekly study plan for a ${curriculum} student.
Subjects: ${subjs.join(", ")}
Study intensity: ${profile.hoursPerWeek||"moderate"}
Goal: ${profile.futurePath||"academic success"}

Write a practical 7-day plan with specific daily tasks. Keep it concise, motivating, and realistic. Use Australian curriculum context.`;
      const res = await callGemini(prompt, apiKey);
      setAiPlan(res);
    } catch { setAiPlan("Couldn't generate plan. Check your Gemini key."); }
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
  const subjMastery = profile.selectedSubjects?.map(s=>({
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

  // ATAR breakdown
  const targetATAR = {medicine:99,law:95,engineering:90,cs:85,business:80,arts_hum:70,science:85,education:65,creative:60}[profile.futurePath]||75;
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
            <div style={{fontSize:12,color:"#7070a8",background:"var(--bg3)",borderRadius:8,padding:"10px 14px"}}>
              💡 Your ATAR prediction improves as you complete quizzes and raise your subject mastery scores. Take more quizzes to get a more accurate prediction.
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
                <div style={{color:"#50508a",fontSize:13}}>Take quizzes to identify your weak areas!</div>
              ) : subjMastery.sort((a,b)=>a.mastery-b.mastery).slice(0,3).map((s,i)=>(
                <div key={s.name} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12,fontWeight:600}}>
                    <span>{s.name}</span><span style={{fontWeight:700,color:"var(--a3)"}}>{s.mastery}%</span>
                  </div>
                  <div className="mb" style={{height:6}}><div className="mf" style={{width:`${s.mastery}%`,background:"var(--a3)"}}/></div>
                </div>
              ))}
              <button className="btn btn-p btn-sm btn-full" style={{marginTop:4}}>✨ AI Study Plan for Weak Areas</button>
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
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [stage, setStage] = useState("loading");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("dashboard");

  // Game state — only init when we have a profile
  const gs = useGameState(profile || {});

  // Update sidebar XP display from real gs
  const xpPct = profile ? ((gs.state.xp % 500) / 500) * 100 : 0;

  // ── On mount: check for existing session or OAuth callback ──
  useEffect(() => {
    const init = async () => {

      // Helper to normalise profile from DB (snake_case) to app format (camelCase)
      const normaliseProfile = (saved, userName) => ({
        yearLevel: saved.year_level || saved.yearLevel,
        selectedSubjects: saved.selected_subjects || saved.selectedSubjects || [],
        futurePath: saved.future_path || saved.futurePath,
        hoursPerWeek: saved.hours_per_week || saved.hoursPerWeek,
        studyGoal: saved.study_goal || saved.studyGoal,
        userName: saved.display_name || userName,
        email: saved.email,
      });

      // Always check localStorage first — fastest path
      const localProfile = (() => {
        try { return JSON.parse(localStorage.getItem("ss_profile") || "null"); } catch { return null; }
      })();

      // 1. Handle OAuth redirect callback
      if (window.location.hash.includes("access_token")) {
        const session = await supabase.auth.handleCallback();
        if (session?.access_token) {
          const u = {
            name: session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Student",
            email: session.user?.email,
            provider: "google",
            session,
            userId: session.user?.id,
          };
          setUser(u);
          // Try Supabase first, fall back to localStorage
          try {
            const saved = await supabase.loadProfile(session.user?.id, session.access_token);
            if (saved?.year_level || saved?.yearLevel) {
              const p = normaliseProfile(saved, u.name);
              setProfile(p);
              localStorage.setItem("ss_profile", JSON.stringify(p));
              setStage("app");
              return;
            }
          } catch {}
          // Check localStorage backup
          if (localProfile?.yearLevel) {
            setProfile({ ...localProfile, userName: u.name });
            setStage("app");
            return;
          }
          setStage("onboarding");
          return;
        }
      }

      // 2. Check localStorage for existing session
      const session = supabase.auth.getSession();
      if (session?.access_token && session?.user) {
        const u = {
          name: session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Student",
          email: session.user?.email,
          provider: session.user?.app_metadata?.provider || "email",
          session,
          userId: session.user?.id,
        };
        setUser(u);
        // Check localStorage first (instant)
        if (localProfile?.yearLevel) {
          setProfile({ ...localProfile, userName: u.name });
          setStage("app");
          return;
        }
        // Try Supabase
        try {
          const saved = await supabase.loadProfile(session.user?.id, session.access_token);
          if (saved?.year_level || saved?.yearLevel) {
            const p = normaliseProfile(saved, u.name);
            setProfile(p);
            localStorage.setItem("ss_profile", JSON.stringify(p));
            setStage("app");
            return;
          }
        } catch {}
        setStage("onboarding");
        return;
      }

      // 3. No session — show auth
      setStage("auth");
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

  const handleSignOut = () => {
    supabase.auth.signOut();
    localStorage.removeItem("ss_profile");
    setStage("auth");
    setUser(null);
    setProfile(null);
  };

  const NAV = [
    {id:"dashboard",icon:"⊞",label:"Dashboard"},
    {id:"subjects",icon:"📚",label:"Subjects"},
    {id:"quiz",icon:"🎯",label:"Practice Quiz"},
    {id:"flashcards",icon:"🃏",label:"Flashcards"},
    {id:"ai",icon:"✨",label:"Gemini AI Tutor",badge:"FREE"},
    {id:"planner",icon:"📅",label:"Study Planner"},
    {id:"analytics",icon:"📊",label:"Analytics"},
  ];
  const TITLES = {dashboard:"Dashboard",subjects:"My Subjects",quiz:"Practice Quiz",flashcards:"Flashcards",ai:"Gemini AI Tutor",planner:"Study Planner",analytics:"Analytics"};

  // ── Loading screen ──
  if (stage === "loading") return (
    <>
      <style>{css}</style>
      <div style={{position:"fixed",inset:0,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
        <img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Space" style={{width:100,height:100,objectFit:"contain",borderRadius:22,marginBottom:16}}/>
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
    dashboard: <Dashboard profile={profile} setScreen={setScreen} gs={gs}/>,
    subjects:  <SubjectsScreen profile={profile} gs={gs}/>,
    quiz:      <QuizScreen profile={profile} gs={gs}/>,
    flashcards:<FlashcardsScreen profile={profile}/>,
    ai:        <AIScreen profile={profile}/>,
    planner:   <PlannerScreen profile={profile} gs={gs}/>,
    analytics: <AnalyticsScreen profile={profile} gs={gs}/>,
  };

  const isIB = profile?.yearLevel === "ib";
  const yearLabel = isIB ? "IB Diploma" : ALL_SUBJECTS[profile?.yearLevel]?.label || "VCE";
  const providerIcon = { google:"G", apple:"", email:"✉" }[user?.provider] || "Y";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="logo" style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="https://raw.githubusercontent.com/iygyfuo6yf/study-space/main/logo.png" alt="Study Space" style={{width:38,height:38,objectFit:"contain",borderRadius:10,flexShrink:0}}/>
            <div>
              <div style={{fontSize:16,fontWeight:900,background:"linear-gradient(135deg,#7C6AF7,#5CE0C6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.2}}>Study Space</div>
              <span className="logo-sub">Victorian Education · Years 9–12</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-lbl">Learn</div>
            {NAV.slice(0,5).map(n=>(
              <div key={n.id} className={`ni${screen===n.id?" active":""}`} onClick={()=>setScreen(n.id)}>
                <span className="ni-icon">{n.icon}</span>{n.label}
                {n.badge&&<span className={`ni-badge${n.badge==="FREE"?" new":""}`}>{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="nav-section" style={{marginTop:8}}>
            <div className="nav-lbl">Track</div>
            {NAV.slice(5).map(n=>(
              <div key={n.id} className={`ni${screen===n.id?" active":""}`} onClick={()=>setScreen(n.id)}>
                <span className="ni-icon">{n.icon}</span>{n.label}
              </div>
            ))}
          </div>

          <div className="nav-section" style={{marginTop:8}}>
            <div className="nav-lbl">Community</div>
            {[{icon:"👥",label:"Study Groups"},{icon:"🏆",label:"Leaderboard"},{icon:"🛒",label:"Tutor Marketplace"}].map(n=>(
              <div key={n.label} className="ni"><span className="ni-icon">{n.icon}</span>{n.label}</div>
            ))}
          </div>

          <div className="sb-bottom">
            <div className="xp-row">
              <div className="xp-lbl"><span>Level {gs.state.level||1} · {(gs.state.xp||0).toLocaleString()} XP</span><span>{500-((gs.state.xp||0)%500)} to next</span></div>
              <div className="xp-track"><div className="xp-fill" style={{width:`${xpPct}%`}}/></div>
            </div>
            <div className="user-row" title="Click to sign out" onClick={handleSignOut}>
              <div className="av">{(profile?.userName||user?.name||"Y")[0].toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="u-name">{profile?.userName || user?.name || "Student"}</div>
                <div className="u-sub">{yearLabel} · {user?.provider === "google" ? "Google" : "Email"}</div>
              </div>
              <span style={{color:"#50508a",fontSize:11,fontWeight:600}}>Sign out</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{TITLES[screen]}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div className="chip chip-fire">🔥 {gs.state.streak||0} days</div>
              <div className="chip chip-xp">⚡ {(gs.state.xp||0).toLocaleString()} XP</div>
              <div className="icon-btn">🔔</div>
              <div className="icon-btn">🔍</div>
            </div>
          </div>
          {SCREENS[screen]}
        </div>
      </div>
    </>
  );
}
