import React from "react";
import { Navigate } from "react-router-dom";
import { isEntryVerified } from "../auth";
import { getAuthToken } from "../auth";

export default function ProtectedAuth({ children }) {
  if (!isEntryVerified()) {
    return <Navigate to="/entry" replace />;
  }
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
