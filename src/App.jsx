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
        <div className="auth-logo">Study Space</div>
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
        <div className="ob-logo">Study Space</div>
        <div className="ob-tag">Victorian Education Platform · Years 9–12 · Years 9–12</div>
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
// SUBJECTS SCREEN
// ─────────────────────────────────────────────
function SubjectsScreen({ profile }) {
  const [sel, setSel] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const subjs = profile.selectedSubjects || [];
  const apiKey = localStorage.getItem("gemini_key");

  const loadTopics = async (subject) => {
    setSel(subject); setTopicsLoading(true); setTopics([]);
    if(!apiKey){ setTopics(["Core Concepts","Key Skills","Assessment Prep","Past Paper Practice","Revision Summary"]); setTopicsLoading(false); return; }
    try {
      const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label||"Year 9";
      const prompt = `List the 6 most important topic areas for ${subject} in the ${curriculum} Australian curriculum. Return ONLY a JSON array of strings, no markdown: ["topic1","topic2",...]`;
      const raw = await callGemini(prompt, apiKey);
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setTopics(Array.isArray(parsed)?parsed:["Core Concepts","Key Skills","Assessment Prep","Past Paper Practice","Revision Summary","Exam Prep"]);
    } catch{ setTopics(["Core Concepts","Key Skills","Assessment Prep","Past Paper Practice","Revision Summary","Exam Prep"]); }
    setTopicsLoading(false);
  };

  // Subject detail view
  if (sel) {
    const color = getColor(sel);
    const mastery = Math.floor(55+Math.random()*35);
    return (
      <div className="content fade-up">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <button className="btn btn-g btn-sm" onClick={()=>setSel(null)}>← Back</button>
          <div style={{width:4,height:32,background:color,borderRadius:2}}/>
          <div>
            <div style={{fontWeight:900,fontSize:20}}>{sel}</div>
            <div style={{color:"#6060a0",fontSize:12}}>{profile.yearLevel?.toUpperCase()} · {ALL_SUBJECTS[profile.yearLevel]?.label}</div>
          </div>
          <Ring val={mastery} size={56} stroke={5} color={color}/>
        </div>

        {topicsLoading ? (
          <div className="card" style={{textAlign:"center",padding:"40px"}}>
            <div style={{fontSize:24,marginBottom:12}}>✨</div>
            <div style={{fontWeight:700,marginBottom:6}}>Loading {sel} topics...</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
              {[0,.2,.4].map(d=><div key={d} className="typing-dot" style={{animationDelay:`${d}s`}}/>)}
            </div>
          </div>
        ) : (
          <div className="g3" style={{marginBottom:18}}>
            {topics.map((topic,i)=>(
              <div key={i} className="card" style={{padding:18,cursor:"pointer",borderTop:`3px solid ${color}`}}>
                <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>{topic}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                  <span className="tag tag-a">Notes</span>
                  <span className="tag tag-g">Quiz</span>
                  <span className="tag tag-r">Flashcards</span>
                </div>
                <div className="mb" style={{height:6}}>
                  <div className="mf" style={{width:`${30+Math.random()*65}%`,background:color}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <div className="ch"><div className="ct">📝 Assessment Prep</div></div>
          <div className="cb">
            <div className="g3">
              {["SAC Practice","Exam Questions","Past Papers","Study Guide","Video Lessons","Ask Gemini AI"].map((r,i)=>(
                <button key={i} className="btn btn-s" style={{justifyContent:"flex-start"}}>
                  {["📋","🎯","📄","📖","🎬","✨"][i]} {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group subjects by category
  const vceGroups = ALL_SUBJECTS.vce.groups;
  const ibGroups = ALL_SUBJECTS.ib.groups;
  const grouped = {};

  if (profile.yearLevel === "vce") {
    Object.entries(vceGroups).forEach(([g, ss]) => {
      const mine = ss.filter(s => subjs.includes(s));
      if (mine.length) grouped[g] = mine;
    });
  } else if (profile.yearLevel === "ib") {
    Object.entries(ibGroups).forEach(([g, ss]) => {
      const mine = ss.filter(s => subjs.includes(s));
      if (mine.length) grouped[g] = mine;
    });
  } else {
    grouped["My Subjects"] = subjs;
  }

  return (
    <div className="content fade-up">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontWeight:900,fontSize:22}}>My Subjects</div>
          <div style={{color:"#6060a0",fontSize:13,marginTop:3}}>{subjs.length} subjects · {ALL_SUBJECTS[profile.yearLevel]?.label}</div>
        </div>
        <button className="btn btn-p btn-sm">+ Add Subject</button>
      </div>
      {Object.entries(grouped).map(([group,ss])=>(
        <div key={group} style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:800,color:"#50508a",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>{group}</div>
          <div className="g3">
            {ss.map(s=>{
              const m=Math.floor(50+Math.random()*45);
              return (
                <div key={s} className="subj-card" onClick={()=>loadTopics(s)} style={{paddingTop:20}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:getColor(s)}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:getColor(s),textTransform:"uppercase",letterSpacing:".05em"}}>{profile.yearLevel?.toUpperCase()}</div>
                    <Ring val={m} size={44} stroke={4} color={getColor(s)}/>
                  </div>
                  <div className="sn">{s}</div>
                  <div className="mb" style={{marginTop:10,height:5}}>
                    <div className="mf" style={{width:`${m}%`,background:getColor(s)}}/>
                  </div>
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
      const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label||"Year 9";
      const prompt = `You are a ${curriculum} exam question generator for Australian students.

Generate exactly 6 multiple choice questions for: ${subject} (${curriculum})
Student year: ${profile.yearLevel}, Future goal: ${profile.futurePath||"general"}

Rules:
- Questions must be genuine ${curriculum} exam style with correct difficulty
- Each question has exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Include a clear explanation for the correct answer
- Use Australian curriculum content and spelling

Respond ONLY with valid JSON, no markdown, no backticks:
[
  {
    "subject": "${subject}",
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "why this is correct"
  }
]`;

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
          <div style={{fontWeight:700,fontSize:16,lineHeight:1.5,marginBottom:22}}>{q.question}</div>
          {q.options?.map((opt,i)=>{
            let cls="qopt";
            if(answered){cls+=" qdis";if(i===q.correct)cls+=" qcor";else if(i===sel)cls+=" qwrg";}
            return (
              <div key={i} className={cls} onClick={()=>choose(i)}>
                <div className="ql" style={answered&&i===q.correct?{background:"rgba(92,224,198,.2)",color:"var(--a2)"}:answered&&i===sel?{background:"rgba(255,107,107,.2)",color:"var(--a3)"}:{}}>{String.fromCharCode(65+i)}</div>
                {opt}
                {answered&&i===q.correct&&<span style={{marginLeft:"auto",color:"var(--a2)"}}>✓</span>}
                {answered&&i===sel&&i!==q.correct&&<span style={{marginLeft:"auto",color:"var(--a3)"}}>✗</span>}
              </div>
            );
          })}
          {answered&&<div className="qexp fade-up"><strong style={{color:"var(--a2)"}}>💡 </strong>{q.explanation}</div>}
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
      const curriculum = profile.yearLevel==="ib"?"IB Diploma":profile.yearLevel==="vce"?"VCE":ALL_SUBJECTS[profile.yearLevel]?.label||"Year 9";
      const prompt = `Generate 10 spaced-repetition flashcards for ${subject} (${curriculum}) Australian curriculum.

Focus on key concepts, definitions, formulas, and exam-relevant content.
Make the questions concise and answers clear but complete.

Respond ONLY with valid JSON, no markdown, no backticks:
[
  {"q": "question text", "a": "answer text", "subject": "${subject}"}
]`;
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
              <div className="fc-q">{card.q}</div>
              <div className="fc-hint">Tap to reveal</div>
            </div>
            <div className="fc-face fc-back">
              <div className="fc-sub" style={{color:"var(--a2)"}}>Answer</div>
              <div className="fc-a">{card.a}</div>
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [keySet, setKeySet] = useState(() => !!localStorage.getItem("gemini_key"));
  const [keyError, setKeyError] = useState("");

  const firstName = profile.userName?.split(" ")[0] || "there";
  const curriculum = profile.yearLevel === "ib" ? "IB Diploma" : profile.yearLevel === "vce" ? "VCE" : ALL_SUBJECTS[profile.yearLevel]?.label || "Victorian secondary";

  const [msgs, setMsgs] = useState([
    {role:"ai", text:`Hey ${firstName}! 👋 I'm your Gemini AI tutor — powered by Google's Gemini 2.0 Flash (free tier).\n\nI know you're studying ${profile.selectedSubjects?.slice(0,3).join(", ")}${profile.selectedSubjects?.length > 3 ? ` and ${profile.selectedSubjects.length - 3} more` : ""} in ${curriculum}.\n\nAsk me anything — concept explanations, practice questions, essay feedback, exam strategies, or "help me understand [topic]". What are we working on today?`}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith("AIza") || k.length < 30) {
      setKeyError("That doesn't look like a valid Gemini API key. It should start with 'AIza'.");
      return;
    }
    localStorage.setItem("gemini_key", k);
    setApiKey(k);
    setKeySet(true);
    setKeyError("");
  };

  const clearKey = () => {
    localStorage.removeItem("gemini_key");
    setApiKey(""); setKeyInput(""); setKeySet(false);
  };

  const systemPrompt = `You are an expert tutor for Australian secondary students specialising in ${curriculum}. 

Student profile:
- Year level: ${profile.yearLevel || "VCE"}  
- Subjects: ${profile.selectedSubjects?.join(", ") || "General"}
- Future goal: ${profile.futurePath || "Not specified"}
- Study intensity: ${profile.hoursPerWeek || "moderate"}

Your expertise covers:
- VCE Study Designs (VCAA) for ALL subjects — SAC formats, exam structure, assessment criteria
- IB Diploma curriculum — all 6 Groups, TOK, Extended Essay, CAS, Internal Assessments
- Australian Year 9-10 curriculum
- ATAR calculation, scaling, subject selection strategy
- Study techniques, exam strategy, time management

Rules:
- Use Australian English spellings (colour, practise, programme, etc.)
- Be warm, encouraging, and direct — like a great private tutor
- Give curriculum-specific examples relevant to VCE/IB assessment
- Use **bold** for key terms and bullet points for lists
- Keep responses concise but thorough — aim for quality over length
- If asked for practice questions, make them genuine exam-style questions with mark allocations`;

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
      // Build Gemini contents array — system prompt as first user turn (Gemini Flash supports systemInstruction)
      const contents = updatedMsgs.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      const data = await res.json();

      if (data.error) {
        const errMsg = data.error.message || "API error";
        if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("invalid")) {
          setKeySet(false);
          setMsgs(m=>[...m, {role:"ai", text:"⚠️ Your API key seems invalid or expired. Please re-enter it below."}]);
        } else {
          setMsgs(m=>[...m, {role:"ai", text:`⚠️ Gemini error: ${errMsg}`}]);
        }
        setLoading(false);
        return;
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I couldn't generate a response. Please try again.";

      setMsgs(m=>[...m, {role:"ai", text:reply}]);
    } catch(e) {
      setMsgs(m=>[...m, {role:"ai", text:"⚠️ Couldn't reach Gemini. Check your internet connection and try again.\n\nQuick tip while you wait: For VCE exams, always identify the **command term** in the question ('describe', 'explain', 'analyse', 'evaluate') — each requires a different type of response and carries different marks."}]);
    }
    setLoading(false);
  }, [input, msgs, loading, apiKey, systemPrompt]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, loading]);

  // ── API KEY SETUP SCREEN ──
  if (!keySet) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"calc(100vh - 65px)",padding:24}}>
      <div style={{width:"100%",maxWidth:480}}>
        <div className="card fade-up">
          <div className="cb" style={{padding:32}}>
            {/* Gemini logo area */}
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:48,marginBottom:8}}>✨</div>
              <div style={{fontWeight:900,fontSize:22,marginBottom:4}}>Connect Gemini AI Tutor</div>
              <div style={{fontSize:13,color:"#6060a0",lineHeight:1.6}}>
                Powered by Google Gemini 2.0 Flash — <strong style={{color:"var(--a2)"}}>free to use</strong> with a Google AI Studio key.
              </div>
            </div>

            {/* Steps */}
            <div style={{background:"var(--bg3)",borderRadius:12,padding:18,marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:800,color:"#50508a",marginBottom:12,letterSpacing:".06em"}}>HOW TO GET YOUR FREE KEY</div>
              {[
                {n:"1",text:"Go to ", link:"aistudio.google.com/apikey", url:"https://aistudio.google.com/apikey"},
                {n:"2",text:"Sign in with your Google account"},
                {n:"3",text:"Click \"Create API key\" → copy it"},
                {n:"4",text:"Paste it below — free tier gives 1,500 requests/day"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<3?10:0}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(124,106,247,.2)",color:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{s.n}</div>
                  <div style={{fontSize:13,color:"#9090c0",lineHeight:1.5}}>
                    {s.text}
                    {s.link && <a href={s.url} target="_blank" rel="noreferrer" style={{color:"var(--a2)",fontWeight:700,textDecoration:"none"}}>{s.link} ↗</a>}
                  </div>
                </div>
              ))}
            </div>

            <input
              className="auth-input"
              type="password"
              placeholder="Paste your Gemini API key (AIza...)"
              value={keyInput}
              onChange={e=>{setKeyInput(e.target.value);setKeyError("");}}
              onKeyDown={e=>e.key==="Enter"&&saveKey()}
              style={{marginBottom:keyError?8:12,fontSize:13}}
            />
            {keyError && <div style={{fontSize:12,color:"var(--a3)",marginBottom:10,padding:"8px 12px",background:"rgba(255,107,107,.1)",borderRadius:8}}>{keyError}</div>}

            <button className="btn btn-p btn-full" style={{padding:13}} onClick={saveKey}>
              ✨ Connect Gemini — Start Tutoring
            </button>

            <div style={{marginTop:14,fontSize:11,color:"#40406a",textAlign:"center",lineHeight:1.6}}>
              Your key is stored only in your browser's local storage.<br/>
              It never leaves your device or gets sent to our servers.
            </div>
          </div>
        </div>

        {/* Free tier info */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
          {[
            {icon:"🆓",label:"Free Tier",val:"1,500 req/day"},
            {icon:"⚡",label:"Model",val:"Gemini 2.0 Flash"},
            {icon:"🔒",label:"Privacy",val:"Key stays local"},
          ].map((f,i)=>(
            <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{f.icon}</div>
              <div style={{fontSize:10,fontWeight:800,color:"#50508a",marginBottom:2}}>{f.label}</div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--a2)"}}>{f.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CHAT SCREEN ──
  return (
    <div className="chat-wrap">
      <div className="chat-msgs">
        {msgs.map((m,i)=>(
          <div key={i} className={`msg ${m.role} fade-up`}>
            <div className={`m-av ${m.role==="ai"?"m-ai-av":"m-u-av"}`}>{m.role==="ai"?"✨":"Y"}</div>
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
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:10,color:"#40406a"}}>✨ Powered by Google Gemini 2.0 Flash · Free tier · Curriculum-grounded for {curriculum}</div>
          <button onClick={clearKey} style={{background:"none",border:"none",fontSize:10,color:"#40406a",cursor:"pointer",textDecoration:"underline"}}>Change key</button>
        </div>
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
      // 1. Handle OAuth redirect callback (Google sends back #access_token=...)
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
          // Try to load saved profile
          const saved = await supabase.loadProfile(session.user?.id, session.access_token);
          if (saved?.yearLevel) {
            setProfile({ ...saved, userName: u.name });
            setStage("app");
          } else {
            setStage("onboarding");
          }
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
        // Try to load saved profile from DB
        try {
          const saved = await supabase.loadProfile(session.user?.id, session.access_token);
          if (saved?.yearLevel) {
            setProfile({ ...saved, userName: u.name });
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
    // If they have a session (real Supabase auth), try to load existing profile
    if (u.session?.access_token && u.userId) {
      try {
        const saved = await supabase.loadProfile(u.userId, u.session.access_token);
        if (saved?.yearLevel) {
          setProfile({ ...saved, userName: u.name });
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
        console.warn("Profile save failed:", e);
      }
    }
    setStage("app");
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
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
        <div style={{fontWeight:900,fontSize:28,background:"linear-gradient(135deg,#7C6AF7,#5CE0C6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Study Space</div>
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
    subjects:  <SubjectsScreen profile={profile}/>,
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
          <div className="logo">Study Space<span className="logo-sub">Victorian Education Platform · Years 9–12</span></div>

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
