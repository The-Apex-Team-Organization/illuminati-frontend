import { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import EntryPassword from "./pages/EntryPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedHome from "./pages/ProtectedHome";
import ProtectedEntry from "./components/ProtectedEntry";
import ProtectedAuth from "./components/ProtectedAuth";
import RecordsBackupRestore from "./pages/RecordsBackupRestore";
import { isEntryVerified } from "./auth";
import Vote from "./pages/Vote";
import HallOfFame from "./pages/HallOfFame.jsx";
import Invite from "./pages/Invite";

export default function App() {
  return (
    <div>
      <div>
        <Link to="/entry"></Link>
        {isEntryVerified() && (
          <>
            {" "}
            <Link to="/login"></Link> <Link to="/register"></Link>
          </>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/entry" replace />} />
        <Route path="/entry" element={<EntryPassword />} />

        <Route
          path="/login"
          element={
            <ProtectedEntry>
              <Login />
            </ProtectedEntry>
          }
        />

        <Route
          path="/register"
          element={
            <ProtectedEntry>
              <Register />
            </ProtectedEntry>
          }
        />

        <Route
          path="/protected-home"
          element={
            <ProtectedAuth>
              <ProtectedHome />
            </ProtectedAuth>
          }
        />

        <Route
          path="/hall_of_fame"
          element={
            <ProtectedAuth>
              <HallOfFame />
            </ProtectedAuth>
          }
        />

        <Route
          path="/invite"
          element={
            <ProtectedAuth>
              <Invite />
            </ProtectedAuth>
          }
        />

        <Route
          path="/vote"
          element={
            <ProtectedAuth>
              <Vote />
            </ProtectedAuth>
          }
        />

        <Route
          path="/records"
          element={
            <ProtectedAuth>
              <RecordsBackupRestore />
            </ProtectedAuth>
          }
        />
      </Routes>
    </div>
  );
}
