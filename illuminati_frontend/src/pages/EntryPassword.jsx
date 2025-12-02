import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setEntryVerified } from "../auth";
import { verifyEntryPassword } from "../api";

export default function EntryPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await verifyEntryPassword(password);
      if (data.status === "OK") {
        setEntryVerified(true);
        navigate("/login");
      } else {
        setError(data.notification);
      }
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page center">
      <div className="card">
        <h2>Enter Today's Password</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="password"
            placeholder="Entry password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={1}
          />
          <button type="submit" disabled={loading} className="btn">
            {loading ? "Verifying..." : "Submit"}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
