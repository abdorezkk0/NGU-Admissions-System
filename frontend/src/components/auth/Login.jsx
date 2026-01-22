import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginService(email, password);
      
      // ✅ Update auth context
      login(response.user);
      
      // ✅ Redirect based on role
      const role = response.user?.role;
      if (role === 'admin') {
        navigate("/admin/dashboard");
      } else if (role === 'staff') {
        navigate("/staff/dashboard");
      } else {
        navigate("/apply");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h1>Login</h1>
      <p style={{ opacity: 0.75 }}>Sign in to continue.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
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

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
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
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#0b1220",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
      
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}