// AI integration — real LLM call (OpenAI or Gemini) with an honest offline fallback.
// The system prompt forces Nigerian-localized, crop-specific, actionable advice.
import { getZoneForState, getCrop } from "./data/nigeria.js";
import { summarizeWeather } from "./weather.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are AgriTrack AI, a practical agricultural advisor for Nigerian smallholder farmers. You give clear, actionable, LOCAL advice in simple English (you may use local terms like "rainy season", "dry season", "harmattan").
Rules:
- Always ground your answer in the farmer's state, crop, and current weather provided in the context.
- Give 3-5 concrete, actionable steps the farmer can take today.
- Be honest about planting windows, fertilizer, water, and pest management for the specific crop.
- If the question is about disease or pest, give general management advice but clearly state you are NOT a substitute for a certified agronomist or plant pathologist.
- Do NOT invent market prices. If asked about prices, say prices vary by market and suggest checking a local market.
- Keep the answer under 400 words, use short paragraphs and bullet points.
- Respond in English.`;

// Build the localized context string injected into the LLM.
function buildContext({ state, crop, farm, weather }) {
  const zone = getZoneForState(state);
  const cropInfo = getCrop(crop);
  const parts = [];
  parts.push(`Farmer's state: ${state || "unknown"}`);
  if (zone) parts.push(`Agro-ecological zone: ${zone.zone} — ${zone.description}`);
  if (cropInfo) {
    parts.push(
      `Crop: ${cropInfo.name}. Planting window: ${cropInfo.plantingWindow}. Maturity: ${cropInfo.maturityDays}. Notes: ${cropInfo.notes}`
    );
  }
  if (farm?.plantingDate) parts.push(`Farm planted on: ${farm.plantingDate}`);
  parts.push(`Current weather: ${summarizeWeather(weather)}`);
  return parts.join("\n");
}

// Real LLM call via OpenAI Chat Completions.
async function callOpenAI(messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.6,
      max_tokens: 600
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// Real LLM call via Google Gemini.
async function callGemini(messages) {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const user = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 600 }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// Honest offline fallback — rule-based, clearly labeled as local data (no AI).
function offlineFallback({ state, crop, weather }) {
  const cropInfo = getCrop(crop);
  const zone = getZoneForState(state);
  const lines = [];
  lines.push(
    "Note: No AI API key is configured, so this is a basic rule-based answer from local reference data. Add OPENAI_API_KEY or GEMINI_API_KEY to your .env for full AI answers."
  );
  lines.push("");
  if (cropInfo) {
    lines.push(`For ${cropInfo.name} in ${state || "your area"}:`);
    lines.push(`• Typical planting window: ${cropInfo.plantingWindow}`);
    lines.push(`• Maturity: ${cropInfo.maturityDays}`);
    lines.push(`• ${cropInfo.notes}`);
  } else {
    lines.push(`For your crop in ${state || "your area"}:`);
  }
  if (zone) lines.push(`• Your zone (${zone.zone}): ${zone.description}`);
  if (weather?.current) {
    const c = weather.current;
    lines.push(
      `• Current weather: ${c.temperature}°C, humidity ${c.humidity ?? "n/a"}%, rain ${c.precipitation ?? 0}mm`
    );
    if (c.precipitation > 0) {
      lines.push("• It is raining now — avoid planting until it clears.");
    } else {
      lines.push("• No rain now — good time for field preparation if soil is moist.");
    }
  }
  lines.push("");
  lines.push("For a full AI-generated answer, add an AI provider key to your .env file.");
  return lines.join("\n");
}

// Main entry: generate advice for a farmer's question.
export async function generateAdvice({ user, state, crop, farm, weather }) {
  const context = buildContext({ state, crop, farm, weather });
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Context:\n${context}\n\nFarmer's question: ${user}` }
  ];

  if (OPENAI_API_KEY) {
    try {
      return { text: await callOpenAI(messages), provider: "openai" };
    } catch (e) {
      console.error("OpenAI failed:", e.message);
    }
  }
  if (GEMINI_API_KEY) {
    try {
      return { text: await callGemini(messages), provider: "gemini" };
    } catch (e) {
      console.error("Gemini failed:", e.message);
    }
  }
  return { text: offlineFallback({ state, crop, weather }), provider: "offline" };
}