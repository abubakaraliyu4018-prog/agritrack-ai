import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [farms, setFarms] = useState([]);
  const [states, setStates] = useState([]);
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({ farmName: "", crop: "", state: "", plantingDate: "" });
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFarms();
    fetch("/api/states")
      .then((r) => r.json())
      .then((data) => {
        setStates(data.states || []);
        setCrops(Object.keys(data.crops || {}));
      })
      .catch(() => {});
  }, []);

  async function loadFarms() {
    try {
      const res = await fetch("/api/farms");
      setFarms(await res.json());
    } catch (e) {
      setFarms([]);
    }
  }

  async function addFarm(e) {
    e.preventDefault();
    if (!form.farmName || !form.crop || !form.state) return;
    setLoading(true);
    try {
      await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setForm({ farmName: "", crop: "", state: "", plantingDate: "" });
      await loadFarms();
    } finally {
      setLoading(false);
    }
  }

  async function removeFarm(id) {
    await fetch(`/api/farms/${id}`, { method: "DELETE" });
    await loadFarms();
  }

  async function getNextAction(farm) {
    setAdvice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: `What is the next best action for my ${farm.crop} farm in ${farm.state}?`,
          state: farm.state,
          crop: farm.crop,
          farm
        })
      });
      const data = await res.json();
      setAdvice({ farm, text: data.text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <section className="card">
        <h2>Add a farm</h2>
        <form className="farm-form" onSubmit={addFarm}>
          <input
            placeholder="Farm name (e.g. My maize plot)"
            value={form.farmName}
            onChange={(e) => setForm({ ...form, farmName: e.target.value })}
          />
          <select
            value={form.crop}
            onChange={(e) => setForm({ ...form, crop: e.target.value })}
          >
            <option value="">Crop</option>
            {crops.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          >
            <option value="">State</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.plantingDate}
            onChange={(e) => setForm({ ...form, plantingDate: e.target.value })}
          />
          <button type="submit" disabled={loading}>
            Add farm
          </button>
        </form>
      </section>

      <section className="card">
        <h2>My farms ({farms.length})</h2>
        {farms.length === 0 ? (
          <p className="empty">No farms yet. Add your first farm above.</p>
        ) : (
          <ul className="farm-list">
            {farms.map((f) => (
              <li key={f.id} className="farm-item">
                <div className="farm-info">
                  <strong>{f.farmName}</strong>
                  <span>
                    {f.crop} · {f.state}
                    {f.plantingDate ? ` · planted ${f.plantingDate}` : ""}
                  </span>
                </div>
                <div className="farm-actions">
                  <button className="btn-small" onClick={() => getNextAction(f)}>
                    Next action
                  </button>
                  <button className="btn-small danger" onClick={() => removeFarm(f.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {advice && (
        <section className="card advice-card">
          <h2>Next action — {advice.farm.farmName}</h2>
          <div className="advice-text">{advice.text}</div>
        </section>
      )}
    </div>
  );
}