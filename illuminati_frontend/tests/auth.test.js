import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  setEntryVerified,
  isEntryVerified,
  setAuthToken,
  getAuthToken,
  getUserRoles,
} from "../src/auth.js";

const ENTRY_KEY = "entry_verified";
const TOKEN_KEY = "auth_token";

beforeEach(() => {
  const store = {};
  globalThis.sessionStorage = {
    setItem: (key, val) => (store[key] = val),
    getItem: (key) => store[key],
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  vi.spyOn(globalThis, "atob").mockImplementation((str) =>
    Buffer.from(str, "base64").toString("binary"),
  );
});

describe("auth.js utilities", () => {
  test("setEntryVerified(true) stores '1' in sessionStorage", () => {
    setEntryVerified(true);
    expect(sessionStorage.getItem(ENTRY_KEY)).toBe("1");
  });

  test("setEntryVerified(false) stores '0' in sessionStorage", () => {
    setEntryVerified(false);
    expect(sessionStorage.getItem(ENTRY_KEY)).toBe("0");
  });

  test("isEntryVerified() returns true only when '1'", () => {
    sessionStorage.setItem(ENTRY_KEY, "1");
    expect(isEntryVerified()).toBe(true);

    sessionStorage.setItem(ENTRY_KEY, "0");
    expect(isEntryVerified()).toBe(false);
  });

  test("setAuthToken() and getAuthToken() work correctly", () => {
    setAuthToken("myToken123");
    expect(getAuthToken()).toBe("myToken123");
  });

  test("getUserRoles() returns [] if no token", () => {
    expect(getUserRoles()).toEqual([]);
  });

  test("getUserRoles() decodes JWT and returns the role", () => {
    const payload = { role: "Admin" };
    const token = `header.${btoa(JSON.stringify(payload))}.sig`;
    sessionStorage.setItem(TOKEN_KEY, token);
    expect(getUserRoles()).toEqual(["Admin"]);
  });

  test("getUserRoles() returns [] for invalid token", () => {
    sessionStorage.setItem(TOKEN_KEY, "invalid.token");
    expect(getUserRoles()).toEqual([]);
  });
});
