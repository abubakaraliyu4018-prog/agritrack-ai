import { useState, useEffect, useRef } from "react";

const QUICK_QUESTIONS = [
  "When should I plant maize in my state?",
  "My crop leaves are turning yellow, what should I do?",
  "Is it a good time to plant given the weather?",
  "How do I manage pests on my farm?"
];

export default function ChatPage() {
  const [states, setStates] = useState([]);
  const [crops, setCrops] = useState([]);
  const [state, setState] = useState("");
  const [crop, setCrop] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((data) => {
        setStates(data.states || []);
        setCrops(Object.keys(data.crops || {}));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!state) {
      setWeather(null);
      return;
    }
    fetch(`/api/weather?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => setWeather(null));
  }, [state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(q) {
    const text = (q ?? question).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: text, state, crop })
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.text || "Sorry, I could not generate advice." }
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <div className="context-bar">
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">Select your state</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          <option value="">Select crop</option>
          {crops.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {weather && (
        <div className="weather-card">
          <span>🌤️ {weather.state}</span>
          <span>
            {weather.current?.temperature}°C · humidity {weather.current?.humidity}% · rain{" "}
            {weather.current?.precipitation}mm
          </span>
        </div>
      )}

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="welcome">
            <h2>Ask your farm question</h2>
            <p>
              Select your state and crop, then ask about planting, pests, weather, or farm care.
              Advice is localized to your area.
            </p>
            <div className="quick-questions">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} className="chip" onClick={() => ask(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="msg assistant">
            <div className="bubble typing">Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your farm question…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}