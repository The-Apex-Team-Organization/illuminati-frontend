import React from "react";
import { Navigate } from "react-router-dom";
import { isEntryVerified } from "../auth";

export default function ProtectedEntry({ children }) {
  if (!isEntryVerified()) {
    return <Navigate to="/entry" replace />;
  }
  return children;
}
