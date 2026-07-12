/* ═══════════════════════════════════════════════════════════
   เสพซาวด์ STUDIO v2 — core: state, storage, AI layer, helpers
   Pipeline: IDEA → SCRIPTED → CUT PLAN → READY → ON AIR
   ═══════════════════════════════════════════════════════════ */

"use strict";

var KEY_V2 = "sapsound-studio-v2";
var KEY_V1 = "sapsound-studio-v1";
var DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

var STATUS = {
  idea:      { label: "IDEA",      color: "var(--dim)" },
  scripted:  { label: "SCRIPTED",  color: "var(--amber)" },
  blueprint: { label: "CUT PLAN",  color: "var(--steel)" },
  ready:     { label: "READY",     color: "var(--blood)" },
  posted:    { label: "ON AIR",    color: "var(--moss)" },
};

var DEFAULT_SETTINGS = {
  seriesName: "เพลงนี้มีเรื่อง",
  openingLine: "เพลงนี้เกิดจากเรื่องจริงที่คุณอาจไม่อยากเชื่อ...",
  styleDNA: {
    tone: "เล่าแบบสารคดีสืบสวน เสียงต่ำ จริงจัง มีจังหวะหยุดให้คนอึ้ง",
    visual: "ฟุตเทจเก่า ภาพหยาบ ขาวดำสลับสี ตัวหนังสือใหญ่กลางจอ",
    avoid: "มุกตลก คำหยาบรุนแรง การเดาข้อเท็จจริงที่ไม่มีหลักฐาน",
  },
  brandKit: null,
  house: {
    name: "SAVESOUND PRODUCTION",
    tagline: "เล่าเรื่องให้คนหยุดดู",
    contact: "LINE: @savesound · โทร 08x-xxx-xxxx",
  },
};

/* ---------- state ---------- */
var state = {
  tab: "hq",
  sel: null,          // selected episode id
  selClient: null,    // selected client id
  episodes: [],
  clients: [],
  learnings: [],
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
  demo: false,
  // transient (not saved)
  pitches: [],
  picked: {},
  loading: {},
  errors: {},
  labMode: "angles",
  labCards: [],
  labPicked: {},
  confirmDelete: null,
  editingIdentity: false,
  editingHouse: false,
  addingClient: false,
  scriptLen: 90,
  retry: null,        // {fn, args} for demo-mode retry after backend failure
};

/* ---------- persistence + v1 migration ---------- */
function load() {
  try {
    var raw = localStorage.getItem(KEY_V2);
    if (!raw) {
      // migrate from v1 if present (v1 data is left untouched)
      var v1 = localStorage.getItem(KEY_V1);
      if (v1) {
        var old = JSON.parse(v1);
        state.episodes = old.episodes || [];
        state.settings = mergeSettings(old.settings || {});
        save();
        return;
      }
      return;
    }
    var d = JSON.parse(raw);
    state.episodes = d.episodes || [];
    state.clients = d.clients || [];
    state.learnings = d.learnings || [];
    state.settings = mergeSettings(d.settings || {});
    state.demo = !!d.demo;
  } catch (e) { console.error("load failed", e); }
}

function mergeSettings(s) {
  var out = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  if (s.seriesName) out.seriesName = s.seriesName;
  if (s.openingLine) out.openingLine = s.openingLine;
  if (s.styleDNA) Object.assign(out.styleDNA, s.styleDNA);
  if (s.brandKit) out.brandKit = s.brandKit;
  if (s.house) Object.assign(out.house, s.house);
  return out;
}

function save() {
  try {
    localStorage.setItem(KEY_V2, JSON.stringify({
      episodes: state.episodes,
      clients: state.clients,
      learnings: state.learnings,
      settings: state.settings,
      demo: state.demo,
    }));
  } catch (e) { console.error("save failed", e); }
}

function byId(id) {
  for (var i = 0; i < state.episodes.length; i++) if (state.episodes[i].id === id) return state.episodes[i];
  return null;
}
function clientById(id) {
  for (var i = 0; i < state.clients.length; i++) if (state.clients[i].id === id) return state.clients[i];
  return null;
}
function patchEp(id, patch) {
  var ep = byId(id);
  if (ep) { Object.assign(ep, patch); save(); }
}
function uid() { return Date.now() + Math.floor(Math.random() * 100000); }

/* ---------- helpers ---------- */
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function extractJson(text) {
  var s = String(text).replace(/```json|```/g, "").trim();
  var a = s.indexOf("["), o = s.indexOf("{");
  var start = a === -1 ? o : (o === -1 ? a : Math.min(a, o));
  var end = Math.max(s.lastIndexOf("]"), s.lastIndexOf("}"));
  if (start === -1 || end === -1) throw new Error("โมเดลไม่ได้ตอบเป็น JSON — กดปุ่มอีกครั้ง");
  return JSON.parse(s.slice(start, end + 1));
}

/* ---------- AI layer ----------
   callAI(kind, prompt, opts) → text
   - POSTs {prompt, max_tokens, effort} to /api/claude
   - demo mode: answers from js/demo.js instead (no backend needed)
   - opts: {max_tokens, effort, ctx} — ctx is passed to the demo responder */
async function callAI(kind, prompt, opts) {
  opts = opts || {};
  if (state.demo) {
    await new Promise(function (r) { setTimeout(r, 600); }); // feel like work
    return DEMO.respond(kind, opts.ctx || {});
  }
  var noBackend = function () {
    var err = new Error("ต่อ backend ไม่ได้ — ต้อง deploy ขึ้น Vercel ก่อน (ดู README) หรือกดปุ่มด้านล่างเพื่อลองด้วยข้อมูลตัวอย่าง");
    err.offerDemo = true;
    return err;
  };
  var res;
  try {
    res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: opts.max_tokens || 4000,
        effort: opts.effort || "high",
      }),
    });
  } catch (e) {
    throw noBackend(); // network failure (file://, offline)
  }
  // static hosts answer POST /api/claude with 404/405/501 — that means "no backend here"
  if (res.status === 404 || res.status === 405 || res.status === 501 || res.status === 502) throw noBackend();
  var data = await res.json().catch(function () { return null; });
  if (data === null) throw noBackend(); // HTML error page, not our function
  if (!res.ok) throw new Error(data.error || ("Server error " + res.status));
  return data.text || "";
}

/* remember the last generate action so "demo mode" can re-run it */
function rememberRetry(fn, args) { state.retry = { fn: fn, args: args || [] }; }

/* ---------- clipboard ---------- */
async function copyText(text, btn) {
  var ok = true;
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    try {
      var t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      document.execCommand("copy"); document.body.removeChild(t);
    } catch (e2) { ok = false; }
  }
  if (btn && ok) {
    var old = btn.innerHTML;
    btn.classList.add("ok");
    btn.innerHTML = "✓ copied";
    setTimeout(function () { btn.classList.remove("ok"); btn.innerHTML = old; }, 1600);
  }
}

/* ---------- render primitives ---------- */
function led(color, pulse) {
  return '<span class="led' + (pulse ? " pulse" : "") + '" style="background:' + color + ';box-shadow:0 0 8px ' + color + '"></span>';
}
function tag(text, color) {
  return '<span class="tag" style="color:' + (color || "var(--dim)") + ';border-color:' + (color || "var(--line)") + '">' + esc(text) + "</span>";
}
function errbox(id) {
  var msg = state.errors[id];
  if (!msg) return "";
  var h = '<div class="errbox">⚠ <div style="flex:1;min-width:200px">' + esc(msg) + "</div>";
  if (state.errors[id + "_demo"]) {
    h += '<button class="btn small ghost" onclick="A.enableDemoRetry()">▶ ใช้โหมดตัวอย่าง (demo)</button>';
  }
  return h + "</div>";
}
function setErr(id, e) {
  state.errors[id] = e.message || String(e);
  state.errors[id + "_demo"] = !!e.offerDemo;
}
function clearErr(id) { state.errors[id] = ""; state.errors[id + "_demo"] = false; }
function spinner() { return '<span class="spin">◌</span>'; }

function epRow(ep, opts) {
  opts = opts || {};
  var idx = state.episodes.indexOf(ep);
  var st = STATUS[ep.status];
  return '<button class="eprow" onclick="' + esc(opts.onclick || "") + '">' +
    '<span class="epno">EP-' + String(idx + 1).padStart(3, "0") + "</span>" +
    led(st.color, ep.status === "posted") +
    '<span class="epmain"><span class="eptitle">' + esc(ep.title) + '</span>' +
    '<span class="epsub">' + esc(ep.artist) + " — " + esc(ep.song) + "</span></span>" +
    tag(st.label, st.color) +
    '<span class="chev">›</span></button>';
}

function epHeader(ep) {
  var st = STATUS[ep.status];
  return '<div style="display:flex;align-items:center;gap:10px">' +
    led(st.color, ep.status === "posted") +
    '<div style="flex:1"><div class="f-display" style="font-size:17px;font-weight:800;line-height:1.3">' + esc(ep.title) + "</div>" +
    '<div class="f-mono" style="font-size:10.5px;color:var(--dim);margin-top:2px">' + esc(ep.artist) + " — " + esc(ep.song) + "</div></div>" +
    tag(st.label, st.color) + "</div>";
}

function renderWorkList(eligibleFn, emptyMsg) {
  var list = state.episodes.filter(eligibleFn);
  var h = '<div class="panel"><div class="slabel">PICK AN EPISODE</div>';
  if (list.length === 0) h += '<div style="font-size:13px;color:var(--dim);padding:8px 0">' + esc(emptyMsg) + "</div>";
  else h += list.map(function (e) { return epRow(e, { onclick: "A.sel(" + e.id + ")" }); }).join("");
  return h + "</div>";
}

function backlink() {
  return '<button class="backlink" onclick="A.sel(null)">✕ back to list</button>';
}

/* ---------- tabs + render registry ---------- */
var TABS = [
  { id: "hq", label: "⌂ HQ" },
  { id: "stories", label: "🔥 Stories" },
  { id: "lab", label: "💡 Lab" },
  { id: "script", label: "✍ Script" },
  { id: "edit", label: "✂ Edit" },
  { id: "design", label: "🎨 Design" },
  { id: "publish", label: "▸ Publish" },
  { id: "plan", label: "▦ Plan" },
  { id: "results", label: "▲ Results" },
  { id: "clients", label: "💼 Clients", cls: "client-tab" },
];

var RENDER = {}; // station id → render fn (registered by station files)

function renderTabs() {
  var el = document.getElementById("tabs");
  el.innerHTML = TABS.map(function (t) {
    return '<button class="tab ' + (t.cls || "") + (state.tab === t.id ? " active" : "") + '" onclick="A.go(\'' + t.id + "')\">" + t.label + "</button>";
  }).join("");
}

function render() {
  renderTabs();
  var app = document.getElementById("app");
  var fn = RENDER[state.tab];
  app.innerHTML = fn ? fn() : "";
  if (typeof afterRender === "function") afterRender();
}

/* hook for stations that need to paint canvases after HTML lands */
var afterRenderFns = [];
function afterRender() {
  var fns = afterRenderFns; afterRenderFns = [];
  fns.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
}
function queueAfterRender(f) { afterRenderFns.push(f); }

/* ---------- shared actions ---------- */
var A = {
  go: function (tab) { state.tab = tab; state.sel = null; state.selClient = null; state.confirmDelete = null; render(); },
  goSel: function (tab, id) { state.tab = tab; state.sel = id || null; render(); },
  sel: function (id) { state.sel = id; render(); },

  enableDemoRetry: function () {
    state.demo = true; save();
    var r = state.retry;
    state.retry = null;
    if (r && typeof A[r.fn] === "function") A[r.fn].apply(A, r.args);
    else render();
  },
  toggleDemo: function () { state.demo = !state.demo; save(); render(); },

  copy: function (btn, id, kind) {
    var ep = byId(id); if (!ep) return;
    var text = ep["_" + kind] || "";
    copyText(text, btn);
  },
  copyRaw: function (btn, encoded) {
    copyText(decodeURIComponent(encoded), btn);
  },

  exportData: function () {
    var blob = new Blob([JSON.stringify({
      episodes: state.episodes, clients: state.clients,
      learnings: state.learnings, settings: state.settings,
    }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sapsound-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  },

  importData: function (ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (!d || !Array.isArray(d.episodes)) throw new Error("ไฟล์ backup ไม่ถูกต้อง");
        state.episodes = d.episodes;
        state.clients = d.clients || [];
        state.learnings = d.learnings || [];
        state.settings = mergeSettings(d.settings || {});
        save(); render();
      } catch (e) { alert("Import failed: " + e.message); }
    };
    reader.readAsText(file);
  },
};

window.A = A;
