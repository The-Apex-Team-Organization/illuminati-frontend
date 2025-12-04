import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { sendInvite } from "../api";
import { getAuthToken } from "../auth";

export default function Invite() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const token = getAuthToken();
      await sendInvite(email, token);

      setStatus("success");
      setMessage(
        "If this person can be invited, they’ll receive an email shortly.",
      );
      setEmail("");
    } catch (err) {
      const statusCode = err?.response?.status;

      if (statusCode === 409) {
        setStatus("success");
        setMessage(
          "If this person can be invited, they’ll receive an email shortly.",
        );
      } else {
        setStatus("error");
        setMessage(
          "Invitation could not be processed at this time. Please try again later.",
        );
      }
    }
  };

  return (
    <div className="center">
      <Navbar />
      <div className="card">
        <h2>Send Invitation</h2>
        <form className="form" onSubmit={handleInvite}>
          <input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            className="btn"
            type="submit"
            disabled={status === "loading" || !email}
          >
            {status === "loading" ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {status === "success" && (
          <p
            className="invite-message"
            style={{ color: "var(--accent)", marginTop: "10px" }}
          >
            {" "}
            {message}{" "}
          </p>
        )}
        {status === "error" && (
          <p
            className="invite-error"
            style={{ color: "var(--danger)", marginTop: "10px" }}
          >
            {" "}
            {message}{" "}
          </p>
        )}
      </div>
    </div>
  );
}
