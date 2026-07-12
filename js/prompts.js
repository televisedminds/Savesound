/* ═══════════════════════════════════════════════════════════
   เสพซาวด์ STUDIO v2 — prompt library (the brain)
   Every prompt demands strict JSON so the UI can render it.
   ═══════════════════════════════════════════════════════════ */

"use strict";

var P = {};

/* shared context block injected into channel prompts */
P.dna = function () {
  var st = state.settings;
  return 'CHANNEL: "เสพซาวด์" — Thai TikTok/Shorts channel telling DARK TRUE STORIES behind rock / metal / emo / alternative songs.\n' +
    'Series: "' + st.seriesName + '". Signature opening line (first VO line of every episode): "' + st.openingLine + '"\n' +
    'Tone: ' + st.styleDNA.tone + '\nVisual style: ' + st.styleDNA.visual + '\nNever: ' + st.styleDNA.avoid + '\n';
};

/* ---------- STORIES ---------- */
P.stories = function (input) {
  return P.dna() +
    'You are the head story researcher. Generate 5 episode pitches about: ' +
    (input || "your pick — legendary dark, tragic or unbelievable-but-true stories from rock/metal/emo/pop history that Thai channels have NOT overused") + '\n' +
    'Hard rules: every story must be REAL and well-documented — never invent facts. Prefer shocking, emotional, unbelievable-but-true angles over trivia. Mix eras and scenes. At least one pick should feel fresh/undiscovered for Thai audiences.\n' +
    'Respond ONLY with a JSON array (no markdown) of 5 objects:\n' +
    '{"title":"(Thai — punchy episode title)","artist":"","song":"","hook":"(Thai — first spoken line, must stop the scroll, ≤15 words)","summary":"(Thai — the true story in 2-3 sentences)","darkness":(1-10),"angle":"(Thai — one line: why this will hit)","whyNow":"(Thai — one line: a hook to today — anniversary, trend, meme, resurgence; or \\"evergreen\\")"}';
};

P.factCheck = function (ep) {
  return 'You are a fact-check assistant for the Thai storytelling channel "เสพซาวด์". Episode: ' + ep.artist + ' – ' + ep.song + '. Story as pitched: ' + ((ep.pitch && ep.pitch.summary) || ep.title) + '\n' +
    (ep.script ? 'Script VO lines: ' + ep.script.sections.map(function (s) { return s.vo; }).join(" / ") + '\n' : "") +
    'List every factual claim in this episode that MUST be verified before filming — one wrong "fact" destroys a storytelling channel\'s credibility.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"claims":[{"claim":"(Thai — the specific claim)","risk":"สูง|กลาง|ต่ำ","how":"(Thai — exactly how to verify: what to search, which sources count as solid — interviews, court records, biographies, credible music press)","query":"(a ready-to-paste English search query)"}],"redFlags":"(Thai — 1-2 sentences: which part of this story is most often misreported online)"}\n' +
    'Max 6 claims, ordered by risk.';
};

/* ---------- SCRIPT ---------- */
P.script = function (ep, seconds) {
  var st = state.settings;
  return P.dna() +
    'You are the head writer. Write a ~' + (seconds || 90) + '-second vertical video script in THAI.\n' +
    'Episode: ' + ep.artist + ' – ' + ep.song + '. True story: ' + ((ep.pitch && ep.pitch.summary) || ep.title) + '\n' +
    'The FIRST VO line must be exactly the signature opening: "' + st.openingLine + '"\n' +
    'Style: conversational Thai, short punchy spoken sentences, documentary tension, no formal language. Build one clear emotional arc: hook → setup → escalation → twist/climax → needle-drop → gut-punch outro.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"hook":"(Thai — on-screen text at 0:00, ≤12 words)","sections":[{"label":"HOOK|SETUP|TWIST|CLIMAX|DROP|OUTRO","time":"0:00-0:08","vo":"(Thai voiceover)","visual":"(Thai — shot / edit / b-roll instruction)","screenText":"(Thai — on-screen text for this beat, ≤8 words, or \\"\\" if none)","note":"(Thai — retention note: what keeps them watching through this beat)"}],"needleDrop":"(Thai — the exact story moment where the actual song bursts in, and why that moment)","cta":"(Thai — ending question engineered to make people comment)"}\n' +
    'Use ' + (seconds <= 60 ? "4-5" : seconds >= 180 ? "8-10" : "5-7") + ' sections totalling ≈' + (seconds || 90) + 's.';
};

P.hooks = function (ep) {
  var cur = (ep.script && ep.script.hook) || (ep.pitch && ep.pitch.hook) || ep.title;
  return P.dna() +
    'Current hook for episode "' + ep.title + '" (' + ep.artist + ' – ' + ep.song + '): "' + cur + '"\n' +
    'Story: ' + ((ep.pitch && ep.pitch.summary) || "") + '\n' +
    'Write 4 ALTERNATIVE opening hooks in Thai, each using a different psychological trigger. ≤14 words each. They appear as big text on screen at 0:00 while the signature opening line is spoken.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '[{"hook":"(Thai)","trigger":"คำถามค้างคา|ตัวเลขช็อก|ขัดแย้งกับที่คนเชื่อ|พูดกับคนดูตรงๆ|สปอยล์ตอนจบครึ่งเดียว"}]';
};

P.rewrite = function (ep, direction) {
  return P.dna() +
    'Here is the current approved script JSON for "' + ep.title + '":\n' + JSON.stringify(ep.script) + '\n' +
    'Rewrite it following this direction from the creator: "' + direction + '"\n' +
    'Keep the same JSON schema exactly (hook, sections[{label,time,vo,visual,screenText,note}], needleDrop, cta), keep the signature opening line as the first VO line, keep total length similar unless the direction says otherwise.\n' +
    'Respond ONLY with the full rewritten JSON (no markdown).';
};

P.coach = function (ep) {
  return 'You are a ruthless short-form storytelling coach (think: MrBeast retention science meets true-crime documentary craft). Analyze this Thai TikTok script:\n' +
    JSON.stringify(ep.script) + '\n' +
    'Score each beat for retention risk and give concrete fixes. Be honest — flattery wastes the creator\'s time.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"beats":[{"label":"(section label)","score":(1-10 retention strength),"issue":"(Thai — the weakness, or \\"แน่นแล้ว\\" if strong)"}],"strongest":"(Thai — the single best moment and why)","weakest":"(Thai — the moment most likely to lose viewers)","fixes":["(Thai — concrete fix, max 3)"],"curve":"(Thai — one line describing the tension curve shape and whether it peaks too early/late)"}';
};

/* ---------- EDIT ---------- */
P.blueprint = function (ep) {
  return 'You are the edit supervisor for a Thai TikTok channel (dark documentary storytelling). Turn this approved script into a handoff the editor can execute without questions. Vertical 9:16, documentary pacing. The editor uses CapCut/Premiere.\n' +
    'Script JSON: ' + JSON.stringify(ep.script) + '\n' +
    'Respond ONLY with JSON (no markdown), all text in THAI:\n' +
    '{"cuts":[{"tc":"0:00","action":"(edit instruction)","fx":"(transition/zoom/speed note, or \\"\\")"}],"captions":[{"text":"(on-screen text in order)","style":"(ใหญ่กลางจอ|ล่างจอ|แทรกเน้นคำ)"}],"sound":[{"tc":"0:00","cue":"(sound design / music cue — risers, hits, silence, room tone)"}],"broll":["(archival/b-roll to find + Thai AND English search keywords)"],"grade":"(Thai — one line color/grade direction)","pacing":"(Thai — one line pacing note: where to hold, where to accelerate)"}\n' +
    'Limits: ≤12 cuts, ≤7 captions, ≤6 sound cues, ≤6 b-roll items.';
};

P.editCoach = function (ep) {
  return 'You are a short-form editing coach. Script: ' + JSON.stringify(ep.script) +
    (ep.editPlan ? '\nCut plan: ' + JSON.stringify(ep.editPlan) : "") + '\n' +
    'Teach the editor 5 SPECIFIC techniques for THIS episode — where exactly to apply them and how, in Thai. Think: punch-ins on revelations, J-cuts into the twist, silence before the needle-drop, beat-synced cuts, text animation timing.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '[{"name":"(Thai — technique name)","where":"(timecode or beat)","how":"(Thai — 1-2 sentences, concrete enough to execute in CapCut)"}]';
};

P.shotList = function (ep) {
  return 'Episode "' + ep.title + '" (' + ep.artist + ' – ' + ep.song + ') for a Thai dark-storytelling channel. Script: ' + JSON.stringify(ep.script) + '\n' +
    'The creator will film some ORIGINAL footage to mix with archival material (talking head, hands, props, atmosphere shots). List what to shoot in one session.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '[{"shot":"(Thai — what to film)","type":"talking head|insert|atmosphere|prop","notes":"(Thai — framing/lighting/mood note)"}]\nMax 6 shots.';
};

/* ---------- PUBLISH ---------- */
P.publish = function (ep) {
  return 'Package this Thai music-storytelling episode for posting. Episode: "' + ep.title + '" (' + ep.artist + ' – ' + ep.song + '). Hook: ' + ((ep.script && ep.script.hook) || (ep.pitch && ep.pitch.hook) || "") + '\nStory: ' + ((ep.pitch && ep.pitch.summary) || "") + '\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"tiktok":{"caption":"(Thai ≤150 chars, curiosity gap, no emoji spam)","hashtags":["5-8 mixed Thai/English tags without #"],"firstComment":"(Thai — a comment the creator posts immediately to seed discussion)"},' +
    '"youtube":{"title":"(Thai ≤70 chars, Shorts-optimized)","titleAlt":"(Thai — a different angle to A/B)","description":"(Thai, 2 sentences)","hashtags":["3-5 without #"]},' +
    '"instagram":{"caption":"(Thai, short lines)","hashtags":["8-12 without #"]},' +
    '"pinComment":"(Thai — question to pin that makes people argue in the comments)"}';
};

/* ---------- RESULTS ---------- */
P.analyze = function (rows) {
  var recent = state.learnings.slice(-3).map(function (l) { return l.text; }).join("\n---\n");
  return 'You are the growth strategist for "เสพซาวด์" (Thai channel, dark true stories behind songs). Performance data, most recent last: ' + JSON.stringify(rows) + '\n' +
    (recent ? 'Earlier lessons you gave (build on them, do not repeat): ' + recent + '\n' : "") +
    "Respond in THAI, ≤180 words, plain text with these exact headers:\n" +
    "ที่เวิร์ก: (2 bullets — patterns in the winners: artist era? darkness level? hook type?)\n" +
    "ที่ต้องแก้: (2 bullets)\n" +
    "3 ตอนถัดไป: (3 lines, each \"ศิลปิน – มุมเรื่อง\" chosen to outperform based on the data)";
};

/* ---------- LAB (creative thinking) ---------- */
P.lab = function (mode, input) {
  var base = P.dna();
  if (mode === "angles") {
    return base + 'Brainstorm partner mode. Topic from creator: "' + (input || "หัวข้อไหนก็ได้ที่เหมาะกับช่อง") + '"\n' +
      'Generate 8 DIFFERENT angles on this topic for the channel — vary the lens: victim\'s view, the song itself as narrator, the court case, the conspiracy vs the truth, the aftermath 20 years later, the fan who was there, the money trail, the cover-up.\n' +
      'Respond ONLY with a JSON array (no markdown):\n' +
      '[{"title":"(Thai — episode title)","artist":"","song":"","hook":"(Thai ≤15 words)","summary":"(Thai — 1-2 sentences)","angle":"(Thai — the lens used)"}]';
  }
  if (mode === "formats") {
    return base + 'The channel currently does: 90-second narrated dark-story videos. Invent 6 FRESH repeatable formats that reuse the same research/skills but feel new to the feed' + (input ? ' — direction: "' + input + '"' : "") + '.\n' +
      'Respond ONLY with a JSON array (no markdown):\n' +
      '[{"title":"(Thai — format name)","summary":"(Thai — how one episode works, 2 sentences)","hook":"(Thai — example opening line)","angle":"(Thai — why this format can win the algorithm)"}]';
  }
  if (mode === "trend") {
    return base + 'The creator saw this trend/meme/sound on TikTok: "' + (input || "เทรนด์เพลงไวรัลตอนนี้") + '"\n' +
      'Give 6 ways to ride it WITHOUT abandoning the channel identity (dark true music stories). Each must be doable within 48 hours.\n' +
      'Respond ONLY with a JSON array (no markdown):\n' +
      '[{"title":"(Thai — the video idea)","artist":"","song":"","hook":"(Thai — opening line)","summary":"(Thai — 1-2 sentences how it connects trend × channel)","angle":"(Thai — speed note: what to reuse to ship fast)"}]';
  }
  if (mode === "series") {
    return base + 'Pitch 4 NEW mini-series concepts (each = 5-8 episodes with a shared name/frame) the channel could run' + (input ? ' — direction: "' + input + '"' : "") + '. A strong series makes viewers subscribe, not just watch.\n' +
      'Respond ONLY with a JSON array (no markdown):\n' +
      '[{"title":"(Thai — series name, brandable)","summary":"(Thai — the repeatable premise)","hook":"(Thai — the series\' signature opening line)","angle":"(Thai — why people will follow the whole series)","episodes":["(Thai — 3 example episode titles)"]}]';
  }
  // hooks clinic
  return base + 'Hook clinic. The creator\'s draft hook: "' + (input || "") + '"\n' +
    'Diagnose why it is weak (if it is), then rewrite it 5 ways, each with a different psychological trigger. Thai, ≤14 words each.\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"diagnosis":"(Thai — 1-2 sentences)","rewrites":[{"hook":"(Thai)","trigger":"(Thai — the trigger used)"}]}';
};

/* ---------- DESIGN ---------- */
P.design = function (ep) {
  var st = state.settings;
  return 'You are the art director for "' + st.seriesName + '" (' + st.styleDNA.visual + '). Design 3 cover/title-card concepts for episode "' + ep.title + '" (' + ep.artist + ' – ' + ep.song + '). Story mood: ' + ((ep.pitch && ep.pitch.summary) || "") + '\n' +
    'Each concept is rendered by a template engine, so obey the schema strictly. Layouts available: "poster" (huge stacked type, grain, vignette), "evidence" (case-file / evidence tag look, tilted frame, stamps), "tabloid" (red banner headline, barcode, newspaper urgency).\n' +
    'Colors: dark documentary palette — deep blacks, bone whites, one hot accent. Title must be SHORT (2-6 Thai words, it renders huge). Use a DIFFERENT layout for each concept.\n' +
    'Respond ONLY with a JSON array of exactly 3 (no markdown):\n' +
    '[{"layout":"poster|evidence|tabloid","bg":"#0d0b10 (hex)","accent":"#c4302b (hex)","text":"#e9e1d2 (hex)","title":"(Thai — 2-6 words, the punch)","subtitle":"(Thai — ≤8 words under the title)","tagline":"(short mono label, e.g. TRUE STORY / CASE 014)","mood":"(Thai — one word mood)","designNote":"(Thai — 1 sentence: what image/footage to place behind this text layer)"}]';
};

P.brandKit = function () {
  var st = state.settings;
  return 'Create a compact brand kit for the Thai channel "' + st.seriesName + '" — dark true stories behind songs. Tone: ' + st.styleDNA.tone + '. Visual: ' + st.styleDNA.visual + '\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"palette":[{"hex":"#......","name":"(Thai name)","use":"(Thai — where to use)"}] (exactly 5),' +
    '"fonts":{"display":"(Google font for Thai display, e.g. Kanit)","body":"(Google font for Thai body)","rule":"(Thai — usage rule in 1 line)"},' +
    '"caption":{"style":"(Thai — on-screen caption style spec: size/weight/stroke/position)","rule":"(Thai — 1 line, e.g. max words per screen)"},' +
    '"lowerThird":"(Thai — spec for name/source labels)",' +
    '"logo":"(Thai — 1-2 sentences: simple logo/watermark direction the creator can make)",' +
    '"donts":["(Thai — 3 visual don\'ts)"]}';
};

/* ---------- CLIENTS (production house) ---------- */
P.complianceRules =
  'THAI MEDICAL-FACILITY AD RULES (พ.ร.บ.สถานพยาบาล พ.ศ.2541 ม.38 + ประกาศที่เกี่ยวข้อง — the checker must apply these):\n' +
  '1) โฆษณาเกินชื่อ/ที่ตั้งต้องได้รับอนุมัติจากผู้อนุญาต (กรม สบส./สสจ.) ก่อนเผยแพร่ และควรแสดงเลขอนุมัติโฆษณา (ฆสพ.)\n' +
  '2) ห้ามเท็จ/โอ้อวดเกินจริง: "ที่สุด", "ที่หนึ่ง", "แห่งแรก", "ที่เดียว", "การันตีผล", "เห็นผล 100%", "หายขาด", "ปลอดภัย 100%", "ไม่เจ็บ"\n' +
  '3) ห้ามรูป before/after ที่สื่อรับรองผลการรักษา\n' +
  '4) ห้ามผู้ป่วย/ดารา รีวิวรับรองผลการรักษา\n' +
  '5) ห้ามโฆษณาลด แลก แจก แถม ชิงรางวัล หรือบริการฟรีเพื่อจูงใจ (ยกเว้นเงื่อนไขเฉพาะ เช่น แจ้งราคาตามจริง สื่อสารกับสมาชิกภายใน)\n' +
  '6) ราคา: แจ้งได้แบบตรงไปตรงมา ต้องเป็นราคาจริง ระบุเงื่อนไข/ระยะเวลาให้ครบ ไม่ทำให้เข้าใจผิด\n' +
  '7) ห้ามสร้างความกลัวเกินจริง ภาพน่ากลัว/หวาดเสียว/เร้ากาม ห้ามด้อยค่าสถานพยาบาลอื่น\n' +
  '8) ห้ามอวดอ้างเครื่องมือ/บุคลากร/วุฒิที่ไม่มีจริง หรือบริการนอกขอบเขตใบอนุญาต\n' +
  '9) PDPA: ภาพ/ข้อมูลผู้ป่วยเป็นข้อมูลอ่อนไหว ต้องมี consent เป็นลายลักษณ์อักษร\n' +
  '10) คอนเทนต์ให้ความรู้ทั่วไป (ไม่ชวนมารับบริการ ไม่อวดอ้าง) เสี่ยงต่ำที่สุด\n' +
  'โทษ: ปรับไม่เกิน 20,000 บาท / โฆษณาเท็จ จำคุกไม่เกิน 1 ปี หรือปรับไม่เกิน 20,000 บาท และปรับรายวันอีกวันละไม่เกิน 10,000 บาท จนกว่าจะระงับ\n';

P.clientPlan = function (c) {
  return 'You are the content strategist of the Thai production house "' + state.settings.house.name + '". Client: ' + c.name + ' — ' + c.type + (c.area ? ' ใน' + c.area : "") + '. เป้าหมาย: ' + (c.goal || "เพิ่มคนไข้ใหม่และความน่าเชื่อถือ") + '. โทนแบรนด์: ' + (c.vibe || "อบอุ่น เชื่อถือได้") + '.\n' +
    P.complianceRules +
    'Design a ONE-MONTH content plan: 12 posts across 4 weeks (3/week) using these pillars: ความรู้/ตอบคำถามคนไข้ (trust), เบื้องหลัง/ทีมงาน (human), บริการ/ราคา-แบบถูกกฎ (convert), เอนเกจ/เทรนด์ (reach). Everything must be publishable under the rules above.\n' +
    'Respond ONLY with JSON (no markdown), all text in THAI:\n' +
    '{"strategy":"(2 sentences — the month\'s narrative)","posts":[{"week":1-4,"pillar":"ความรู้|เบื้องหลัง|บริการ|เอนเกจ","format":"วิดีโอสั้น|กราฟิก|carousel|ไลฟ์","title":"(post title)","hook":"(opening line/hook)","cta":"(soft CTA)","compliance":"(1 line — what to be careful of for THIS post, or \\"ปลอดภัย\\")"}]}';
};

P.clientPost = function (c, brief) {
  return 'You are the head writer of "' + state.settings.house.name + '" making a short vertical video for the clinic client "' + c.name + '" (' + c.type + '). โทน: ' + (c.vibe || "อบอุ่น เชื่อถือได้ เป็นกันเอง") + '\nBrief: ' + brief + '\n' +
    P.complianceRules +
    'Write a 30-45 second Thai script that a clinic staff member or doctor can deliver naturally on camera. It must be fully compliant (educational/trust-building framing, no prohibited claims).\n' +
    'Respond ONLY with JSON (no markdown):\n' +
    '{"hook":"(Thai — on-screen text at 0:00 ≤10 words)","beats":[{"vo":"(Thai — spoken line)","visual":"(Thai — what to show)"}],"cta":"(Thai — soft, compliant CTA)","caption":"(Thai — post caption ≤120 chars)","hashtags":["5-8 without #"],"complianceNote":"(Thai — 1 line: anything to double-check before posting)"}\n' +
    '4-6 beats.';
};

P.clientProposal = function (c) {
  var h = state.settings.house;
  return 'Write a short, warm, professional pitch message in THAI from the production house "' + h.name + '" (' + h.tagline + ') to the owner of "' + c.name + '" (' + c.type + (c.area ? ' ใน' + c.area : "") + '). It will be sent via LINE.\n' +
    'Structure: (1) หนึ่งประโยคที่แสดงว่าเราเข้าใจปัญหาคลินิกเขาจริง (2) เราทำอะไรให้ได้บ้าง — วางแผนคอนเทนต์ ถ่าย ตัดต่อ กราฟิก แคปชัน แบบถูกกฎ สบส. (3) ข้อเสนอเริ่มต้นเบาๆ เช่น ขอเข้าไปคุย/ทำ content audit ฟรี (4) ลงท้ายด้วย ' + h.contact + '\n' +
    'Length ≤120 Thai words. No emoji spam (1-2 ok). Respond ONLY with JSON: {"message":"(the LINE message)"}';
};

P.compliance = function (text) {
  return 'You are the compliance reviewer of a Thai production house serving clinics. Review this draft ad/caption/script for a medical facility:\n"""\n' + text + '\n"""\n' +
    P.complianceRules +
    'Respond ONLY with JSON (no markdown), Thai text:\n' +
    '{"risk":"เขียว|เหลือง|แดง","summary":"(1 sentence verdict)","issues":[{"text":"(the exact risky phrase quoted)","why":"(which rule it breaks, cite ข้อ/กฎ)","fix":"(compliant replacement phrase)"}],"rewrite":"(the full text rewritten to be publishable and still persuasive)","reminder":"(1 line — e.g. ต้องยื่นขออนุมัติโฆษณาและแสดงเลข ฆสพ. หรือไม่สำหรับข้อความนี้)"}\n' +
    'If already safe: risk เขียว, empty issues, rewrite = original.';
};
