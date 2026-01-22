import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        api.get("/api/applications/programs")
        if (!mounted) return;
        setPrograms(res.data?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load programs (check backend on port 5000)");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Explore Programs</h1>
      <p style={{ opacity: 0.75 }}>
        Browse available programs and choose what fits you best.
      </p>

      {loading && <div>Loading programs...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {programs.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>{p.name}</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>{p.degree}</div>

              <button
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: "#0b1220",
                  color: "white",
                  fontWeight: 800,
                }}
                onClick={() => alert(`Selected: ${p.name}`)}
              >
                View Requirements
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
