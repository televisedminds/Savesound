/* ═══════════════════════════════════════════════════════════
   เสพซาวด์ STUDIO v2 — channel stations
   HQ · Stories · Script · Edit · Publish · Plan · Results
   ═══════════════════════════════════════════════════════════ */

"use strict";

/* ═══════════════ HQ ═══════════════ */
function focusOf() {
  var count = function (s) { return state.episodes.filter(function (e) { return e.status === s; }).length; };
  var find = function (s) { return state.episodes.find(function (e) { return e.status === s; }); };
  var idea = find("idea"), scripted = find("scripted"), blueprint = find("blueprint");
  var readyUnsched = state.episodes.find(function (e) { return e.status === "ready" && !e.scheduledDay; });
  if (count("idea") < 2) return { text: "Story bank is low — dig new stories.", tab: "stories", cta: "Open story engine" };
  if (scripted && !blueprint) return { text: '"' + scripted.title + '" is scripted — build its cut plan.', tab: "edit", id: scripted.id, cta: "Build cut plan" };
  if (blueprint) return { text: '"' + blueprint.title + '" has a cut plan — package it for posting.', tab: "publish", id: blueprint.id, cta: "Package it" };
  if (readyUnsched) return { text: '"' + readyUnsched.title + '" is ready — put it on the calendar.', tab: "plan", cta: "Open planner" };
  if (idea) return { text: 'Next up: write the script for "' + idea.title + '".', tab: "script", id: idea.id, cta: "Write script" };
  return { text: "Pipeline is clear. Dig stories or log results.", tab: "stories", cta: "Dig stories" };
}

RENDER.hq = function () {
  var f = focusOf();
  var count = function (s) { return state.episodes.filter(function (e) { return e.status === s; }).length; };
  var st = state.settings;
  var h = "";

  h += '<div class="panel raised"><div class="slabel">TODAY\'S FOCUS</div>' +
    '<div class="focus-text">' + esc(f.text) + "</div>" +
    '<button class="btn" onclick="A.goSel(\'' + f.tab + "'," + (f.id || "null") + ')">' + esc(f.cta) + " →</button></div>";

  h += '<div class="panel"><div class="slabel">PIPELINE</div><div class="meters">' +
    Object.keys(STATUS).map(function (k) {
      var v = STATUS[k];
      return '<div class="meter"><div class="num" style="color:' + v.color + '">' + count(k) + '</div><div class="lbl">' + v.label + "</div></div>";
    }).join("") +
    '</div><div class="notice" style="margin-top:10px">Target cadence: 3 episodes on air per week. Keep at least 2 ideas banked.</div></div>';

  if (state.episodes.length > 0) {
    var recent = state.episodes.slice(-5).reverse();
    h += '<div class="panel"><div class="slabel">TRACKLIST</div>' +
      recent.map(function (ep) {
        var target = ep.status === "idea" ? "script" : ep.status === "scripted" ? "edit" : "publish";
        return epRow(ep, { onclick: "A.goSel('" + target + "'," + ep.id + ")" });
      }).join("") + "</div>";
  }

  /* series identity + style DNA */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">SERIES IDENTITY</div>' +
    '<button class="chipbtn" onclick="A.toggleIdentity()">' + (state.editingIdentity ? "close" : "edit") + "</button></div>";
  if (!state.editingIdentity) {
    h += '<div class="f-display" style="font-size:15px;font-weight:700">' + esc(st.seriesName) + "</div>" +
      '<div style="font-size:13px;color:var(--dim);margin-top:4px">"' + esc(st.openingLine) + '"</div>' +
      '<div style="font-size:11.5px;color:var(--steel);margin-top:8px">DNA: ' + esc(st.styleDNA.tone) + "</div>";
  } else {
    h += '<div class="idgrid">' +
      '<div><label>SERIES NAME</label><input type="text" id="idName" value="' + esc(st.seriesName) + '" /></div>' +
      '<div><label>SIGNATURE OPENING LINE — ประโยคแรกของทุกตอน</label><textarea id="idLine" rows="2">' + esc(st.openingLine) + "</textarea></div>" +
      '<div><label>TONE — เล่ายังไง</label><textarea id="idTone" rows="2">' + esc(st.styleDNA.tone) + "</textarea></div>" +
      '<div><label>VISUAL — หน้าตาคลิปเป็นแบบไหน</label><textarea id="idVisual" rows="2">' + esc(st.styleDNA.visual) + "</textarea></div>" +
      '<div><label>NEVER — สิ่งที่ช่องนี้ไม่ทำ</label><textarea id="idAvoid" rows="2">' + esc(st.styleDNA.avoid) + "</textarea></div>" +
      '<button class="btn small" onclick="A.saveIdentity()">Save identity</button>' +
      '<div class="notice">ทุกสถานีในแอปใช้ DNA ชุดนี้เขียนงาน — ตั้งครั้งเดียว งานทุกชิ้นจะเป็นเสียงเดียวกัน</div></div>';
  }
  h += "</div>";

  /* production house identity (used by Clients station) */
  h += '<div class="panel steelline"><div class="rowsplit"><div class="slabel" style="color:var(--steel)">PRODUCTION HOUSE — สำหรับงานลูกค้า</div>' +
    '<button class="chipbtn" onclick="A.toggleHouse()">' + (state.editingHouse ? "close" : "edit") + "</button></div>";
  if (!state.editingHouse) {
    h += '<div class="f-display" style="font-size:15px;font-weight:700">' + esc(st.house.name) + "</div>" +
      '<div style="font-size:12.5px;color:var(--dim)">' + esc(st.house.tagline) + " · " + esc(st.house.contact) + "</div>";
  } else {
    h += '<div class="idgrid">' +
      '<div><label>HOUSE NAME</label><input type="text" id="hName" value="' + esc(st.house.name) + '" /></div>' +
      '<div><label>TAGLINE</label><input type="text" id="hTag" value="' + esc(st.house.tagline) + '" /></div>' +
      '<div><label>CONTACT (LINE / เบอร์)</label><input type="text" id="hContact" value="' + esc(st.house.contact) + '" /></div>' +
      '<button class="btn small steel" onclick="A.saveHouse()">Save</button>' +
      '<div class="notice">ใช้ตอนสร้างข้อความ pitch ลูกค้าในแท็บ Clients</div></div>';
  }
  h += "</div>";

  /* demo + backup */
  h += '<div class="panel"><div class="slabel">SYSTEM</div>' +
    '<div class="togglerow" style="margin-bottom:12px"><button class="toggle' + (state.demo ? " on" : "") + '" onclick="A.toggleDemo()"></button>' +
    '<div style="flex:1"><div style="font-size:13px;font-weight:600">Demo mode</div>' +
    '<div class="notice">เปิดแล้วทุกปุ่มจะตอบด้วยข้อมูลตัวอย่าง (ไม่เรียก AI จริง ไม่เสียเงิน) — ไว้ลองแอป/สอนทีม</div></div></div>' +
    '<div class="notice" style="margin-bottom:10px">Your data lives in this browser only. Export a backup file, import it on another device.</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<button class="btn small ghost" onclick="A.exportData()">Export backup</button>' +
    '<button class="btn small ghost" onclick="document.getElementById(\'importFile\').click()">Import backup</button>' +
    '<input type="file" id="importFile" accept=".json" style="display:none" onchange="A.importData(event)" />' +
    "</div></div>";

  return h;
};

Object.assign(A, {
  toggleIdentity: function () { state.editingIdentity = !state.editingIdentity; render(); },
  saveIdentity: function () {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var st = state.settings;
    st.seriesName = g("idName") || DEFAULT_SETTINGS.seriesName;
    st.openingLine = g("idLine") || DEFAULT_SETTINGS.openingLine;
    st.styleDNA.tone = g("idTone") || DEFAULT_SETTINGS.styleDNA.tone;
    st.styleDNA.visual = g("idVisual") || DEFAULT_SETTINGS.styleDNA.visual;
    st.styleDNA.avoid = g("idAvoid") || DEFAULT_SETTINGS.styleDNA.avoid;
    save(); state.editingIdentity = false; render();
  },
  toggleHouse: function () { state.editingHouse = !state.editingHouse; render(); },
  saveHouse: function () {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var st = state.settings;
    st.house.name = g("hName") || DEFAULT_SETTINGS.house.name;
    st.house.tagline = g("hTag") || DEFAULT_SETTINGS.house.tagline;
    st.house.contact = g("hContact") || DEFAULT_SETTINGS.house.contact;
    save(); state.editingHouse = false; render();
  },
});

/* ═══════════════ STORIES ═══════════════ */
var STORY_CHIPS = ["27 Club", "เพลงจากคดีจริง", "วงที่แตกเพราะเพลงเดียว", "เพลงต้องคำสาป", "grunge ยุค 90", "เพลงไทยมีเรื่อง"];

RENDER.stories = function () {
  var h = "";
  h += '<div class="panel raised"><div class="slabel">STORY ENGINE</div>' +
    '<div style="font-size:13px;color:var(--dim);margin-bottom:10px">Name an artist, a song, a scene — or leave blank and let the engine dig.</div>' +
    '<input type="text" id="storyInput" placeholder="e.g. Linkin Park / เพลงที่เขียนในโรงพยาบาลจิตเวช / blank = surprise me" />' +
    '<div class="chiprow">' + STORY_CHIPS.map(function (c) {
      return '<button class="suggest-chip" onclick="A.chipDig(\'' + esc(c) + '\')">' + esc(c) + "</button>";
    }).join("") + "</div>" +
    '<div style="margin-top:8px"><button class="btn" id="digBtn" onclick="A.dig()"' + (state.loading.dig ? " disabled" : "") + ">" +
    (state.loading.dig ? spinner() + " Digging the archives..." : "🔥 Dig 5 stories") + "</button></div>" +
    errbox("dig") +
    '<div class="f-mono" style="font-size:10px;color:var(--dim);margin-top:10px">⚠ AI-researched — always verify facts before filming (fact sheet lives in the Script room).</div></div>';

  state.pitches.forEach(function (p, i) {
    h += '<div class="panel">' +
      '<div class="rowsplit" style="align-items:flex-start"><div style="flex:1">' +
      '<div class="f-display" style="font-size:15.5px;font-weight:700;line-height:1.35">' + esc(p.title) + "</div>" +
      '<div class="f-mono" style="font-size:10.5px;color:var(--dim);margin-top:3px">' + esc(p.artist) + " — " + esc(p.song) + "</div></div>" +
      tag("DARK " + esc(p.darkness) + "/10", "var(--blood)") + "</div>" +
      '<div class="pitch-hook">"' + esc(p.hook) + '"</div>' +
      '<div class="pitch-sum">' + esc(p.summary) + "</div>" +
      '<div class="pitch-angle">▸ ' + esc(p.angle) + "</div>" +
      (p.whyNow ? '<div style="font-size:11.5px;color:var(--steel);margin-top:4px">⏰ ' + esc(p.whyNow) + "</div>" : "") +
      '<div style="margin-top:10px"><button class="btn small' + (state.picked[i] ? "" : " ghost") + '" onclick="A.pick(' + i + ')">' +
      (state.picked[i] ? "✓ Selected" : "+ Select") + "</button></div></div>";
  });

  if (state.pitches.length > 0) {
    var n = Object.keys(state.picked).filter(function (k) { return state.picked[k]; }).length;
    h += '<button class="btn" onclick="A.addPicked()"' + (n === 0 ? " disabled" : "") + ">Add " + (n || "") + " to pipeline →</button>";
  }
  return h;
};

Object.assign(A, {
  chipDig: function (text) {
    var el = document.getElementById("storyInput");
    if (el) el.value = text;
    A.dig();
  },
  dig: async function () {
    var input = (document.getElementById("storyInput") || {}).value || "";
    rememberRetry("dig");
    state.loading.dig = true; clearErr("dig"); state.pitches = []; state.picked = {}; render();
    var keep = input;
    try {
      var raw = await callAI("stories", P.stories(input.trim()), { max_tokens: 3500 });
      var arr = extractJson(raw);
      state.pitches = Array.isArray(arr) ? arr : [];
    } catch (e) { setErr("dig", e); }
    state.loading.dig = false; render();
    var el = document.getElementById("storyInput"); if (el) el.value = keep;
  },
  pick: function (i) { state.picked[i] = !state.picked[i]; render(); },
  addPicked: function () {
    var chosen = state.pitches.filter(function (_, i) { return state.picked[i]; });
    chosen.forEach(function (p) { addEpisodeFromPitch(p); });
    save();
    state.pitches = []; state.picked = {};
    state.tab = "script"; render();
  },
});

function addEpisodeFromPitch(p) {
  state.episodes.push({
    id: uid(),
    createdAt: Date.now(),
    title: p.title, artist: p.artist || "", song: p.song || "", pitch: p,
    script: null, hookAlts: null, coach: null, factCheck: null,
    editPlan: null, editCoach: null, shotList: null,
    publishPack: null, design: null,
    status: "idea", scheduledDay: null, stats: null,
  });
}

/* ═══════════════ SCRIPT ═══════════════ */
RENDER.script = function () {
  var ep = byId(state.sel);
  if (!ep) return renderWorkList(function (e) { return e.status === "idea" || e.script; }, "No ideas in the pipeline yet — dig some in Stories.");

  var h = backlink() + '<div style="display:flex;flex-direction:column;gap:12px">' + epHeader(ep);
  var s = ep.script;

  if (!s) {
    h += '<div class="panel raised"><div style="font-size:13px;color:var(--dim);margin-bottom:10px">Full Thai script — signature opening, story beats with retention notes, on-screen text, the needle-drop moment, comment-bait ending.</div>' +
      '<div style="display:flex;gap:6px;margin-bottom:10px">' +
      [60, 90, 180].map(function (n) {
        return '<button class="modechip' + (state.scriptLen === n ? " active" : "") + '" onclick="A.setLen(' + n + ')">' + (n === 180 ? "3 นาที" : n + " วิ") + "</button>";
      }).join("") + "</div>" +
      '<button class="btn" onclick="A.genScript(' + ep.id + ')"' + (state.loading.script ? " disabled" : "") + ">" +
      (state.loading.script ? spinner() + " Writing..." : "✍ Write the script") + "</button>" + errbox("script") + "</div>";
    return h + "</div>";
  }

  /* full script text for copy */
  var fullText = ["HOOK: " + s.hook]
    .concat((s.sections || []).map(function (x) {
      return "[" + x.time + " " + x.label + "]\nVO: " + x.vo + "\nภาพ: " + x.visual + (x.screenText ? "\nText จอ: " + x.screenText : "");
    }))
    .concat(["NEEDLE DROP: " + s.needleDrop, "CTA: " + s.cta]).join("\n\n");
  ep._scriptText = fullText;

  h += '<div class="panel raised"><div class="rowsplit" style="margin-bottom:8px"><div class="slabel">SCRIPT</div>' +
    '<div style="display:flex;gap:6px">' +
    '<button class="chipbtn" onclick="A.copy(this,' + ep.id + ",'scriptText')\">⧉ copy all</button>" +
    '<button class="chipbtn" onclick="A.genScript(' + ep.id + ')"' + (state.loading.script ? " disabled" : "") + ">" + (state.loading.script ? "◌" : "↻ rewrite") + "</button></div></div>" +
    '<div class="hookblock"><div class="tc">HOOK 0:00</div><div class="line">' + esc(s.hook) + "</div></div>" +
    (s.sections || []).map(function (x) {
      return '<div class="scriptsec"><div class="meta">' + esc(x.time) + " · " + esc(x.label) + "</div>" +
        '<div class="vo">' + esc(x.vo) + '</div>' +
        '<div class="vis">🎬 ' + esc(x.visual) + "</div>" +
        (x.screenText ? '<div class="stext">🅃 ' + esc(x.screenText) + "</div>" : "") +
        (x.note ? '<div style="font-size:11px;color:var(--dim);margin-top:3px">◈ ' + esc(x.note) + "</div>" : "") +
        "</div>";
    }).join("") +
    '<div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">' +
    '<div style="font-size:12.5px"><b class="blood">NEEDLE DROP —</b> ' + esc(s.needleDrop) + "</div>" +
    '<div style="font-size:12.5px"><b class="moss">CTA —</b> ' + esc(s.cta) + "</div></div>" +
    errbox("script") + "</div>";

  /* directed rewrite */
  h += '<div class="panel"><div class="slabel">DIRECTED REWRITE — สั่งแก้ทั้งสคริปต์</div>' +
    '<input type="text" id="rewriteInput" placeholder="เช่น สั้นลง 20% / มืดกว่านี้ / เปิดด้วยคำถาม / เปลี่ยนตอนจบ" />' +
    '<div style="margin-top:8px"><button class="btn small" onclick="A.rewrite(' + ep.id + ')"' + (state.loading.rewrite ? " disabled" : "") + ">" +
    (state.loading.rewrite ? spinner() + " Rewriting..." : "↻ Rewrite with direction") + "</button></div>" + errbox("rewrite") + "</div>";

  /* hook variants */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">HOOK LAB — ทางเลือกประโยคเปิด</div>' +
    '<button class="chipbtn" onclick="A.genHooks(' + ep.id + ')"' + (state.loading.hooks ? " disabled" : "") + ">" +
    (state.loading.hooks ? "◌" : (ep.hookAlts ? "↻ redo" : "✦ generate 4")) + "</button></div>";
  if (ep.hookAlts) {
    h += ep.hookAlts.map(function (a, i) {
      return '<div class="altrow"><div class="t">"' + esc(a.hook) + '"<div style="font-size:10.5px;color:var(--violet);margin-top:2px">' + esc(a.trigger) + "</div></div>" +
        '<button class="chipbtn" onclick="A.useHook(' + ep.id + "," + i + ')">ใช้อันนี้</button></div>';
    }).join("");
  } else if (!state.loading.hooks) {
    h += '<div class="notice">ฮุคคือ 80% ของยอดวิว — เจน 4 ตัวเลือกที่ใช้ trigger ต่างกัน แล้วเลือกอันที่ทิ่มสุด</div>';
  }
  h += errbox("hooks") + "</div>";

  /* storyteller coach */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">STORY COACH — วิจารณ์สคริปต์</div>' +
    '<button class="chipbtn" onclick="A.genCoach(' + ep.id + ')"' + (state.loading.coach ? " disabled" : "") + ">" +
    (state.loading.coach ? "◌" : (ep.coach ? "↻ re-analyze" : "▲ analyze")) + "</button></div>";
  if (ep.coach) {
    var c = ep.coach;
    h += (c.beats || []).map(function (b) {
      var col = b.score >= 8 ? "var(--moss)" : b.score >= 6 ? "var(--amber)" : "var(--blood)";
      return '<div class="coachrow"><div class="sc" style="color:' + col + '">' + esc(b.score) + '</div><div class="lb">' + esc(b.label) + '</div><div class="tx">' + esc(b.issue) + "</div></div>";
    }).join("") +
      '<div style="font-size:12.5px;margin-top:10px"><b class="moss">แข็งสุด:</b> ' + esc(c.strongest) + "</div>" +
      '<div style="font-size:12.5px;margin-top:5px"><b class="blood">เสี่ยงสุด:</b> ' + esc(c.weakest) + "</div>" +
      '<div style="font-size:12.5px;margin-top:5px"><b class="amber">โค้ง:</b> ' + esc(c.curve) + "</div>" +
      '<div class="subhead">FIXES</div>' +
      (c.fixes || []).map(function (f) { return '<div class="listline">→ ' + esc(f) + "</div>"; }).join("");
  } else if (!state.loading.coach) {
    h += '<div class="notice">โค้ชเล่าเรื่องจะให้คะแนน retention ทีละบีต บอกจุดที่คนจะกดออก และวิธีแก้ — โหดแต่คุ้ม</div>';
  }
  h += errbox("coach") + "</div>";

  /* fact sheet */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">FACT SHEET — ตรวจก่อนถ่าย</div>' +
    '<button class="chipbtn" onclick="A.genFacts(' + ep.id + ')"' + (state.loading.facts ? " disabled" : "") + ">" +
    (state.loading.facts ? "◌" : (ep.factCheck ? "↻ redo" : "☑ build checklist")) + "</button></div>";
  if (ep.factCheck) {
    h += (ep.factCheck.claims || []).map(function (cl) {
      var col = cl.risk === "สูง" ? "var(--blood)" : cl.risk === "กลาง" ? "var(--amber)" : "var(--moss)";
      return '<div class="factrow"><div class="claim">' + tag(cl.risk, col) + " " + esc(cl.claim) + '</div>' +
        '<div class="how">→ ' + esc(cl.how) + '</div>' +
        (cl.query ? '<div class="how f-mono" style="font-size:10.5px">🔎 ' + esc(cl.query) + "</div>" : "") + "</div>";
    }).join("") +
      '<div style="font-size:12px;color:var(--amber);margin-top:8px">⚠ ' + esc(ep.factCheck.redFlags) + "</div>";
  } else if (!state.loading.facts) {
    h += '<div class="notice">AI ลิสต์ทุก claim ที่ต้องเช็กพร้อมวิธีเช็ก — ข้อเท็จจริงผิดครั้งเดียว ช่องเล่าเรื่องเสียเครดิตทั้งช่อง</div>';
  }
  h += errbox("facts") + "</div>";

  h += '<div class="notice">Next: build the cut plan in <b>✂ Edit</b>, and the cover in <b>🎨 Design</b>.</div>';
  return h + "</div>";
};

Object.assign(A, {
  setLen: function (n) { state.scriptLen = n; render(); },
  genScript: async function (id) {
    var ep = byId(id); if (!ep) return;
    rememberRetry("genScript", [id]);
    state.loading.script = true; clearErr("script"); render();
    try {
      var raw = await callAI("script", P.script(ep, state.scriptLen), { max_tokens: 5000 });
      ep.script = extractJson(raw);
      if (ep.status === "idea") ep.status = "scripted";
      ep.coach = null;
      save();
    } catch (e) { setErr("script", e); }
    state.loading.script = false; render();
  },
  rewrite: function (id) {
    var dirEl = document.getElementById("rewriteInput");
    var direction = dirEl ? dirEl.value.trim() : "";
    if (!direction) { state.errors.rewrite = "พิมพ์ก่อนว่าจะให้แก้ยังไง"; render(); return; }
    A.retryRewrite(id, direction);
  },
  retryRewrite: async function (id, direction) {
    var ep = byId(id); if (!ep || !ep.script) return;
    rememberRetry("retryRewrite", [id, direction]);
    state.loading.rewrite = true; clearErr("rewrite"); render();
    try {
      var raw = await callAI("rewrite", P.rewrite(ep, direction), { max_tokens: 5000, ctx: { script: ep.script } });
      ep.script = extractJson(raw);
      ep.coach = null;
      save();
    } catch (e) { setErr("rewrite", e); }
    state.loading.rewrite = false; render();
    var el = document.getElementById("rewriteInput");
    if (el && state.errors.rewrite) el.value = direction;
  },
  genHooks: async function (id) {
    var ep = byId(id); if (!ep) return;
    rememberRetry("genHooks", [id]);
    state.loading.hooks = true; clearErr("hooks"); render();
    try {
      var raw = await callAI("hooks", P.hooks(ep), { max_tokens: 1500, effort: "medium" });
      ep.hookAlts = extractJson(raw);
      save();
    } catch (e) { setErr("hooks", e); }
    state.loading.hooks = false; render();
  },
  useHook: function (id, i) {
    var ep = byId(id); if (!ep || !ep.hookAlts || !ep.hookAlts[i]) return;
    if (ep.script) { ep.script.hook = ep.hookAlts[i].hook; save(); render(); }
  },
  genCoach: async function (id) {
    var ep = byId(id); if (!ep || !ep.script) return;
    rememberRetry("genCoach", [id]);
    state.loading.coach = true; clearErr("coach"); render();
    try {
      var raw = await callAI("coach", P.coach(ep), { max_tokens: 2500 });
      ep.coach = extractJson(raw);
      save();
    } catch (e) { setErr("coach", e); }
    state.loading.coach = false; render();
  },
  genFacts: async function (id) {
    var ep = byId(id); if (!ep) return;
    rememberRetry("genFacts", [id]);
    state.loading.facts = true; clearErr("facts"); render();
    try {
      var raw = await callAI("factCheck", P.factCheck(ep), { max_tokens: 2500 });
      ep.factCheck = extractJson(raw);
      save();
    } catch (e) { setErr("facts", e); }
    state.loading.facts = false; render();
  },
});

/* ═══════════════ EDIT (cut plan + coach + shot list + recipes) ═══════════════ */
var RECIPES = [
  { n: "01", name: "กฎเฟรมแรก", body: "เฟรมแรกต้องอ่านรู้เรื่องแม้ไม่มีเสียง: ภาพแรง + ตัวหนังสือใหญ่ 1 ประโยค คนตัดสินใน 0.5 วิว่าจะอยู่หรือไป — อย่าเปิดด้วยโลโก้หรือ fade in เด็ดขาด" },
  { n: "02", name: "ตัดตามบีต (Cut on Beat)", body: "ช่วงเล่าเร่งจังหวะ ให้จุดตัดตรงกับจังหวะกลอง/เบสของเพลงประกอบ วางคลิปเสียงก่อนแล้วซอยภาพตาม ใน CapCut ใช้ auto beat marker ช่วยได้" },
  { n: "03", name: "Punch-in ตอนเฉลย", body: "ทุกครั้งที่ VO เฉลยข้อมูลสำคัญ ซูมเข้าทันที 10-15% (jump scale ไม่ใช่ zoom ช้า) — สายตาคนดูจะโฟกัสใหม่ เหมือนโดนสะกิดให้ตั้งใจฟัง" },
  { n: "04", name: "J-cut / L-cut", body: "J-cut: เสียงฉากถัดไปมาก่อนภาพ 0.5-1 วิ — ใช้ก่อนเข้าฉากสำคัญให้คนเอนตัวรอ / L-cut: ภาพเปลี่ยนแล้วแต่เสียงเดิมยังลาก — ใช้ตอนสรุปปิดเรื่อง" },
  { n: "05", name: "เงียบคืออาวุธ", body: "ก่อนโมเมนต์พีคสุดของเรื่อง ตัดเสียงทุกแทร็กให้เงียบสนิท 1-2 วิ ความเงียบกลางคลิปที่เสียงแน่นมาตลอด ทำให้คนขนลุกและหยุดนิ้วอัตโนมัติ" },
  { n: "06", name: "เสียง 3 ชั้น", body: "คลิปสารคดีที่ฟังแพงมี 3 ชั้นเสมอ: (1) VO ชัดนำ (2) เพลง/drone รองอารมณ์ -18dB (3) sound effect เฉพาะจุด — riser ก่อนพีค, hit ตอนขึ้นตัวหนังสือ, room tone อุดช่องว่าง" },
  { n: "07", name: "ตัวหนังสือ 2.5 วิ", body: "คนไทยอ่าน ~3 คำ/วินาที caption หนึ่งจอไม่เกิน 8 คำ อยู่บนจอไม่เกิน 2.5 วิ ขึ้นหลังเสียงพูดคำนั้น 0.2 วิ — ถ้าต้องอ่านนานกว่านั้น แปลว่าประโยคยาวไป ตัดคำ" },
  { n: "08", name: "Safe zone 9:16", body: "TikTok UI กินพื้นที่: เว้นบน ~130px ล่าง ~340px ขวา ~120px (จาก 1080x1920) — ตัวหนังสือสำคัญอยู่กลางจอเยื้องบนเสมอ ไม่งั้นโดนปุ่มไลก์ทับ" },
  { n: "09", name: "Speed ramp เข้าพีค", body: "ก่อนถึงจุดพีค 2-3 วิ เร่งความเร็วภาพ 1.5-2x แล้วกลับ 1x (หรือ slow 0.5x) ตรงพีคพอดี ความต่างของสปีดคือเครื่องหมายตกใจของภาษาภาพ" },
  { n: "10", name: "Loop จบชนหัว", body: "ทำเฟรมสุดท้ายให้ต่อเนียนกับเฟรมแรก (ภาพเดียวกัน/ประโยคค้าง) คลิปจะวนรอบสองแบบคนไม่รู้ตัว — watch time ต่อคน x2 = อัลกอริทึมดันต่อ" },
  { n: "11", name: "เกรดโทนเดียวทั้งช่อง", body: "ทำ preset/LUT ของช่องไว้อันเดียว (เช่น ขาวดำคอนทราสต์สูง + grain 25%) ใช้ทุกคลิป — คนไถ feed แล้วรู้ว่าเป็นคลิปเราก่อนอ่านชื่อช่อง นั่นคือแบรนด์" },
  { n: "12", name: "Export กันโดนบี้", body: "1080x1920, 30fps, bitrate สูงสุดที่แอปให้ (CapCut: แนะนำ 60Mbps), เสียง -14 LUFS โดยประมาณ อย่าอัดซ้ำหลายรอบ — อัปโหลดไฟล์ต้นฉบับตรงจากเครื่อง" },
];

RENDER.edit = function () {
  var ep = byId(state.sel);
  if (!ep) {
    var h0 = renderWorkList(function (e) { return !!e.script; }, "Write a script first — the cut plan is built from it.");
    h0 += '<div class="panel"><div class="slabel">คัมภีร์ตัดต่อ — 12 RECIPES (ใช้ได้ทุกคลิป)</div>' +
      RECIPES.map(function (r) {
        return '<details class="recipe"><summary><span class="no">' + r.n + "</span>" + esc(r.name) + '</summary><div class="body">' + esc(r.body) + "</div></details>";
      }).join("") + "</div>";
    return h0;
  }

  var h = backlink() + '<div style="display:flex;flex-direction:column;gap:12px">' + epHeader(ep);
  var b = ep.editPlan;

  if (!b) {
    h += '<div class="panel raised"><div style="font-size:13px;color:var(--dim);margin-bottom:10px">Turns the script into a timecoded handoff your editor executes without questions — cuts + fx, on-screen text, sound design, b-roll list, grade & pacing. All in Thai.</div>' +
      '<button class="btn" onclick="A.genBlueprint(' + ep.id + ')"' + ((state.loading.blueprint || !ep.script) ? " disabled" : "") + ">" +
      (state.loading.blueprint ? spinner() + " Planning the cut..." : "✂ Build cut plan") + "</button>" +
      (!ep.script ? '<div style="font-size:12px;color:var(--amber);margin-top:8px">Write the script first.</div>' : "") +
      errbox("blueprint") + "</div>";
  } else {
    var fullText = ["== CUT LIST =="].concat((b.cuts || []).map(function (c) { return c.tc + "  " + c.action + (c.fx ? "  [" + c.fx + "]" : ""); }))
      .concat(["", "== ตัวหนังสือบนจอ (ตามลำดับ) =="]).concat((b.captions || []).map(function (c, i) { return (i + 1) + ". " + (c.text || c) + (c.style ? " (" + c.style + ")" : ""); }))
      .concat(["", "== SOUND =="]).concat((b.sound || []).map(function (x) { return x.tc + "  " + x.cue; }))
      .concat(["", "== B-ROLL =="]).concat((b.broll || []).map(function (x) { return "• " + x; }))
      .concat(["", "GRADE: " + (b.grade || "-"), "PACING: " + (b.pacing || "-")]).join("\n");
    ep._planText = fullText;

    h += '<div class="panel raised"><div class="rowsplit" style="margin-bottom:8px"><div class="slabel">EDITOR HANDOFF</div>' +
      '<div style="display:flex;gap:6px">' +
      '<button class="chipbtn" onclick="A.copy(this,' + ep.id + ",'planText')\">⧉ copy for editor</button>" +
      '<button class="chipbtn" onclick="A.genBlueprint(' + ep.id + ')"' + (state.loading.blueprint ? " disabled" : "") + ">" + (state.loading.blueprint ? "◌" : "↻ redo") + "</button></div></div>" +
      '<div class="subhead first">CUT LIST</div>' +
      (b.cuts || []).map(function (c) {
        return '<div class="cutrow"><span class="tc">' + esc(c.tc) + '</span><span style="font-size:12.5px;line-height:1.5;flex:1">' + esc(c.action) +
          (c.fx ? ' <span style="color:var(--violet);font-size:11px">[' + esc(c.fx) + "]</span>" : "") + "</span></div>";
      }).join("") +
      '<div class="subhead">ON-SCREEN TEXT</div>' +
      (b.captions || []).map(function (c, i) {
        var txt = c.text || c, sty = c.style || "";
        return '<div class="listline"><span class="f-mono dim" style="font-size:10.5px">' + (i + 1) + ".</span> " + esc(txt) +
          (sty ? ' <span style="color:var(--dim);font-size:10.5px">(' + esc(sty) + ")</span>" : "") + "</div>";
      }).join("") +
      '<div class="subhead">SOUND DESIGN</div>' +
      (b.sound || []).map(function (x) { return '<div class="cutrow soundrow"><span class="tc">' + esc(x.tc) + '</span><span style="font-size:12.5px">' + esc(x.cue) + "</span></div>"; }).join("") +
      '<div class="subhead">B-ROLL TO HUNT</div>' +
      (b.broll || []).map(function (x) { return '<div class="listline">• ' + esc(x) + "</div>"; }).join("") +
      (b.grade ? '<div style="font-size:12.5px;color:var(--steel);margin-top:10px">🎨 ' + esc(b.grade) + "</div>" : "") +
      '<div style="font-size:12.5px;color:var(--amber);margin-top:6px">⏱ ' + esc(b.pacing) + "</div>" +
      errbox("blueprint") + "</div>";
  }

  /* edit coach for this episode */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">EDIT COACH — เทคนิคเฉพาะตอนนี้</div>' +
    '<button class="chipbtn" onclick="A.genEditCoach(' + ep.id + ')"' + ((state.loading.editcoach || !ep.script) ? " disabled" : "") + ">" +
    (state.loading.editcoach ? "◌" : (ep.editCoach ? "↻ redo" : "✦ teach me 5")) + "</button></div>";
  if (ep.editCoach) {
    h += ep.editCoach.map(function (t) {
      return '<div class="factrow"><div class="claim"><b>' + esc(t.name) + '</b> <span class="f-mono" style="font-size:10px;color:var(--blood)">' + esc(t.where) + '</span></div>' +
        '<div class="how">' + esc(t.how) + "</div></div>";
    }).join("");
  } else if (!state.loading.editcoach) {
    h += '<div class="notice">5 เทคนิคที่เลือกมาเพื่อตอนนี้โดยเฉพาะ — บอกตรงไหน ทำยังไง ระดับกด CapCut ตามได้เลย</div>';
  }
  h += errbox("editcoach") + "</div>";

  /* shot list */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">SHOT LIST — ถ่ายเองเพิ่ม</div>' +
    '<button class="chipbtn" onclick="A.genShotList(' + ep.id + ')"' + ((state.loading.shotlist || !ep.script) ? " disabled" : "") + ">" +
    (state.loading.shotlist ? "◌" : (ep.shotList ? "↻ redo" : "🎥 build")) + "</button></div>";
  if (ep.shotList) {
    h += ep.shotList.map(function (sh) {
      return '<div class="factrow"><div class="claim">' + tag(sh.type, "var(--steel)") + " " + esc(sh.shot) + '</div><div class="how">' + esc(sh.notes) + "</div></div>";
    }).join("");
  } else if (!state.loading.shotlist) {
    h += '<div class="notice">ลิสต์ช็อตที่ควรถ่ายเองในหนึ่งเซสชัน — insert, บรรยากาศ, prop — เอาไว้สลับกับฟุตเทจหายาก</div>';
  }
  h += errbox("shotlist") + "</div>";

  /* recipes */
  h += '<div class="panel"><div class="slabel">คัมภีร์ตัดต่อ — 12 RECIPES</div>' +
    RECIPES.map(function (r) {
      return '<details class="recipe"><summary><span class="no">' + r.n + "</span>" + esc(r.name) + '</summary><div class="body">' + esc(r.body) + "</div></details>";
    }).join("") + "</div>";

  return h + "</div>";
};

Object.assign(A, {
  genBlueprint: async function (id) {
    var ep = byId(id); if (!ep || !ep.script) return;
    rememberRetry("genBlueprint", [id]);
    state.loading.blueprint = true; clearErr("blueprint"); render();
    try {
      var raw = await callAI("blueprint", P.blueprint(ep), { max_tokens: 4000 });
      ep.editPlan = extractJson(raw);
      if (ep.status === "scripted" || ep.status === "idea") ep.status = "blueprint";
      save();
    } catch (e) { setErr("blueprint", e); }
    state.loading.blueprint = false; render();
  },
  genEditCoach: async function (id) {
    var ep = byId(id); if (!ep || !ep.script) return;
    rememberRetry("genEditCoach", [id]);
    state.loading.editcoach = true; clearErr("editcoach"); render();
    try {
      var raw = await callAI("editCoach", P.editCoach(ep), { max_tokens: 2200, effort: "medium" });
      ep.editCoach = extractJson(raw);
      save();
    } catch (e) { setErr("editcoach", e); }
    state.loading.editcoach = false; render();
  },
  genShotList: async function (id) {
    var ep = byId(id); if (!ep || !ep.script) return;
    rememberRetry("genShotList", [id]);
    state.loading.shotlist = true; clearErr("shotlist"); render();
    try {
      var raw = await callAI("shotList", P.shotList(ep), { max_tokens: 1800, effort: "medium" });
      ep.shotList = extractJson(raw);
      save();
    } catch (e) { setErr("shotlist", e); }
    state.loading.shotlist = false; render();
  },
});

/* ═══════════════ PUBLISH ═══════════════ */
RENDER.publish = function () {
  var ep = byId(state.sel);
  if (!ep) return renderWorkList(function (e) { return !!e.script; }, "Nothing to package yet — script an episode first.");

  var h = backlink() + '<div style="display:flex;flex-direction:column;gap:12px">' + epHeader(ep);
  var p = ep.publishPack;

  if (!p) {
    h += '<div class="panel raised"><div style="font-size:13px;color:var(--dim);margin-bottom:10px">Captions, titles and hashtags tuned per platform — plus a first comment, a pinned-comment fight-starter, and an A/B title.</div>' +
      '<button class="btn" onclick="A.genPublish(' + ep.id + ')"' + (state.loading.publish ? " disabled" : "") + ">" +
      (state.loading.publish ? spinner() + " Packaging..." : "▸ Package for 3 platforms") + "</button>" + errbox("publish") + "</div>";
    return h + "</div>";
  }

  var block = function (name, title, body, tags, key, extra) {
    var copyStr = (title ? title + "\n" : "") + (body || "") + "\n" + (tags || []).map(function (t) { return "#" + t; }).join(" ");
    ep["_pub_" + key] = copyStr;
    return '<div class="pubblock"><div class="head">' + tag(name, "var(--blood)") +
      '<button class="chipbtn" onclick="A.copy(this,' + ep.id + ",'pub_" + key + "')\">⧉ copy</button></div>" +
      (title ? '<div class="title">' + esc(title) + "</div>" : "") +
      '<div class="body">' + esc(body || "") + "</div>" +
      '<div class="tags">' + (tags || []).map(function (t) { return "#" + esc(t); }).join(" ") + "</div>" +
      (extra || "") + "</div>";
  };

  h += '<div class="panel raised"><div class="rowsplit"><div class="slabel">PUBLISH PACK</div>' +
    '<button class="chipbtn" onclick="A.genPublish(' + ep.id + ')"' + (state.loading.publish ? " disabled" : "") + ">" + (state.loading.publish ? "◌" : "↻ redo") + "</button></div>" +
    block("TIKTOK", null, p.tiktok && p.tiktok.caption, p.tiktok && p.tiktok.hashtags, "tt",
      p.tiktok && p.tiktok.firstComment ? '<div class="extra">💬 คอมเมนต์แรก (โพสต์เองทันที): ' + esc(p.tiktok.firstComment) + "</div>" : "") +
    block("YOUTUBE SHORTS", p.youtube && p.youtube.title, p.youtube && p.youtube.description, p.youtube && p.youtube.hashtags, "yt",
      p.youtube && p.youtube.titleAlt ? '<div class="extra">🅱 Title B (ไว้สลับถ้ายอดนิ่ง): ' + esc(p.youtube.titleAlt) + "</div>" : "") +
    block("IG REELS", null, p.instagram && p.instagram.caption, p.instagram && p.instagram.hashtags, "ig") +
    (p.pinComment ? '<div style="font-size:12.5px;margin-top:10px"><b class="violet">📌 ปักหมุด:</b> ' + esc(p.pinComment) + "</div>" : "") +
    '<div class="notice" style="margin-top:10px">⏰ ช่วงโพสต์แนะนำ: ' + esc(p.postTime || "19:00-21:00 และเที่ยง — ทดลองแล้วดูข้อมูลจริงใน Results") + "</div>" +
    '<div class="notice" style="margin-top:6px">Status set to READY — schedule it in the Plan tab, then mark posted after upload.</div>' +
    errbox("publish") + "</div>";
  return h + "</div>";
};

Object.assign(A, {
  genPublish: async function (id) {
    var ep = byId(id); if (!ep) return;
    rememberRetry("genPublish", [id]);
    state.loading.publish = true; clearErr("publish"); render();
    try {
      var raw = await callAI("publish", P.publish(ep), { max_tokens: 2500, effort: "medium" });
      ep.publishPack = extractJson(raw);
      if (ep.status !== "posted") ep.status = "ready";
      save();
    } catch (e) { setErr("publish", e); }
    state.loading.publish = false; render();
  },
});

/* ═══════════════ PLAN ═══════════════ */
RENDER.plan = function () {
  var schedulable = state.episodes.filter(function (e) { return e.status !== "posted"; });
  var week = DAYS.map(function (d) {
    return { d: d, eps: state.episodes.filter(function (e) { return e.scheduledDay === d && e.status !== "posted"; }) };
  });
  var scheduledCount = week.reduce(function (n, w) { return n + w.eps.length; }, 0);

  var h = '<div class="panel raised"><div class="rowsplit"><div class="slabel">THIS WEEK</div>' +
    '<span class="f-mono" style="font-size:10.5px;color:' + (scheduledCount >= 3 ? "var(--moss)" : "var(--amber)") + '">' + scheduledCount + "/3 cadence</span></div>" +
    week.map(function (w) {
      var inner = w.eps.length === 0
        ? '<span style="font-size:12px;color:rgba(140,128,144,.5)">—</span>'
        : w.eps.map(function (e) {
            return '<div style="display:flex;align-items:center;gap:7px;padding:2px 0">' +
              led(STATUS[e.status].color, false) +
              '<span style="font-size:12.5px;flex:1">' + esc(e.title) + "</span>" +
              (e.status === "ready" ? '<button class="btn small" onclick="A.markPosted(' + e.id + ')">📡 Mark posted</button>' : "") +
              "</div>";
          }).join("");
      return '<div class="dayrow"><span class="day">' + w.d + '</span><div style="flex:1">' + inner + "</div></div>";
    }).join("") + "</div>";

  h += '<div class="panel"><div class="slabel">ASSIGN DAYS — tap the day chip to cycle</div>';
  if (schedulable.length === 0) h += '<div style="font-size:13px;color:var(--dim)">Nothing in the pipeline — go dig stories.</div>';
  else h += schedulable.map(function (e) {
    return '<div class="assignrow">' + led(STATUS[e.status].color, false) +
      '<span class="t">' + esc(e.title) + "</span>" +
      '<button class="daychip' + (e.scheduledDay ? " set" : "") + '" onclick="A.cycleDay(' + e.id + ')">' + (e.scheduledDay || "DAY?") + "</button>" +
      '<button class="trash' + (state.confirmDelete === e.id ? " arm" : "") + '" onclick="A.del(' + e.id + ')">🗑</button></div>';
  }).join("");
  if (state.confirmDelete) h += '<div style="font-size:11px;color:var(--blood);margin-top:6px">Tap the trash again to delete permanently.</div>';
  h += "</div>";
  return h;
};

Object.assign(A, {
  cycleDay: function (id) {
    var ep = byId(id); if (!ep) return;
    var cur = ep.scheduledDay ? DAYS.indexOf(ep.scheduledDay) : -1;
    ep.scheduledDay = cur >= DAYS.length - 1 ? null : DAYS[cur + 1];
    save(); render();
  },
  markPosted: function (id) { patchEp(id, { status: "posted" }); render(); },
  del: function (id) {
    if (state.confirmDelete === id) {
      state.episodes = state.episodes.filter(function (e) { return e.id !== id; });
      state.confirmDelete = null; save();
    } else {
      state.confirmDelete = id;
      setTimeout(function () { if (state.confirmDelete === id) { state.confirmDelete = null; render(); } }, 2500);
    }
    render();
  },
});

/* ═══════════════ RESULTS ═══════════════ */
var STAT_KEYS = ["views", "likes", "comments", "saves", "follows"];

RENDER.results = function () {
  var posted = state.episodes.filter(function (e) { return e.status === "posted"; });
  var h = '<div class="panel raised"><div class="slabel">LOG NUMBERS — 48H AFTER POSTING</div>';
  if (posted.length === 0) h += '<div style="font-size:13px;color:var(--dim)">Nothing on air yet. Numbers appear here once you mark episodes posted.</div>';
  else h += posted.map(function (e) {
    var s = e.stats || {};
    return '<div style="padding:9px 0;border-bottom:1px solid var(--line)">' +
      '<div style="font-size:12.5px;margin-bottom:6px">' + esc(e.title) + "</div>" +
      '<div class="statgrid">' +
      STAT_KEYS.map(function (k) {
        return '<div><span class="sl">' + k.toUpperCase() + '</span><input type="number" placeholder="0" value="' + (s[k] !== undefined && s[k] !== "" ? esc(s[k]) : "") + '" oninput="A.stat(' + e.id + ",'" + k + "',this.value)\" /></div>";
      }).join("") + "</div></div>";
  }).join("");
  h += "</div>";

  if (posted.length > 0) {
    h += '<div class="panel"><div class="slabel">STRATEGIST</div>' +
      '<button class="btn" onclick="A.analyze()"' + (state.loading.analyze ? " disabled" : "") + ">" +
      (state.loading.analyze ? spinner() + " Reading the numbers..." : "▲ Analyze & recommend next episodes") + "</button>" +
      errbox("analyze") + "</div>";
  }

  if (state.learnings.length > 0) {
    h += '<div class="panel"><div class="slabel">LEARNINGS LOG — สมองของช่อง</div>' +
      state.learnings.slice().reverse().map(function (l) {
        return '<div class="learning"><div class="d">' + esc(l.date) + '</div><div class="t">' + esc(l.text) + "</div></div>";
      }).join("") +
      '<div class="notice" style="margin-top:8px">ทุกครั้งที่วิเคราะห์ บทเรียนจะถูกเก็บไว้ตรงนี้ และ AI จะอ่านของเก่าก่อนวิเคราะห์รอบใหม่ — ช่องเรียนรู้สะสมขึ้นเรื่อยๆ</div></div>';
  }
  return h;
};

Object.assign(A, {
  stat: function (id, key, val) {
    var ep = byId(id); if (!ep) return;
    ep.stats = ep.stats || {};
    ep.stats[key] = val === "" ? "" : Number(val);
    save(); // no re-render — keeps input focus
  },
  analyze: async function () {
    var posted = state.episodes.filter(function (e) { return e.status === "posted"; });
    rememberRetry("analyze");
    state.loading.analyze = true; clearErr("analyze"); render();
    try {
      var rows = posted.map(function (e) {
        var s = e.stats || {};
        return {
          title: e.title, artist: e.artist,
          hook: (e.script && e.script.hook) || (e.pitch && e.pitch.hook) || "",
          darkness: (e.pitch && e.pitch.darkness) || null,
          views: s.views || 0, likes: s.likes || 0, comments: s.comments || 0,
          saves: s.saves || 0, follows: s.follows || 0,
        };
      });
      var text = await callAI("analyze", P.analyze(rows), { max_tokens: 1800 });
      state.learnings.push({ date: new Date().toISOString().slice(0, 10), text: text.trim() });
      save();
    } catch (e) { setErr("analyze", e); }
    state.loading.analyze = false; render();
  },
});
