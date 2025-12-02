import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../auth";
import {
  getVotes,
  sendVote,
  checkPromotePermission,
  checkBanPermission,
  promoteUser,
  banUser,
} from "../api";

export default function Vote() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const [hasPromotePermission, setHasPromotePermission] = useState(false);
  const [hasBanPermission, setHasBanPermission] = useState(false);

  const [banUsers, setBanUsers] = useState([]);
  const [selectedBanUser, setSelectedBanUser] = useState(null);

  const token = getAuthToken();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const votesPromise = getVotes(token);
      const promotePromise = checkPromotePermission();
      const banPromise = checkBanPermission();

      try {
        const res = await votesPromise;
        if (res.status === "OK") {
          setVotes(res.data);
        } else {
          setError("Server returned wrong response");
        }
      } catch (err) {
        console.error("Votes fetch error:", err);
        setError("Failed to fetch votes");
      }

      promotePromise
        .then((promote) => {
          if (promote.status === "OK") {
            setHasPromotePermission(true);
          }
        })
        .catch((err) => console.error("Promote perm error:", err));

      banPromise
        .then((ban) => {
          if (ban.status === "OK") {
            setHasBanPermission(true);
            setBanUsers(ban.data);
          }
        })
        .catch((err) => console.error("Ban perm error:", err))
        .finally(() => setLoading(false));
    }

    loadData();
  }, [token]);

  const handleVote = async (vote, choice) => {
    try {
      setMessage("");
      const res = await sendVote(token, {
        id: vote.id,
        name: vote.name,
        choice,
      });

      if (res.status === "OK") {
        setMessage(`Vote ${choice} sent successfully!`);
        setTimeout(() => globalThis.location.reload(), 1000);
      } else {
        setMessage(`Server error: ${res.notification}`);
      }
    } catch (err) {
      console.error("Vote error:", err);
      setMessage("Failed to send vote!");
    }
  };

  const handlePromote = async () => {
    try {
      setMessage("");
      const res = await promoteUser();

      if (res.status === "OK") {
        setMessage("Promotion successful!");
        setTimeout(() => globalThis.location.reload(), 1000);
      } else {
        setMessage(`Server error: ${res.notification}`);
      }
    } catch (err) {
      console.error("Promote error:", err);
      setMessage("Failed to promote!");
    }
  };

  const handleBan = async () => {
    try {
      if (!selectedBanUser) {
        setMessage("Please select a user to ban.");
        return;
      }

      const res = await banUser(selectedBanUser);

      if (res.status === "OK") {
        setMessage(`Ban vote created for ${selectedBanUser.username}!`);
        setTimeout(() => globalThis.location.reload(), 1000);
      } else {
        setMessage(`Server error: ${res.notification}`);
      }
    } catch (err) {
      console.error("Ban error:", err);
      setMessage("Failed to ban!");
    }
  };

  if (loading)
    return (
      <div className="page-home">
        <Navbar />
        <div className="center">
          <p>Loading votes...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-home">
        <Navbar />
        <div className="center">
          <p className="error">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="page-home">
      <Navbar />

      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        <div className="map-card" style={{ flex: 1, maxWidth: "850px" }}>
          <h2>Active Votes</h2>

          {message && (
            <div
              style={{
                marginBottom: "15px",
                color: message.includes("AGREE") ? "lightgreen" : "salmon",
              }}
            >
              {message}
            </div>
          )}

          {votes.length === 0 ? (
            <p>There are no active votes</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                color: "#f5f5f5",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--accent)" }}>
                  <th style={{ padding: "10px" }}>Name</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    Percentage of users who voted
                  </th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr key={vote.id} style={{ borderBottom: "1px solid #333" }}>
                    <td style={{ padding: "10px" }}>{vote.name}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {vote.percent}%
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button
                        className="btn"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleVote(vote, "AGREE")}
                      >
                        Agree
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: "var(--danger)",
                          marginRight: "10px",
                        }}
                        onClick={() => handleVote(vote, "DISAGREE")}
                      >
                        Disagree
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            width: "260px",
            background: "#141414",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
            height: "fit-content",
            border: "1px solid var(--accent)",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Actions</h3>

          {hasBanPermission && (
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="ban-user">Select user to ban:</label>
              <select
                id="ban-user"
                onChange={(e) => {
                  const user = banUsers.find(
                    (u) => u.user_id === Number(e.target.value),
                  );
                  setSelectedBanUser(user);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  marginTop: "5px",
                }}
              >
                <option value="">Select...</option>
                {banUsers.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.username}
                  </option>
                ))}
              </select>

              <button
                className="btn"
                style={{
                  width: "100%",
                  marginTop: "10px",
                  background: "var(--danger)",
                }}
                onClick={handleBan}
              >
                Ban User
              </button>
            </div>
          )}

          {hasPromotePermission && (
            <button
              className="btn"
              style={{ width: "100%", background: "var(--accent)" }}
              onClick={handlePromote}
            >
              Promote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
