// Serverless proxy — keeps your Anthropic API key secret on the server.
// Deploys automatically on Vercel as POST /api/claude
// Requires environment variable: ANTHROPIC_API_KEY
// Optional: ANTHROPIC_MODEL to override the default model.

var DEFAULT_MODEL = "claude-opus-4-8";
var EFFORTS = { low: 1, medium: 1, high: 1 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({
      error:
        "ANTHROPIC_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.",
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
}
