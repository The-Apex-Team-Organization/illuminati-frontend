import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import { setAuthToken } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.status === "OK") {
        setAuthToken(data.token);
        navigate("/protected-home");
      } else {
        setError(data.notification);
      }
    } catch (err) {
      setError(
        err?.response?.data?.notification || err.message || "Network error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page center">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading} className="btn">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {error && <div className="error">{error}</div>}

          <div className="muted">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
