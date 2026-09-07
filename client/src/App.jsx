import { useState, useEffect } from "react";
import ChatPage from "./pages/ChatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

export default function App() {
  const [tab, setTab] = useState("chat");
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "unreachable" }));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🌾</span>
          <div>
            <h1>AgriTrack AI</h1>
            <p className="tagline">Local farm advisor for Nigerian farmers</p>
          </div>
        </div>
        {health && (
          <span className={`badge badge-${health.status === "ok" ? "ok" : "warn"}`}>
            {health.ai === "offline" ? "AI: offline mode" : `AI: ${health.ai}`}
          </span>
        )}
      </header>

      <nav className="tabbar">
        <button className={tab === "chat" ? "tab active" : "tab"} onClick={() => setTab("chat")}>
          💬 Advisor
        </button>
        <button
          className={tab === "dashboard" ? "tab active" : "tab"}
          onClick={() => setTab("dashboard")}
        >
          📋 My Farms
        </button>
      </nav>

      <main className="content">
        {tab === "chat" ? <ChatPage /> : <DashboardPage />}
      </main>

      <footer className="app-footer">
        <p>
          AgriTrack AI gives general guidance only — not a substitute for a certified agronomist.
        </p>
      </footer>
    </div>
  );
}