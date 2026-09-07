// AgriTrack AI — Localized Nigerian Agricultural Data
// Static reference data injected into the AI prompt so advice is genuinely local.
// Sources: general agronomic knowledge for Nigeria's agro-ecological zones.

export const AGRO_ECOLOGICAL_ZONES = {
  "Sahel": {
    description: "Hot, dry, short rainy season (June–September). Low rainfall (~500-700mm).",
    states: ["Borno", "Yobe", "Jigawa", "Katsina", "Sokoto", "Kebbi", "Zamfara", "Bauchi"]
  },
  "Sudan Savanna": {
    description: "Semi-arid, single rainy season (May–October). ~700-1000mm rainfall.",
    states: ["Kano", "Kaduna", "Gombe", "Adamawa", "Yobe", "Niger", "Kebbi", "Sokoto"]
  },
  "Guinea Savanna": {
    description: "Wetter savanna, longer rains (April–October). ~1000-1500mm rainfall.",
    states: ["Kaduna", "Niger", "Kwara", "Benue", "Plateau", "Taraba", "Nasarawa", "Kogi", "FCT Abuja"]
  },
  "Derived Savanna": {
    description: "Transition zone, moderate rainfall (March–November). ~1200-1500mm.",
    states: ["Oyo", "Ogun", "Ondo", "Ekiti", "Osun", "Kogi", "Edo", "Delta"]
  },
  "Rainforest": {
    description: "Humid, heavy rainfall (March–November). ~1500-3000mm. Good for tree crops.",
    states: ["Lagos", "Ogun", "Ondo", "Edo", "Delta", "Rivers", "Bayelsa", "Akwa Ibom", "Cross River", "Anambra", "Imo", "Abia", "Enugu"]
  },
  "Mangrove / Coastal": {
    description: "Very wet coastal belt, brackish water. Limited arable land.",
    states: ["Lagos", "Rivers", "Bayelsa", "Delta", "Akwa Ibom", "Cross River"]
  }
};

export const CROPS = {
  maize: {
    name: "Maize",
    plantingWindow: "April–June (rainy season); dry-season with irrigation",
    maturityDays: "90–120",
    notes: "Staple cereal. Sensitive to drought at flowering. Watch for fall armyworm."
  },
  rice: {
    name: "Rice",
    plantingWindow: "May–July (rainy season); dry-season with irrigation",
    maturityDays: "100–150",
    notes: "Needs water. Lowland and upland varieties. Watch for blast disease."
  },
  cassava: {
    name: "Cassava",
    plantingWindow: "Any time with rain; best at start of rains (April–May)",
    maturityDays: "9–12 months",
    notes: "Drought-tolerant. Grows in poor soils. Harvest when mature."
  },
  yam: {
    name: "Yam",
    plantingWindow: "November–March (before rains)",
    maturityDays: "7–9 months",
    notes: "Needs mounds/heaps. Sensitive to waterlogging. Store in cool dry place."
  },
  sorghum: {
    name: "Sorghum",
    plantingWindow: "May–June (rainy season)",
    maturityDays: "90–120",
    notes: "Drought-tolerant. Good for dry savanna. Watch for striga weed."
  },
  millet: {
    name: "Millet",
    plantingWindow: "May–June (rainy season)",
    maturityDays: "70–100",
    notes: "Very drought-tolerant. Grows in poor soils. Short season."
  },
  cowpea: {
    name: "Cowpea",
    plantingWindow: "June–July (rainy season)",
    maturityDays: "60–90",
    notes: "Legume, fixes nitrogen. Good rotation crop. Watch for pod borers."
  }
};

// State -> coordinates (approx) for Open-Meteo geocoding fallback
export const STATE_COORDS = {
  "Lagos": { lat: 6.5244, lon: 3.3792 },
  "Kano": { lat: 12.0022, lon: 8.5920 },
  "Kaduna": { lat: 10.5105, lon: 7.4165 },
  "Kebbi": { lat: 12.4500, lon: 4.2000 },
  "Sokoto": { lat: 13.0059, lon: 5.2476 },
  "Zamfara": { lat: 12.1222, lon: 6.2236 },
  "Katsina": { lat: 12.9908, lon: 7.6008 },
  "Jigawa": { lat: 12.2280, lon: 9.5616 },
  "Bauchi": { lat: 10.3103, lon: 9.8439 },
  "Gombe": { lat: 10.2897, lon: 11.1673 },
  "Yobe": { lat: 12.2939, lon: 11.4394 },
  "Borno": { lat: 11.8333, lon: 13.1500 },
  "Adamawa": { lat: 9.3265, lon: 12.3984 },
  "Taraba": { lat: 7.9994, lon: 10.9850 },
  "Plateau": { lat: 9.2182, lon: 9.5179 },
  "Nasarawa": { lat: 8.4998, lon: 8.1997 },
  "Niger": { lat: 9.9309, lon: 5.5980 },
  "Kwara": { lat: 8.4797, lon: 4.5418 },
  "Oyo": { lat: 8.1574, lon: 3.6147 },
  "Ogun": { lat: 7.1600, lon: 3.3500 },
  "Ondo": { lat: 7.1000, lon: 4.8400 },
  "Ekiti": { lat: 7.7189, lon: 5.3109 },
  "Osun": { lat: 7.5629, lon: 4.5199 },
  "FCT Abuja": { lat: 9.0579, lon: 7.4951 },
  "Benue": { lat: 7.3369, lon: 8.7404 },
  "Kogi": { lat: 7.8000, lon: 6.7400 },
  "Enugu": { lat: 6.5244, lon: 7.5186 },
  "Anambra": { lat: 6.2100, lon: 6.9400 },
  "Imo": { lat: 5.5720, lon: 7.0588 },
  "Abia": { lat: 5.4527, lon: 7.5248 },
  "Ebonyi": { lat: 6.2649, lon: 8.0137 },
  "Rivers": { lat: 4.8156, lon: 7.0498 },
  "Bayelsa": { lat: 4.7719, lon: 6.0699 },
  "Delta": { lat: 5.7040, lon: 5.9339 },
  "Akwa Ibom": { lat: 5.0000, lon: 7.8500 },
  "Cross River": { lat: 5.8702, lon: 8.5988 },
  "Edo": { lat: 6.3400, lon: 5.6200 }
};

export function getZoneForState(state) {
  const s = (state || "").trim().toLowerCase();
  for (const [zone, info] of Object.entries(AGRO_ECOLOGICAL_ZONES)) {
    if (info.states.some((st) => st.toLowerCase() === s)) {
      return { zone, ...info };
    }
  }
  return null;
}

export function getCrop(crop) {
  const c = (crop || "").trim().toLowerCase();
  return CROPS[c] || null;
}

export function getCoordsForState(state) {
  const s = (state || "").trim();
  return STATE_COORDS[s] || null;
}