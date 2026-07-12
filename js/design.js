/* ═══════════════════════════════════════════════════════════
   เสพซาวด์ STUDIO v2 — DESIGN (graphic designer station)
   AI art direction → canvas-rendered 9:16 covers → PNG export
   Layout engines: poster · evidence · tabloid
   ═══════════════════════════════════════════════════════════ */

"use strict";

var COVER_W = 1080, COVER_H = 1920;
var SAFE = { top: 130, bottom: 340, right: 120, left: 40 }; // TikTok UI margins

var showSafeZone = false;

/* ---------- font loading ---------- */
var fontsReady = false;
async function ensureFonts() {
  if (fontsReady) return;
  try {
    await Promise.all([
      document.fonts.load('900 150px Kanit', 'ทดสอบ'),
      document.fonts.load('800 110px Kanit', 'ทดสอบ'),
      document.fonts.load('700 56px Kanit', 'ทดสอบ'),
      document.fonts.load('500 44px Kanit', 'ทดสอบ'),
      document.fonts.load('700 30px "Space Mono"', 'TEST'),
      document.fonts.load('400 30px "Space Mono"', 'TEST'),
    ]);
    await document.fonts.ready;
  } catch (e) { /* system fallback still renders */ }
  fontsReady = true;
}

/* ---------- draw helpers ---------- */
var TH_COMBINING = /[ัำ-ฺ็-๎]/; // sara am, above/below vowels, tone marks
var TH_LEAD = /[เ-ไ]/; // เ แ โ ใ ไ — must stay in front of the next consonant

function safeCut(w, cut) {
  // never split a Thai combining mark from its base, or orphan a leading vowel
  while (cut > 1 && TH_COMBINING.test(w[cut])) cut--;
  while (cut > 1 && TH_LEAD.test(w[cut - 1])) cut--;
  return cut;
}

function wrapLines(ctx, text, maxWidth) {
  // respect explicit \n, then wrap on spaces, then hard-break long runs (Thai-safe)
  var out = [];
  String(text).split(/\n/).forEach(function (para) {
    var words = para.split(" ").filter(function (w) { return w !== ""; });
    var line = "";
    words.forEach(function (w) {
      var test = line ? line + " " + w : w;
      if (ctx.measureText(test).width <= maxWidth) { line = test; return; }
      if (line) out.push(line);
      while (ctx.measureText(w).width > maxWidth && w.length > 2) {
        var cut = w.length;
        while (cut > 1 && ctx.measureText(w.slice(0, cut)).width > maxWidth) cut--;
        cut = safeCut(w, cut);
        if (cut < 2) break;
        out.push(w.slice(0, cut));
        w = w.slice(cut);
      }
      line = w;
    });
    if (line) out.push(line);
  });
  return out;
}

function fitTitle(ctx, text, maxWidth, startSize, weight, maxLines) {
  // shrink until (a) every space/newline-delimited word fits without breaking
  // and (b) the wrapped block is within maxLines. Hard-break only as last resort.
  var size = startSize;
  var lines;
  var words = String(text).split(/[\n ]+/).filter(function (w) { return w !== ""; });
  while (size > 40) {
    ctx.font = weight + " " + size + "px Kanit, sans-serif";
    var widest = 0;
    words.forEach(function (w) { widest = Math.max(widest, ctx.measureText(w).width); });
    lines = wrapLines(ctx, text, maxWidth);
    if (widest <= maxWidth && lines.length <= maxLines) break;
    size -= 8;
  }
  return { size: size, lines: lines || [text] };
}

function drawGrain(ctx, amount) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (var i = 0; i < amount; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(Math.random() * COVER_W, Math.random() * COVER_H, 2, 2);
  }
  ctx.restore();
}

function drawVignette(ctx) {
  var g = ctx.createRadialGradient(COVER_W / 2, COVER_H / 2, COVER_H * 0.28, COVER_W / 2, COVER_H / 2, COVER_H * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, COVER_W, COVER_H);
}

function drawSafeZone(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(196,48,43,0.18)";
  ctx.fillRect(0, 0, COVER_W, SAFE.top);
  ctx.fillRect(0, COVER_H - SAFE.bottom, COVER_W, SAFE.bottom);
  ctx.fillRect(COVER_W - SAFE.right, SAFE.top, SAFE.right, COVER_H - SAFE.top - SAFE.bottom);
  ctx.strokeStyle = "rgba(196,48,43,0.6)";
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.strokeRect(SAFE.left, SAFE.top, COVER_W - SAFE.left - SAFE.right, COVER_H - SAFE.top - SAFE.bottom);
  ctx.restore();
}

/* ---------- layout engines ---------- */
function drawPoster(ctx, c, opts) {
  var withBg = !opts.transparent;
  if (withBg) {
    var g = ctx.createLinearGradient(0, 0, 0, COVER_H);
    g.addColorStop(0, c.bg);
    g.addColorStop(1, shade(c.bg, -14));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, COVER_W, COVER_H);
  }

  // top tag
  ctx.textAlign = "center";
  ctx.fillStyle = c.accent;
  ctx.font = '700 30px "Space Mono", monospace';
  try { ctx.letterSpacing = "10px"; } catch (e) {}
  ctx.fillText((c.tagline || "TRUE STORY").toUpperCase(), COVER_W / 2, 260);
  try { ctx.letterSpacing = "0px"; } catch (e) {}
  ctx.fillRect(COVER_W / 2 - 60, 292, 120, 6);

  // title
  var fit = fitTitle(ctx, c.title, COVER_W - 160, 165, 900, 4);
  ctx.font = "900 " + fit.size + "px Kanit, sans-serif";
  ctx.fillStyle = c.text;
  var lh = fit.size * 1.22;
  var totalH = fit.lines.length * lh;
  var y = COVER_H * 0.46 - totalH / 2 + fit.size * 0.8;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  fit.lines.forEach(function (ln) { ctx.fillText(ln, COVER_W / 2, y); y += lh; });
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // subtitle
  if (c.subtitle) {
    ctx.font = "500 46px Kanit, sans-serif";
    ctx.fillStyle = mix(c.text, c.bg, 0.35);
    wrapLines(ctx, c.subtitle, COVER_W - 240).forEach(function (ln) {
      ctx.fillText(ln, COVER_W / 2, y + 14); y += 62;
    });
  }

  // bottom series lockup
  ctx.fillStyle = c.accent;
  ctx.fillRect(COVER_W / 2 - 24, COVER_H - 470, 48, 8);
  ctx.font = "700 52px Kanit, sans-serif";
  ctx.fillStyle = c.text;
  ctx.fillText(state.settings.seriesName, COVER_W / 2, COVER_H - 390);

  if (withBg) { drawVignette(ctx); drawGrain(ctx, 2600); }
}

function drawEvidence(ctx, c, opts) {
  var withBg = !opts.transparent;
  if (withBg) {
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, COVER_W, COVER_H);
    // faint oversized watermark
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.font = "900 300px Kanit, sans-serif";
    ctx.fillStyle = c.text;
    ctx.textAlign = "center";
    ctx.translate(COVER_W / 2, COVER_H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("CASE", 0, 0);
    ctx.restore();
  }

  // top-left mono label
  ctx.textAlign = "left";
  ctx.font = '400 32px "Space Mono", monospace';
  ctx.fillStyle = mix(c.text, c.bg, 0.4);
  ctx.fillText("DO NOT LOSE THIS FILE", 80, 230);
  ctx.fillStyle = c.accent;
  ctx.fillText((c.tagline || "CASE FILE").toUpperCase(), 80, 285);

  // tilted evidence frame
  ctx.save();
  ctx.translate(COVER_W / 2, COVER_H * 0.47);
  ctx.rotate(-0.045);
  var fw = COVER_W - 200, fh = 780;
  if (withBg) {
    ctx.fillStyle = shade(c.bg, 8);
    ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
  }
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 7;
  ctx.setLineDash([26, 16]);
  ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
  ctx.setLineDash([]);

  // title inside frame
  ctx.textAlign = "center";
  var fit = fitTitle(ctx, c.title, fw - 130, 122, 800, 4);
  ctx.font = "800 " + fit.size + "px Kanit, sans-serif";
  ctx.fillStyle = c.text;
  var lh = fit.size * 1.25;
  var y = -((fit.lines.length - 1) * lh) / 2 - 30;
  fit.lines.forEach(function (ln) { ctx.fillText(ln, 0, y + fit.size * 0.35); y += lh; });

  if (c.subtitle) {
    ctx.font = '400 34px "Space Mono", monospace';
    ctx.fillStyle = c.accent;
    ctx.fillText(c.subtitle, 0, fh / 2 - 70);
  }
  ctx.restore();

  // stamp circle
  ctx.save();
  ctx.translate(COVER_W - 260, COVER_H - 560);
  ctx.rotate(0.18);
  ctx.strokeStyle = c.accent;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 105, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 84, 0, Math.PI * 2); ctx.stroke();
  ctx.font = "800 38px Kanit, sans-serif";
  ctx.fillStyle = c.accent;
  ctx.textAlign = "center";
  ctx.fillText("เรื่องจริง", 0, 14);
  ctx.restore();

  // bottom series
  ctx.textAlign = "left";
  ctx.font = "700 46px Kanit, sans-serif";
  ctx.fillStyle = c.text;
  ctx.fillText(state.settings.seriesName, 80, COVER_H - 400);

  if (withBg) { drawVignette(ctx); drawGrain(ctx, 2200); }
}

function drawTabloid(ctx, c, opts) {
  var withBg = !opts.transparent;
  if (withBg) {
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, COVER_W, COVER_H);
  }

  // top banner
  ctx.fillStyle = c.accent;
  ctx.fillRect(0, 170, COVER_W, 130);
  ctx.font = "800 60px Kanit, sans-serif";
  ctx.fillStyle = withBg ? c.bg : "#111";
  ctx.textAlign = "center";
  ctx.fillText(state.settings.seriesName, COVER_W / 2, 258);

  // headline strips — each line on a bone strip, offset like paper cutouts
  ctx.textAlign = "left";
  var fit = fitTitle(ctx, c.title, COVER_W - 300, 128, 900, 4);
  ctx.font = "900 " + fit.size + "px Kanit, sans-serif";
  var lh = fit.size * 1.42;
  var blockH = fit.lines.length * lh;
  var y = COVER_H * 0.47 - blockH / 2;
  fit.lines.forEach(function (ln, i) {
    var w = ctx.measureText(ln).width;
    var x = 90 + (i % 2) * 46;
    ctx.fillStyle = c.text;
    ctx.fillRect(x - 26, y - fit.size * 0.92, w + 52, fit.size * 1.32);
    ctx.fillStyle = c.bg === "#000000" ? "#0d0b10" : c.bg;
    ctx.fillText(ln, x, y + fit.size * 0.16);
    y += lh;
  });

  // subtitle
  if (c.subtitle) {
    ctx.font = "600 46px Kanit, sans-serif";
    ctx.fillStyle = c.accent;
    ctx.fillText(c.subtitle, 92, y + 30);
  }

  // barcode bottom-left
  var bx = 90, by = COVER_H - 520;
  ctx.fillStyle = c.text;
  for (var i = 0; i < 34; i++) {
    var bw = 4 + Math.floor(Math.random() * 10);
    ctx.fillRect(bx, by, bw, 90);
    bx += bw + 6;
    if (bx > 480) break;
  }
  ctx.font = '400 28px "Space Mono", monospace';
  ctx.fillStyle = mix(c.text, c.bg, 0.4);
  ctx.fillText((c.tagline || "TRUE STORY").toUpperCase() + " · " + new Date().getFullYear(), 90, by + 140);

  if (withBg) { drawGrain(ctx, 2000); }
}

/* color utils */
function hexRgb(hex) {
  var m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return { r: 18, g: 16, b: 20 };
  var n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shade(hex, amt) {
  var c = hexRgb(hex);
  var f = function (v) { return Math.max(0, Math.min(255, v + amt)); };
  return "rgb(" + f(c.r) + "," + f(c.g) + "," + f(c.b) + ")";
}
function mix(hexA, hexB, t) {
  var a = hexRgb(hexA), b = hexRgb(hexB);
  var f = function (x, y) { return Math.round(x + (y - x) * t); };
  return "rgb(" + f(a.r, b.r) + "," + f(a.g, b.g) + "," + f(a.b, b.b) + ")";
}

var LAYOUT_FNS = { poster: drawPoster, evidence: drawEvidence, tabloid: drawTabloid };

async function paintConcept(canvas, concept, opts) {
  await ensureFonts();
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, COVER_W, COVER_H);
  ctx.textBaseline = "alphabetic";
  var fn = LAYOUT_FNS[concept.layout] || drawPoster;
  fn(ctx, concept, opts || {});
  if (showSafeZone && !(opts && opts.transparent) && !(opts && opts.exporting)) drawSafeZone(ctx);
}

/* ---------- station render ---------- */
RENDER.design = function () {
  var ep = byId(state.sel);
  if (!ep) {
    var h0 = renderWorkList(function () { return true; }, "Add episodes first — dig stories or run the Lab.");
    h0 += renderBrandKitPanel();
    return h0;
  }

  var h = backlink() + '<div style="display:flex;flex-direction:column;gap:12px">' + epHeader(ep);
  var d = ep.design;

  h += '<div class="panel raised"><div class="rowsplit"><div class="slabel">COVER LAB — ปกตอนนี้</div>' +
    '<div style="display:flex;gap:6px">' +
    (d ? '<button class="chipbtn' + (showSafeZone ? " ok" : "") + '" onclick="A.toggleSafe()">▦ safe zone</button>' : "") +
    '<button class="chipbtn" onclick="A.genDesign(' + ep.id + ')"' + (state.loading.design ? " disabled" : "") + ">" +
    (state.loading.design ? "◌" : (d ? "↻ new 3 concepts" : "✦ generate 3 concepts")) + "</button></div></div>";

  if (!d && !state.loading.design) {
    h += '<div class="notice">AI ออกแบบปก 3 คอนเซ็ปต์ (3 เลย์เอาต์ต่างกัน) → พรีวิวจริง → โหลดเป็น PNG 1080×1920 เอาไปใช้/วางทับฟุตเทจใน CapCut ได้ทันที</div>';
  }
  if (state.loading.design) h += '<div style="font-size:13px;color:var(--dim)">' + spinner() + " Art directing...</div>";

  if (d) {
    h += '<div class="covergrid">' +
      d.map(function (c, i) {
        return '<div class="coverbox">' +
          '<canvas id="cv' + ep.id + "_" + i + '" width="' + COVER_W + '" height="' + COVER_H + '"></canvas>' +
          '<div class="covernote"><b>' + esc(c.mood || "") + "</b> · " + esc(c.designNote || "") + "</div>" +
          '<div class="cactions">' +
          '<button class="chipbtn" onclick="A.dlCover(' + ep.id + "," + i + ',false)">⬇ PNG</button>' +
          '<button class="chipbtn" onclick="A.dlCover(' + ep.id + "," + i + ',true)">⬇ โปร่งใส</button>' +
          '<button class="chipbtn" onclick="A.copySpec(this,' + ep.id + "," + i + ')">⧉ spec</button>' +
          "</div></div>";
      }).join("") + "</div>";
    queueAfterRender(function () {
      d.forEach(function (c, i) {
        var cv = document.getElementById("cv" + ep.id + "_" + i);
        if (cv) paintConcept(cv, c, {});
      });
    });
  }
  h += errbox("design") + "</div>";

  h += renderBrandKitPanel();
  return h + "</div>";
};

function renderBrandKitPanel() {
  var k = state.settings.brandKit;
  var h = '<div class="panel"><div class="rowsplit"><div class="slabel">BRAND KIT — คู่มือหน้าตาช่อง</div>' +
    '<button class="chipbtn" onclick="A.genBrandKit()"' + (state.loading.brandkit ? " disabled" : "") + ">" +
    (state.loading.brandkit ? "◌" : (k ? "↻ regenerate" : "✦ generate from identity")) + "</button></div>";
  if (!k && !state.loading.brandkit) {
    h += '<div class="notice">สร้างคู่มือดีไซน์จากตัวตนช่อง: พาเลตสี (กดก๊อป hex ได้) ฟอนต์ สเปค caption/lower-third แนวโลโก้ และข้อห้าม — ใช้เองหรือส่งให้คนทำกราฟิกก็รู้เรื่อง</div>';
  }
  if (k) {
    h += '<div class="palette">' + (k.palette || []).map(function (p) {
      return '<button class="swatch" onclick="A.copyRaw(this,\'' + encodeURIComponent(p.hex) + '\')" title="' + esc(p.use) + '">' +
        '<span class="c" style="background:' + esc(p.hex) + '"></span><span class="h">' + esc(p.hex) + "</span></button>";
    }).join("") + "</div>" +
      '<div class="kitline"><b>Fonts:</b> ' + esc(k.fonts && k.fonts.display) + " / " + esc(k.fonts && k.fonts.body) + ' <span class="dim">— ' + esc(k.fonts && k.fonts.rule) + "</span></div>" +
      '<div class="kitline"><b>Caption:</b> ' + esc(k.caption && k.caption.style) + ' <span class="dim">(' + esc(k.caption && k.caption.rule) + ")</span></div>" +
      '<div class="kitline"><b>Lower third:</b> ' + esc(k.lowerThird) + "</div>" +
      '<div class="kitline"><b>Logo:</b> ' + esc(k.logo) + "</div>" +
      '<div class="kitline"><b class="blood">Don\'t:</b> ' + (k.donts || []).map(esc).join(" · ") + "</div>";
  }
  h += errbox("brandkit") + "</div>";
  return h;
}

Object.assign(A, {
  toggleSafe: function () { showSafeZone = !showSafeZone; render(); },

  genDesign: async function (id) {
    var ep = byId(id); if (!ep) return;
    rememberRetry("genDesign", [id]);
    state.loading.design = true; clearErr("design"); render();
    try {
      var raw = await callAI("design", P.design(ep), { max_tokens: 2200 });
      var arr = extractJson(raw);
      ep.design = Array.isArray(arr) ? arr.slice(0, 3) : null;
      save();
    } catch (e) { setErr("design", e); }
    state.loading.design = false; render();
  },

  dlCover: async function (id, i, transparent) {
    var ep = byId(id); if (!ep || !ep.design || !ep.design[i]) return;
    var off = document.createElement("canvas");
    off.width = COVER_W; off.height = COVER_H;
    await paintConcept(off, ep.design[i], { transparent: transparent, exporting: true });
    off.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      var idx = state.episodes.indexOf(ep) + 1;
      a.download = "cover-EP" + String(idx).padStart(3, "0") + "-" + (i + 1) + (transparent ? "-overlay" : "") + ".png";
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  },

  copySpec: function (btn, id, i) {
    var ep = byId(id); if (!ep || !ep.design || !ep.design[i]) return;
    var c = ep.design[i];
    var spec = "COVER SPEC — " + ep.title + " (concept " + (i + 1) + ")\n" +
      "Layout: " + c.layout + "\nBG: " + c.bg + "\nAccent: " + c.accent + "\nText: " + c.text +
      "\nTitle: " + c.title + "\nSubtitle: " + (c.subtitle || "-") + "\nTag: " + (c.tagline || "-") +
      "\nMood: " + (c.mood || "-") + "\nImage direction: " + (c.designNote || "-") +
      "\nSize: 1080x1920 (9:16) · Fonts: Kanit (display) / Space Mono (labels)";
    copyText(spec, btn);
  },

  genBrandKit: async function () {
    rememberRetry("genBrandKit");
    state.loading.brandkit = true; clearErr("brandkit"); render();
    try {
      var raw = await callAI("brandKit", P.brandKit(), { max_tokens: 2200, effort: "medium" });
      state.settings.brandKit = extractJson(raw);
      save();
    } catch (e) { setErr("brandkit", e); }
    state.loading.brandkit = false; render();
  },
});
