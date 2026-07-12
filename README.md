# 🎬 เสพซาวด์ STUDIO v2 — MAX edition

Your content command center, upgraded — **10 stations** for the channel and the production house, plus a **client-ready portfolio site** for pitching local clinics.

**Story engine → Creative lab → Script room (with coach) → Edit room (with cut plans + editing recipes) → Cover design (real PNG export) → Publish packs → Planner → Results strategist → Client studio (clinic plans + สบส. compliance checker).**

No frameworks. No build step. Deploys free in ~10 minutes.

---

## ⚡ เริ่มเร็ว (ภาษาไทย)

1. สมัคร **https://console.anthropic.com** → เติมเครดิตนิดหน่อย → สร้าง **API Key** (เก็บไว้ เห็นครั้งเดียว)
2. เอาไฟล์ทั้งโฟลเดอร์นี้ขึ้น **GitHub** (repo ใหม่ หรือทับ repo เดิมของ v1 ได้เลย)
3. เข้า **https://vercel.com** → Add New → Project → เลือก repo → ก่อนกด Deploy ให้เพิ่ม Environment Variable ชื่อ `ANTHROPIC_API_KEY` ค่า = คีย์จากข้อ 1 → กด **Deploy**
4. ได้ลิงก์เช่น `https://sapsound-studio.vercel.app` → เปิดในมือถือ → Add to Home Screen
   - แอปอยู่ที่ลิงก์หลัก · **พอร์ตโฟลิโอสำหรับส่งลูกค้าคลินิกอยู่ที่ `/portfolio`** (เช่น `https://sapsound-studio.vercel.app/portfolio`)
5. ยังไม่อยาก deploy? เปิดแอปแล้วกดปุ่มไหนก็ได้ → ระบบจะชวนเข้า **Demo mode** ให้ลองทุกฟีเจอร์ด้วยข้อมูลตัวอย่าง ฟรี ไม่ใช้ AI จริง

**อัปเกรดจาก v1:** แค่เอาไฟล์ชุดนี้ทับของเดิมใน GitHub — ข้อมูลตอนเก่าทั้งหมดอยู่ครบ (แอปย้ายข้อมูล v1 → v2 ให้อัตโนมัติตอนเปิดครั้งแรก เพราะข้อมูลอยู่ในเบราว์เซอร์ ไม่ได้อยู่ในโค้ด)

---

## What's in the box

```
/
├── index.html          ← app shell
├── styles.css          ← design system
├── js/
│   ├── core.js         ← state, storage (+auto-migration from v1), AI layer
│   ├── prompts.js      ← every AI prompt (the "brain")
│   ├── demo.js         ← sample answers → the app works with no backend
│   ├── stations.js     ← HQ · Stories · Script · Edit · Publish · Plan · Results
│   ├── lab.js          ← 💡 creative thinking station
│   ├── design.js       ← 🎨 cover designer (canvas render + PNG export)
│   ├── clients.js      ← 💼 production-house station + compliance checker
│   └── boot.js
├── api/claude.js       ← serverless proxy: your API key stays on the server
├── portfolio/
│   └── index.html      ← 🏥 client-facing portfolio (Thai, print-to-PDF ready)
├── vercel.json         ← gives the AI function 60s to think
└── package.json
```

**Why `api/claude.js` matters:** a real website cannot ship your Anthropic key in browser code — anyone could steal it. The frontend calls `/api/claude` on YOUR server; only the server talks to Anthropic.

---

## Deploy in 4 steps (Vercel — free plan is enough)

### 1 — Get your Anthropic API key
- **https://console.anthropic.com** → sign in → add a little credit → **API Keys → Create Key** → copy it (you see it once).

### 2 — Put this folder on GitHub
- New repo (or your existing v1 repo — just replace the files). Drag & drop works on github.com. Keep the folder structure.

### 3 — Deploy on Vercel
- **https://vercel.com** → sign up with GitHub → **Add New → Project** → import the repo.
- Before clicking Deploy: **Environment Variables** → add `ANTHROPIC_API_KEY` = your key → **Deploy**.

### 4 — Done
- App: `https://your-project.vercel.app` → open on your phone → **Add to Home Screen**.
- Client portfolio: `https://your-project.vercel.app/portfolio`.

**Upgrading from v1:** push these files into the same repo → Vercel redeploys → open the app once → your episodes and settings migrate automatically (data lives in your browser, not in the code).

---

## The 10 stations

| Station | What it does |
|---|---|
| **⌂ HQ** | Today's focus, pipeline meters, series identity + **style DNA** (tone/visual/never — injected into every prompt), production-house identity, demo-mode toggle, backup |
| **🔥 Stories** | Dig 5 researched pitches (with darkness rating + "why now"), quick-idea chips, select → pipeline |
| **💡 Lab** | Creative sparring: **Angle storm** (8 lenses on one topic), **Format flip**, **Trend remix**, **Series pitch**, **Hook clinic** — winners go straight to the pipeline |
| **✍ Script** | Full Thai script with per-beat retention notes + on-screen text · **directed rewrite** ("มืดกว่านี้ / สั้นลง 20%") · **4 hook variants** (tap to swap) · **story coach** (scores every beat, names the weak spot) · **fact sheet** (claims to verify + how + ready search queries) |
| **✂ Edit** | Timecoded editor handoff (cuts+fx, captions+styles, sound design, b-roll hunting, grade, pacing) · **edit coach** (5 techniques for THIS episode) · **shot list** · **12-recipe editing bible** (works offline — J-cuts, beat cuts, safe zones, loops…) |
| **🎨 Design** | AI art-directs 3 cover concepts → **rendered live on canvas** → download as **1080×1920 PNG** (full or transparent overlay for CapCut) · safe-zone preview · **brand kit generator** (palette with copyable hex, fonts, caption spec, logo direction) |
| **▸ Publish** | Per-platform captions/titles/hashtags + **first comment**, **pinned fight-starter**, **A/B title**, posting-time suggestion |
| **▦ Plan** | Weekly calendar, 3/week cadence meter, mark-posted |
| **▲ Results** | Log views/likes/comments/saves/follows → strategist analyzes in Thai → **learnings log persists** and feeds the next analysis (the channel gets smarter every week) |
| **💼 Clients** | The production-house engine: client roster → **LINE pitch message**, **12-post monthly plan** (4 pillars, per-post legal flags), **30-45s client scripts**, and the **🛡 compliance checker** — paste any clinic caption, get risk level + exact violations + a publishable rewrite (พ.ร.บ.สถานพยาบาลฯ ม.38 rules built in) |

**Demo mode** (HQ → System): every button answers with realistic sample data — no API cost. Perfect for exploring, teaching your editor, or pitching the workflow to someone.

---

## 🏥 The clinic portfolio (`/portfolio`)

A complete, client-facing sales page in Thai for pitching local clinics: the problem → who you are → 4 services → the 4-pillar clinic content system → real sample storyboards + graphic mockups → a 12-post first-month calendar → **the legal-trust section** (what's banned in clinic ads, the fines, and what you check on every piece) → 3 example packages + à-la-carte → process → honest metrics → FAQ → free-audit CTA.

**Customize it (2 minutes):**
1. Open `portfolio/index.html`, scroll to the bottom → edit the `CONFIG` block (name, LINE, phone, email) — it updates the whole page.
2. Prices are marked as examples — edit them in the `#price` section to your real rates.
3. Want a PDF to send in LINE? Open the page → browser **Print → Save as PDF** (print layout is built in).

**How to use it:** send the link (or PDF) after the first conversation, or walk through it on a tablet at the clinic. The free **Content Audit** offer at the end is the door-opener — it costs you an hour and starts every deal. The Clients tab in the app then generates the actual audit/plan.

---

## Costs (honest numbers)

- **Vercel + GitHub:** free.
- **Anthropic API:** pay-per-use. v2 defaults to **Claude Opus 4.8** (the strongest writing model) — a full script generation costs roughly **1–3 บาท**; lighter tasks (captions, hooks) less. A heavy production week is on the order of **หลักสิบถึงร้อยกว่าบาท/เดือน**. Set a spending limit in the Anthropic console for peace of mind.
- Want it cheaper? In Vercel → Settings → Environment Variables add `ANTHROPIC_MODEL` = `claude-sonnet-4-6` (≈40% of the price, still very good) → Redeploy.

---

## Where your data lives

Episodes, scripts, clients, learnings and settings are saved in the **browser's localStorage** — private to your device, no database.

- Different device (or clearing browser data) = different/empty data.
- Use **HQ → Export backup** regularly; **Import backup** moves everything (episodes + clients + learnings + settings) to another device.

---

## Run it locally (optional)

```bash
npm i -g vercel     # once
vercel dev          # then add the env var when asked:
vercel env add ANTHROPIC_API_KEY
```

Opening `index.html` as a plain file (or via any static server) shows the full UI, and every AI button offers **Demo mode** — only real AI calls need Vercel.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "ANTHROPIC_API_KEY is not set" | Vercel → Settings → Environment Variables → add it → Redeploy |
| "ต่อ backend ไม่ได้" + demo offer | You're on a static host / local file — deploy to Vercel, or use demo mode |
| AI returns a JSON error | Tap the button again — strict-format retries almost always succeed |
| Generation feels slow | Opus thinks before writing (10–40s for a full script). For speed set `ANTHROPIC_MODEL=claude-sonnet-4-6` |
| Cover PNG text looks off | Fonts still loading — wait 2s and press ↻ new 3 concepts |
| My v1 episodes are gone | They migrate on first open **in the same browser** on the same domain. Otherwise: v1 → HQ → Export backup, v2 → Import backup |

---

## House rules baked into the app

- Every story pitch is AI-researched → **verify before filming** — the Script room's **Fact Sheet** builds the checklist with search queries for you. One wrong "fact" costs a storytelling channel its credibility.
- The signature opening line + style DNA (HQ) are injected into everything — that's your recognition engine. Change them once, carefully.
- Cadence target is 3 on-air episodes/week; HQ always shows the single next action.
- Client work: the compliance checker is a serious filter, not a lawyer — ad-type pieces still need the clinic's ฆสพ. approval before boosting. The app and portfolio both say this out loud, which is exactly why clinics will trust you.
