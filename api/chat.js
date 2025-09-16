// /api/chat.js
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load config
const configPath = path.join(process.cwd(), "mfl_bot_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Optional CORS: restrict to allowed site origins
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(origin) {
  const allow = !ALLOWED_ORIGINS.length || (origin && ALLOWED_ORIGINS.includes(origin));
  return {
    "Access-Control-Allow-Origin": allow ? (origin || "*") : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function cleanInput(text, max = 1200) {
  const t = (text || "").toString().trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

// Keyword-based topic matcher using synonyms
function checkVerseLibrary(userMsg, library = {}, keywords = {}) {
  const msg = (userMsg || "").toLowerCase();
  for (const [topic, words] of Object.entries(keywords)) {
    for (const w of words) {
      if (msg.includes(w.toLowerCase())) {
        const verses = library[topic] || [];
        if (verses.length) return { topic, verses };
      }
    }
  }
  return null;
}

const SYSTEM_PROMPT = config.systemPrompt || "";

export default async function handler(req, res) {
  const origin = req.headers.origin || "";

  if (req.method === "OPTIONS") {
    res.set(corsHeaders(origin));
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      res.set(corsHeaders(origin));
      return res.status(405).json({ error: "Method not allowed" });
    }

    if ((process.env.ALLOWED_ORIGINS || "").length && !ALLOWED_ORIGINS.includes(origin)) {
      res.set(corsHeaders(origin));
      return res.status(403).json({ error: "Forbidden origin" });
    }

    const { message } = req.body || {};
    const userMsg = cleanInput(message);

    if (!userMsg) {
      res.set(corsHeaders(origin));
      return res.status(400).json({ error: "Missing message" });
    }

    // 1) Try verse library first (fast, guaranteed NCV set)
    const match = checkVerseLibrary(userMsg, config.topicVerses, config.topicKeywords);
    if (match) {
      const formatted = match.verses.map((v, i) => `${i + 1}. ${v}`).join("\n");
      res.set(corsHeaders(origin));
      return res.status(200).json({
        reply: `Here are 5 verses from the New Century Version for ${match.topic}:\n\n${formatted}`
      });
    }

    // 2) Fall back to OpenAI (normal chat behavior)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 350,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg }
      ]
    });

    const text = completion?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn’t generate a response.";

    res.set(corsHeaders(origin));
    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Chat error:", err);
    res.set(corsHeaders(req.headers.origin || ""));
    return res.status(500).json({ error: "Chat service error." });
  }
}
