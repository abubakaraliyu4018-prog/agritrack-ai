// AgriTrack AI — Express API server.
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { AGRO_ECOLOGICAL_ZONES, CROPS, STATE_COORDS } from "./data/nigeria.js";
import { getWeatherForState, summarizeWeather } from "./weather.js";
import { generateAdvice } from "./ai.js";
import { listFarms, createFarm, deleteFarm, storeMode } from "./supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    store: storeMode(),
    ai: process.env.OPENAI_API_KEY ? "openai" : process.env.GEMINI_API_KEY ? "gemini" : "offline",
    time: new Date().toISOString()
  });
});

// Static localized data
app.get("/api/states", (req, res) => {
  res.json({
    zones: AGRO_ECOLOGICAL_ZONES,
    crops: CROPS,
    states: Object.keys(STATE_COORDS).sort()
  });
});

// Weather for a state
app.get("/api/weather", async (req, res) => {
  const state = req.query.state;
  if (!state) return res.status(400).json({ error: "state query param is required" });
  try {
    const weather = await getWeatherForState(state);
    res.json({ ...weather, summary: summarizeWeather(weather) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// AI advice
app.post("/api/advice", async (req, res) => {
  const { user, state, crop, farm } = req.body || {};
  if (!user || !user.trim()) {
    return res.status(400).json({ error: "user question is required" });
  }
  try {
    let weather = null;
    if (state) {
      try {
        weather = await getWeatherForState(state);
      } catch (e) {
        console.warn("Weather fetch failed, continuing without it:", e.message);
      }
    }
    const result = await generateAdvice({ user, state, crop, farm, weather });
    res.json({ ...result, weather: weather ? summarizeWeather(weather) : null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Farm log CRUD
app.get("/api/farms", async (req, res) => {
  try {
    res.json(await listFarms());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/farms", async (req, res) => {
  const { farmName, crop, state, plantingDate } = req.body || {};
  if (!farmName || !crop || !state) {
    return res.status(400).json({ error: "farmName, crop, and state are required" });
  }
  try {
    const farm = await createFarm({ farmId: null, crop, state, plantingDate, farmName });
    res.status(201).json(farm);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/farms/:id", async (req, res) => {
  try {
    await deleteFarm(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve the built frontend in production (if client/dist exists).
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`AgriTrack AI server running on http://localhost:${PORT}`);
  console.log(`Farm store: ${storeMode()}`);
  console.log(
    `AI provider: ${process.env.OPENAI_API_KEY ? "openai" : process.env.GEMINI_API_KEY ? "gemini" : "offline (no key set)"}`
  );
});