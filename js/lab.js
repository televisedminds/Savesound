/* ═══════════════════════════════════════════════════════════
   เสพซาวด์ STUDIO v2 — LAB (creative thinking station)
   Angle storm · Format flip · Trend remix · Series pitch · Hook clinic
   ═══════════════════════════════════════════════════════════ */

"use strict";

var LAB_MODES = [
  { id: "angles", label: "🌀 Angle storm", ph: "หัวข้อ/ศิลปิน ที่อยากหามุมใหม่ เช่น Nirvana", note: "หัวข้อเดียว → 8 มุมเล่าที่ต่างกันสุดขั้ว เลือกมุมที่คนอื่นไม่เคยเล่า", toPipe: true },
  { id: "formats", label: "🧪 Format flip", ph: "(เว้นว่างได้) ทิศทางที่อยากได้ เช่น ทำเร็วขึ้น", note: "คิดฟอร์แมตรายการใหม่ที่ใช้สกิลเดิมของช่อง แต่หน้าตาใหม่ในฟีด", toPipe: false },
  { id: "trend", label: "📈 Trend remix", ph: "แปะเทรนด์/เสียง/มีมที่เห็นมา เช่น เสียง xxx กำลังไวรัล", note: "ขี่เทรนด์โดยไม่ทิ้งตัวตนช่อง — ทุกไอเดียทำจบใน 48 ชม.", toPipe: true },
  { id: "series", label: "📦 Series pitch", ph: "(เว้นว่างได้) โจทย์ เช่น ซีรีส์ที่คนต้องกดติดตาม", note: "ซีรีส์ = เหตุผลให้คนกด follow ไม่ใช่แค่ดูจบแล้วไป", toPipe: false },
  { id: "hookfix", label: "🪝 Hook clinic", ph: "วางฮุคที่เขียนไว้ ให้หมอตรวจ", note: "วินิจฉัยว่าทำไมฮุคยังไม่ทิ่ม แล้วรีไรต์ 5 แบบด้วย trigger ต่างกัน", toPipe: false },
];

function labMode() {
  return LAB_MODES.find(function (m) { return m.id === state.labMode; }) || LAB_MODES[0];
}

RENDER.lab = function () {
  var m = labMode();
  var h = '<div class="panel raised"><div class="slabel">CREATIVE LAB — คู่คิดตอนตัน</div>' +
    '<div class="chiprow" style="padding-top:2px">' +
    LAB_MODES.map(function (x) {
      return '<button class="modechip' + (state.labMode === x.id ? " active" : "") + '" onclick="A.labSetMode(\'' + x.id + "')\">" + x.label + "</button>";
    }).join("") + "</div>" +
    '<div class="notice" style="margin:6px 0 10px">' + esc(m.note) + "</div>" +
    '<input type="text" id="labInput" placeholder="' + esc(m.ph) + '" />' +
    '<div style="margin-top:10px"><button class="btn violet" onclick="A.labRun()"' + (state.loading.lab ? " disabled" : "") + ">" +
    (state.loading.lab ? spinner() + " Thinking..." : "💡 Run " + m.label.replace(/^\S+\s/, "")) + "</button></div>" +
    errbox("lab") + "</div>";

  /* hook clinic result (object) */
  if (state.labMode === "hookfix" && state.labCards && state.labCards.diagnosis) {
    var d = state.labCards;
    h += '<div class="panel"><div class="slabel">DIAGNOSIS</div>' +
      '<div style="font-size:13px;line-height:1.6">' + esc(d.diagnosis) + "</div>" +
      '<div class="subhead">REWRITES</div>' +
      (d.rewrites || []).map(function (r) {
        return '<div class="altrow"><div class="t">"' + esc(r.hook) + '"' +
          '<div style="font-size:10.5px;color:var(--violet);margin-top:2px">' + esc(r.trigger) + "</div></div>" +
          '<button class="chipbtn" onclick="A.copyRaw(this,\'' + encodeURIComponent(r.hook) + "')\">⧉</button></div>";
      }).join("") + "</div>";
    return h;
  }

  /* card list results */
  if (Array.isArray(state.labCards) && state.labCards.length > 0) {
    var canPipe = m.toPipe;
    h += state.labCards.map(function (c, i) {
      return '<div class="panel"><div class="labcard" style="border:none;padding:0">' +
        '<div class="rowsplit" style="align-items:flex-start"><div class="lt" style="flex:1">' + esc(c.title) + "</div>" +
        (canPipe ? '<button class="chipbtn' + (state.labPicked[i] ? " ok" : "") + '" onclick="A.labPipe(' + i + ')">' + (state.labPicked[i] ? "✓ in pipeline" : "+ pipeline") + "</button>" : "") + "</div>" +
        (c.artist ? '<div class="f-mono" style="font-size:10.5px;color:var(--dim);margin-top:2px">' + esc(c.artist) + (c.song && c.song !== "-" ? " — " + esc(c.song) : "") + "</div>" : "") +
        (c.hook ? '<div class="lh">"' + esc(c.hook) + '"</div>' : "") +
        (c.summary ? '<div class="lm">' + esc(c.summary) + "</div>" : "") +
        (c.angle ? '<div class="lw">▸ ' + esc(c.angle) + "</div>" : "") +
        (c.episodes ? '<div class="lm" style="margin-top:6px">ตอนตัวอย่าง: ' + c.episodes.map(esc).join(" · ") + "</div>" : "") +
        "</div></div>";
    }).join("");
  }
  return h;
};

Object.assign(A, {
  labSetMode: function (id) { state.labMode = id; state.labCards = []; state.labPicked = {}; clearErr("lab"); render(); },
  labRun: async function () {
    var input = (document.getElementById("labInput") || {}).value || "";
    if (state.labMode === "hookfix" && !input.trim()) {
      state.errors.lab = "วางฮุคที่จะให้ตรวจก่อน"; render(); return;
    }
    rememberRetry("labRun");
    state.loading.lab = true; clearErr("lab"); state.labCards = []; state.labPicked = {}; render();
    var keep = input;
    try {
      var raw = await callAI("lab", P.lab(state.labMode, input.trim()), { max_tokens: 3500, ctx: { mode: state.labMode } });
      state.labCards = extractJson(raw);
    } catch (e) { setErr("lab", e); }
    state.loading.lab = false; render();
    var el = document.getElementById("labInput"); if (el) el.value = keep;
  },
  labPipe: function (i) {
    var c = state.labCards[i];
    if (!c || state.labPicked[i]) return;
    addEpisodeFromPitch({
      title: c.title, artist: c.artist || "", song: c.song || "",
      hook: c.hook || "", summary: c.summary || "", angle: c.angle || "", darkness: c.darkness || 7,
    });
    state.labPicked[i] = true;
    save(); render();
  },
});
