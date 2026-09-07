// Farm log persistence.
// Uses Supabase if SUPABASE_URL + SUPABASE_ANON_KEY are set; otherwise falls back
// to an in-memory store (data resets when the server restarts). This keeps the
// app fully runnable without any external setup.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// In-memory fallback store.
const memoryStore = [];
let nextId = 1;

function toPublic(row) {
  return {
    id: row.id,
    farmName: row.farm_name,
    crop: row.crop,
    state: row.state,
    plantingDate: row.planting_date,
    createdAt: row.created_at
  };
}

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function listFarms() {
  if (useSupabase) {
    const rows = await supabaseRequest("farms?select=*&order=created_at.desc");
    return rows.map(toPublic);
  }
  return [...memoryStore].reverse().map(toPublic);
}

export async function createFarm({ farmName, crop, state, plantingDate }) {
  if (useSupabase) {
    const rows = await supabaseRequest("farms", {
      method: "POST",
      body: JSON.stringify({
        farm_name: farmName,
        crop,
        state,
        planting_date: plantingDate
      }),
      headers: { Prefer: "return=representation" }
    });
    return toPublic(rows[0]);
  }
  const row = {
    id: String(nextId++),
    farm_name: farmName,
    crop,
    state,
    planting_date: plantingDate,
    created_at: new Date().toISOString()
  };
  memoryStore.push(row);
  return toPublic(row);
}

export async function deleteFarm(id) {
  if (useSupabase) {
    await supabaseRequest(`farms?id=eq.${id}`, { method: "DELETE" });
    return;
  }
  const idx = memoryStore.findIndex((r) => r.id === String(id));
  if (idx !== -1) memoryStore.splice(idx, 1);
}

export function storeMode() {
  return useSupabase ? "supabase" : "memory";
}