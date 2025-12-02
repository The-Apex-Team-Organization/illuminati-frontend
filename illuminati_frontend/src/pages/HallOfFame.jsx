import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getHallOfFame, sendHallOfFameMessage } from "../api";

export default function HallOfFame() {
  const [architects, setArchitects] = useState([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getHallOfFame();
        setArchitects(res.data);
      } catch (e) {
        console.error("Failed to load architects", e);
      }
    }
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await sendHallOfFameMessage(selected, message);
      setStatus("success");
      setMessage("");
      setSelected("");
    } catch (e) {
      console.error("Failed to send message", e);
      setStatus("error");
      alert("An error occurred while sending your message. Please try again.");
    }
  };

  return (
    <div className="center">
      <Navbar />
      <div className="card">
        <h2>Hall of Fame</h2>

        <form className="form" onSubmit={handleSend}>
          <select
            className="form-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
          >
            <option value="">Select Architect</option>
            {architects.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="4"
          ></textarea>

          <button
            className="btn"
            type="submit"
            disabled={!selected || !message || status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status === "success" && (
          <p style={{ color: "var(--accent)", marginTop: "10px" }}>
            Message sent successfully!
          </p>
        )}
        {status === "error" && (
          <p style={{ color: "var(--danger)", marginTop: "10px" }}>
            Failed to send message.
          </p>
        )}
      </div>
    </div>
  );
}
