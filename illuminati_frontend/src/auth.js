const ENTRY_KEY = "entry_verified";
const TOKEN_KEY = "auth_token";

export function setEntryVerified(value = true) {
  sessionStorage.setItem(ENTRY_KEY, value ? "1" : "0");
}

export function isEntryVerified() {
  return sessionStorage.getItem(ENTRY_KEY) === "1";
}

export function setAuthToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUserRoles() {
  const token = sessionStorage.getItem("auth_token");
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return [payload.role];
  } catch {
    return [];
  }
}
