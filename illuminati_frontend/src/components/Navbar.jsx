import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/masons_logo.svg";
import { navItems } from "../configs/navbar";
import { getUserRoles } from "../auth";
import { eraseAllRecords } from "../api";

async function handleErase() {
  const confirmed = globalThis.confirm(
    "This will permanently delete all records. Are you absolutely sure?",
  );
  if (!confirmed) return;

  try {
    const res = await eraseAllRecords();
    if (res.status === "OK") {
      alert("All records erased.");
      globalThis.location.reload();
    } else {
      alert(res.notification || "Erase failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Error contacting server.");
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const userRoles = getUserRoles();

  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => userRoles.includes(role)),
  );

  const canErase = ["GoldMason", "Architect"].some((role) =>
    userRoles.includes(role),
  );

  function handleLogout() {
    sessionStorage.clear();
    navigate("/entry");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo" className="nav-logo" />
        <span className="nav-title">Illuminati</span>
      </div>

      <div className="nav-center">
        {visibleItems.map((item) => (
          <a key={item.name} href={item.href}>
            {item.name}
          </a>
        ))}
      </div>

      <div className="nav-right" style={{ display: "flex", gap: "10px" }}>
        {canErase && (
          <button onClick={handleErase} className="btn btn-danger">
            We are compromised
          </button>
        )}
        <button onClick={handleLogout} className="nav-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
