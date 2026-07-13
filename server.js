// เสพซาวด์ STUDIO — standalone server for a droplet / any Node host.
// This is the non-Vercel alternative to api/claude.js — same logic, served
// alongside the static files so one process handles everything.
//
// Run:            node server.js
// Requires:       ANTHROPIC_API_KEY in the environment (see .env.example)
// Optional:       PORT (default 3001), ANTHROPIC_MODEL (default claude-opus-4-8)

import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DEFAULT_MODEL = "claude-opus-4-8";
const EFFORTS = { low: 1, medium: 1, high: 1 };

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname, { index: "index.html", dotfiles: "deny" }));

app.post("/api/claude", async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set. Add it to .env (see .env.example) and restart: pm2 restart sapsound-studio",
    });
    return;
  }

  try {
    const { prompt, max_tokens, effort } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }
    if (prompt.length > 60000) {
      res.status(400).json({ error: "Prompt too long" });
      return;
    }

    const maxTokens = Math.min(Math.max(Number(max_tokens) || 4000, 500), 16000);
    const body = {
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    };
    if (effort && EFFORTS[effort]) body.output_config = { effort: effort };

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (!r.ok) {
      res.status(r.status).json({
        error: (data && data.error && data.error.message) || "Anthropic API error",
      });
      return;
    }

    if (data.stop_reason === "refusal") {
      res.status(200).json({ error: "The model declined this request — rephrase and try again." });
      return;
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

app.listen(PORT, () => {
  console.log("เสพซาวด์ STUDIO → http://localhost:" + PORT);
  console.log("Portfolio        → http://localhost:" + PORT + "/portfolio");
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY is not set — AI buttons will return an error until you set it.");
  }
});
