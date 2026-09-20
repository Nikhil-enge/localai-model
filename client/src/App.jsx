import { useState } from "react";
import "./App.css";

function App() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!notes.trim()) {
      alert("Please enter your study notes.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const response = await fetch("http://localhost:3000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setSummary(data.summary);
    } catch (error) {
      setSummary(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <section className="container">
        <h1>localai-model</h1>
        <p className="subtitle">
          Turn your study notes into simple summaries using on-device AI.
        </p>

        <div className="card">
          <h2>Study Notes</h2>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here..."
          />

         <div className="bottom-row">
  <span>{notes.length} characters</span>

  <div className="button-group">
    <button
      className="clear-button"
      onClick={() => {
        setNotes("");
        setSummary("");
      }}
      disabled={loading}
    >
      Clear
    </button>

    <button onClick={generateSummary} disabled={loading}>
      {loading ? "Generating..." : "✨ Generate Summary"}
    </button>
  </div>
</div>
        </div>

        {summary && (
  <div className="card summary-card">
    <div className="summary-header">
      <h2>AI Summary</h2>

      <button
        className="copy-button"
        onClick={() => navigator.clipboard.writeText(summary)}
      >
        📋 Copy
      </button>
    </div>

    <p>{summary}</p>
  </div>
)}
      </section>
    </main>
  );
}

export default App;