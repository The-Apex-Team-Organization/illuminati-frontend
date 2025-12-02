import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await register(username, email, password);
      if (data.status === "OK") {
        setSuccess("Registration successful. You can now log in.");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(data?.notification || "Registration failed");
      }
    } catch (err) {
      setError(err?.response?.data?.notification || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page center">
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
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
            minLength={6}
          />

          <button type="submit" disabled={loading} className="btn">
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      </div>
    </div>
  );
}
