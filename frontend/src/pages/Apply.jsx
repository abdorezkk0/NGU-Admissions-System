import React, { useState } from "react";
import api from "../services/api";

export default function Apply() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/applications", { fullName, email });
      setCreated(res.data?.data || res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create application");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Start Application</h1>

      <form onSubmit={submit} style={{ marginTop: 14 }}>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            marginBottom: 10,
          }}
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            marginBottom: 10,
          }}
        />

        <button
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#0b1220",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Create Application
        </button>
      </form>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

      {created && (
        <div style={{ marginTop: 18 }}>
          <b>Application Created ✅</b>
          <div>ID: {created.id}</div>
          <div>Status: {created.status}</div>
        </div>
      )}
    </div>
  );
}
