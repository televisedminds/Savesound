/* ═══════════════════════════════════════════════════════════
   เสพซาวด์ STUDIO v2 — CLIENTS (production house station)
   Client roster · monthly content plans · post scripts ·
   LINE pitch generator · สบส. compliance checker
   ═══════════════════════════════════════════════════════════ */

"use strict";

var CLIENT_TYPES = ["คลินิกเวชกรรม/ความงาม", "คลินิกทันตกรรม", "คลินิกกายภาพบำบัด", "คลินิกทั่วไป/เฉพาะทาง", "ร้านยา", "ธุรกิจสุขภาพอื่นๆ", "ธุรกิจทั่วไป (ไม่ใช่สายสุขภาพ)"];

RENDER.clients = function () {
  var c = clientById(state.selClient);
  if (c) return renderClientDetail(c);

  var h = '<div class="panel raised steelline"><div class="slabel" style="color:var(--steel)">CLIENT STUDIO — เครื่องมือรับงานลูกค้า</div>' +
    '<div style="font-size:13px;color:var(--dim);line-height:1.6">สมองเดียวกับที่ทำช่องเรา เอามารับงานคลินิก/ธุรกิจท้องถิ่น: วางแผนคอนเทนต์รายเดือน เขียนสคริปต์ เช็คกฎโฆษณาสถานพยาบาล และร่างข้อความ pitch — ครบใน 1 แท็บ</div></div>';

  /* client list */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">CLIENTS</div>' +
    '<button class="chipbtn" onclick="A.toggleAddClient()">' + (state.addingClient ? "close" : "+ add client") + "</button></div>";

  if (state.addingClient) {
    h += '<div class="idgrid" style="margin-bottom:10px">' +
      '<div><label>ชื่อลูกค้า/คลินิก</label><input type="text" id="ncName" placeholder="เช่น คลินิกหมอสมชาย" /></div>' +
      '<div><label>ประเภท</label><select id="ncType">' + CLIENT_TYPES.map(function (t) { return "<option>" + esc(t) + "</option>"; }).join("") + "</select></div>" +
      '<div><label>พื้นที่ (อำเภอ/จังหวัด)</label><input type="text" id="ncArea" placeholder="เช่น อ.เมือง เชียงใหม่" /></div>' +
      '<div><label>เป้าหมาย</label><input type="text" id="ncGoal" placeholder="เช่น เพิ่มคนไข้ใหม่ / ให้คนรู้จักหมอ" /></div>' +
      '<div><label>โทนแบรนด์</label><input type="text" id="ncVibe" placeholder="เช่น อบอุ่น เป็นกันเอง น่าเชื่อถือ" /></div>' +
      '<button class="btn small steel" onclick="A.addClient()">Add client</button></div>';
  }

  if (state.clients.length === 0 && !state.addingClient) {
    h += '<div style="font-size:13px;color:var(--dim);padding:6px 0">ยังไม่มีลูกค้า — กด + add client เพื่อเริ่ม</div>';
  }
  h += state.clients.map(function (cl) {
    return '<button class="clientrow" onclick="A.selClient(' + cl.id + ')">' +
      led(cl.plan ? "var(--moss)" : "var(--dim)", false) +
      '<span class="cname">' + esc(cl.name) + "<small>" + esc(cl.type) + (cl.area ? " · " + esc(cl.area) : "") + "</small></span>" +
      (cl.plan ? tag("PLAN ✓", "var(--moss)") : tag("NEW", "var(--dim)")) +
      '<span class="chev">›</span></button>';
  }).join("");
  h += "</div>";

  /* standalone compliance checker */
  h += renderCompliancePanel();
  return h;
};

function renderClientDetail(c) {
  var h = '<button class="backlink" onclick="A.selClient(null)">✕ back to clients</button>' +
    '<div style="display:flex;flex-direction:column;gap:12px">';

  h += '<div style="display:flex;align-items:center;gap:10px">' +
    '<div style="flex:1"><div class="f-display" style="font-size:17px;font-weight:800">' + esc(c.name) + "</div>" +
    '<div class="f-mono" style="font-size:10.5px;color:var(--dim);margin-top:2px">' + esc(c.type) + (c.area ? " · " + esc(c.area) : "") + "</div></div>" +
    '<button class="trash' + (state.confirmDelete === "c" + c.id ? " arm" : "") + '" onclick="A.delClient(' + c.id + ')">🗑</button></div>';

  /* pitch message */
  h += '<div class="panel steelline"><div class="rowsplit"><div class="slabel" style="color:var(--steel)">PITCH — ข้อความทัก LINE</div>' +
    '<div style="display:flex;gap:6px">' +
    (c.proposal ? '<button class="chipbtn" onclick="A.copyRaw(this,\'' + encodeURIComponent(c.proposal) + '\')">⧉ copy</button>' : "") +
    '<button class="chipbtn" onclick="A.genProposal(' + c.id + ')"' + (state.loading.proposal ? " disabled" : "") + ">" +
    (state.loading.proposal ? "◌" : (c.proposal ? "↻ redo" : "✦ write pitch")) + "</button></div></div>";
  if (c.proposal) h += '<div style="font-size:13px;line-height:1.65;white-space:pre-wrap">' + esc(c.proposal) + "</div>";
  else if (!state.loading.proposal) h += '<div class="notice">เขียนข้อความ pitch สั้นๆ ที่ฟังดูเข้าใจปัญหาคลินิกจริงๆ + ปิดด้วย free content audit — ก๊อปส่ง LINE ได้เลย (ตั้งชื่อ/คอนแทคของทีมได้ที่ HQ)</div>';
  h += errbox("proposal") + "</div>";

  /* monthly content plan */
  h += '<div class="panel"><div class="rowsplit"><div class="slabel">CONTENT PLAN — เดือนแรก (12 โพสต์)</div>' +
    '<div style="display:flex;gap:6px">' +
    (c.plan ? '<button class="chipbtn" onclick="A.copyPlan(this,' + c.id + ')">⧉ copy</button>' : "") +
    '<button class="chipbtn" onclick="A.genClientPlan(' + c.id + ')"' + (state.loading.cplan ? " disabled" : "") + ">" +
    (state.loading.cplan ? "◌" : (c.plan ? "↻ new plan" : "✦ build plan")) + "</button></div></div>";
  if (c.plan) {
    h += '<div style="font-size:12.5px;color:var(--steel);margin-bottom:6px">' + esc(c.plan.strategy) + "</div>" +
      (c.plan.posts || []).map(function (p, i) {
        var pilColor = p.pillar === "ความรู้" ? "var(--moss)" : p.pillar === "เบื้องหลัง" ? "var(--steel)" : p.pillar === "บริการ" ? "var(--amber)" : "var(--violet)";
        return '<div class="planrow"><span class="pd">W' + esc(p.week) + "·" + (i + 1) + '</span>' +
          '<div class="pmain"><div class="pt">' + tag(p.pillar, pilColor) + " " + tag(p.format) + " " + esc(p.title) + "</div>" +
          '<div class="ph">"' + esc(p.hook) + '" → ' + esc(p.cta) + "</div>" +
          (p.compliance && p.compliance !== "ปลอดภัย" ? '<div class="pc">⚠ ' + esc(p.compliance) + "</div>" : "") + "</div>" +
          '<button class="chipbtn" onclick="A.genClientPost(' + c.id + "," + i + ')"' + (state.loading.cpost ? " disabled" : "") + '>✍</button></div>';
      }).join("") +
      '<div class="notice" style="margin-top:8px">กด ✍ ท้ายโพสต์ไหน = เขียนสคริปต์เต็มของโพสต์นั้นด้านล่าง</div>';
  } else if (!state.loading.cplan) {
    h += '<div class="notice">แผน 1 เดือน 12 โพสต์ แบ่ง 4 เสา (ความรู้/เบื้องหลัง/บริการ/เอนเกจ) พร้อมธงกฎหมายรายโพสต์ — นี่คือของที่เอาไปเสนอลูกค้าแล้วดูเป็นมืออาชีพทันที</div>';
  }
  h += errbox("cplan") + "</div>";

  /* post script */
  h += '<div class="panel"><div class="slabel">POST SCRIPT — สคริปต์คลิปลูกค้า</div>' +
    '<input type="text" id="postBrief" placeholder="โจทย์คลิป เช่น แนะนำหมอ / อธิบายบริการ x / ตอบคำถามที่พบบ่อย" />' +
    '<div style="margin-top:8px"><button class="btn small steel" onclick="A.genClientPostFree(' + c.id + ')"' + (state.loading.cpost ? " disabled" : "") + ">" +
    (state.loading.cpost ? spinner() + " Writing..." : "✍ Write 30-45s script") + "</button></div>";
  if (c.lastPost) {
    var lp = c.lastPost;
    var postText = ["HOOK: " + lp.hook]
      .concat((lp.beats || []).map(function (b, i) { return (i + 1) + ". พูด: " + b.vo + "\n   ภาพ: " + b.visual; }))
      .concat(["CTA: " + lp.cta, "", "CAPTION: " + lp.caption, (lp.hashtags || []).map(function (t) { return "#" + t; }).join(" "), "", "⚠ " + (lp.complianceNote || "")]).join("\n");
    h += '<div style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px">' +
      '<div class="rowsplit"><div class="hookblock" style="margin-bottom:8px;flex:1"><div class="tc">HOOK</div><div class="line" style="font-size:14.5px">' + esc(lp.hook) + "</div></div>" +
      '<button class="chipbtn" onclick="A.copyRaw(this,\'' + encodeURIComponent(postText) + '\')">⧉ copy</button></div>' +
      (lp.beats || []).map(function (b, i) {
        return '<div class="scriptsec"><div class="meta">BEAT ' + (i + 1) + '</div><div class="vo">' + esc(b.vo) + '</div><div class="vis">🎬 ' + esc(b.visual) + "</div></div>";
      }).join("") +
      '<div style="font-size:12.5px;margin-top:8px"><b class="moss">CTA —</b> ' + esc(lp.cta) + "</div>" +
      '<div style="font-size:12.5px;margin-top:4px"><b class="steel">Caption —</b> ' + esc(lp.caption) + ' <span class="f-mono" style="font-size:10.5px;color:var(--steel)">' + (lp.hashtags || []).map(function (t) { return "#" + esc(t); }).join(" ") + "</span></div>" +
      (lp.complianceNote ? '<div style="font-size:12px;color:var(--amber);margin-top:6px">⚠ ' + esc(lp.complianceNote) + "</div>" : "") +
      "</div>";
  }
  h += errbox("cpost") + "</div>";

  /* compliance checker */
  h += renderCompliancePanel();
  return h + "</div>";
}

function renderCompliancePanel() {
  var r = state.complianceResult;
  var h = '<div class="panel"><div class="slabel">🛡 COMPLIANCE CHECK — เช็คก่อนโพสต์ (กฎ สบส.)</div>' +
    '<div class="notice" style="margin-bottom:8px">วางแคปชัน/สคริปต์/ข้อความโฆษณาของคลินิก → เช็คตาม พ.ร.บ.สถานพยาบาลฯ ม.38: คำต้องห้าม การันตีผล before/after รีวิวคนไข้ ลดแลกแจกแถม ฯลฯ พร้อมเวอร์ชันแก้ให้โพสต์ได้จริง</div>' +
    '<textarea id="compInput" rows="4" placeholder="เช่น คลินิกเราดีที่สุดในย่านนี้ การันตีเห็นผลใน 7 วัน ลด 50% เฉพาะเดือนนี้!"></textarea>' +
    '<div style="margin-top:8px"><button class="btn small" onclick="A.checkCompliance()"' + (state.loading.comp ? " disabled" : "") + ">" +
    (state.loading.comp ? spinner() + " Checking..." : "🛡 Check") + "</button></div>";

  if (r) {
    var cls = r.risk === "เขียว" ? "green" : r.risk === "เหลือง" ? "yellow" : "red";
    h += '<div style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px">' +
      '<div style="display:flex;align-items:center;gap:10px"><span class="risk ' + cls + '">' + esc(r.risk) + '</span>' +
      '<div style="font-size:12.5px;flex:1">' + esc(r.summary) + "</div></div>" +
      (r.issues || []).map(function (it) {
        return '<div class="issue"><div class="q">✗ "' + esc(it.text) + '"</div>' +
          '<div class="w">' + esc(it.why) + '</div>' +
          '<div class="f">→ ' + esc(it.fix) + "</div></div>";
      }).join("") +
      (r.rewrite ? '<div class="subhead">เวอร์ชันโพสต์ได้</div><div class="rowsplit" style="align-items:flex-start"><div style="font-size:13px;line-height:1.65;white-space:pre-wrap;flex:1">' + esc(r.rewrite) + '</div>' +
        '<button class="chipbtn" onclick="A.copyRaw(this,\'' + encodeURIComponent(r.rewrite) + '\')">⧉</button></div>' : "") +
      (r.reminder ? '<div style="font-size:12px;color:var(--amber);margin-top:8px">📋 ' + esc(r.reminder) + "</div>" : "") +
      "</div>";
  }
  h += errbox("comp") +
    '<div class="f-mono" style="font-size:9.5px;color:var(--dim);margin-top:10px;line-height:1.6">อ้างอิง: พ.ร.บ.สถานพยาบาล พ.ศ.2541 ม.38 · ฝ่าฝืนปรับสูงสุด 20,000฿ + รายวัน 10,000฿ · เครื่องมือนี้ช่วยกรองเบื้องต้น ไม่ใช่คำปรึกษากฎหมาย — ชิ้นงานโฆษณาต้องยื่นขออนุมัติ (ฆสพ.) ในนามผู้รับอนุญาตของคลินิก</div></div>';
  return h;
}

Object.assign(A, {
  selClient: function (id) { state.selClient = id; state.complianceResult = null; render(); },
  toggleAddClient: function () { state.addingClient = !state.addingClient; render(); },

  addClient: function () {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var name = g("ncName");
    if (!name) return;
    state.clients.push({
      id: uid(), name: name, type: g("ncType") || CLIENT_TYPES[0],
      area: g("ncArea"), goal: g("ncGoal"), vibe: g("ncVibe"),
      plan: null, proposal: null, lastPost: null, createdAt: Date.now(),
    });
    state.addingClient = false;
    save(); render();
  },

  delClient: function (id) {
    if (state.confirmDelete === "c" + id) {
      state.clients = state.clients.filter(function (c) { return c.id !== id; });
      state.confirmDelete = null; state.selClient = null; save();
    } else {
      state.confirmDelete = "c" + id;
      setTimeout(function () { if (state.confirmDelete === "c" + id) { state.confirmDelete = null; render(); } }, 2500);
    }
    render();
  },

  genProposal: async function (id) {
    var c = clientById(id); if (!c) return;
    rememberRetry("genProposal", [id]);
    state.loading.proposal = true; clearErr("proposal"); render();
    try {
      var raw = await callAI("clientProposal", P.clientProposal(c), { max_tokens: 1200, effort: "medium", ctx: { client: c } });
      c.proposal = extractJson(raw).message;
      save();
    } catch (e) { setErr("proposal", e); }
    state.loading.proposal = false; render();
  },

  genClientPlan: async function (id) {
    var c = clientById(id); if (!c) return;
    rememberRetry("genClientPlan", [id]);
    state.loading.cplan = true; clearErr("cplan"); render();
    try {
      var raw = await callAI("clientPlan", P.clientPlan(c), { max_tokens: 5000 });
      c.plan = extractJson(raw);
      save();
    } catch (e) { setErr("cplan", e); }
    state.loading.cplan = false; render();
  },

  copyPlan: function (btn, id) {
    var c = clientById(id); if (!c || !c.plan) return;
    var text = "CONTENT PLAN — " + c.name + " (1 เดือน / 12 โพสต์)\n" + c.plan.strategy + "\n\n" +
      (c.plan.posts || []).map(function (p, i) {
        return "W" + p.week + " โพสต์ " + (i + 1) + " [" + p.pillar + " · " + p.format + "]\n" +
          "  " + p.title + "\n  Hook: " + p.hook + "\n  CTA: " + p.cta +
          (p.compliance && p.compliance !== "ปลอดภัย" ? "\n  ⚠ " + p.compliance : "");
      }).join("\n\n");
    copyText(text, btn);
  },

  genClientPost: async function (cid, planIdx) {
    var c = clientById(cid); if (!c || !c.plan || !c.plan.posts[planIdx]) return;
    var p = c.plan.posts[planIdx];
    var brief = p.title + " — hook: " + p.hook + " — pillar: " + p.pillar + " — format: " + p.format;
    A._runClientPost(c, brief);
  },
  genClientPostFree: function (cid) {
    var c = clientById(cid); if (!c) return;
    var el = document.getElementById("postBrief");
    var brief = el ? el.value.trim() : "";
    if (!brief) { state.errors.cpost = "พิมพ์โจทย์คลิปก่อน"; render(); return; }
    A._runClientPost(c, brief);
  },
  retryClientPost: function (cid, brief) {
    var c = clientById(cid);
    if (c) A._runClientPost(c, brief);
  },
  _runClientPost: async function (c, brief) {
    rememberRetry("retryClientPost", [c.id, brief]);
    state.loading.cpost = true; clearErr("cpost"); render();
    try {
      var raw = await callAI("clientPost", P.clientPost(c, brief), { max_tokens: 2500 });
      c.lastPost = extractJson(raw);
      save();
    } catch (e) { setErr("cpost", e); }
    state.loading.cpost = false; render();
    var el = document.getElementById("postBrief");
    if (el && state.errors.cpost) el.value = brief;
  },

  checkCompliance: async function () {
    var el = document.getElementById("compInput");
    var text = el ? el.value.trim() : "";
    if (!text) { state.errors.comp = "วางข้อความที่จะเช็คก่อน"; render(); return; }
    rememberRetry("checkCompliance");
    state._compKeep = text;
    state.loading.comp = true; clearErr("comp"); state.complianceResult = null; render();
    try {
      var raw = await callAI("compliance", P.compliance(text), { max_tokens: 2500 });
      state.complianceResult = extractJson(raw);
    } catch (e) { setErr("comp", e); }
    state.loading.comp = false; render();
    var el2 = document.getElementById("compInput");
    if (el2) el2.value = state._compKeep || "";
  },
});
