import axios from "axios";
import { getAuthToken } from "./auth";

const API_BASE = "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export async function verifyEntryPassword(password) {
  const res = await client.post("/api/authentific/entry/", { password });
  return res.data;
}

export async function login(email, password) {
  const res = await client.post("/api/authentific/login/", { email, password });
  return res.data;
}

export async function register(username, email, password) {
  const res = await client.post("/api/authentific/register/", {
    username,
    email,
    password,
  });
  return res.data;
}

export async function getAllRecords() {
  const res = await client.get("/api/records/all");
  return res.data;
}

export async function createRecord(data) {
  const res = await client.post("/api/records/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getRecordById(id) {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.get(`/api/records/${id}`, { headers });
  return res.data;
}

export async function likeRecord(recordId) {
  const token = getAuthToken();
  const res = await client.post(
    `/api/records/${recordId}/like/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function unlikeRecord(recordId) {
  const token = getAuthToken();
  const res = await client.post(
    `/api/records/${recordId}/unlike/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function eraseAllRecords() {
  const token = getAuthToken();
  const res = await client.post(
    "/api/records/erase",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function downloadRecordsBackup() {
  const response = await client.get("/api/snapshot/download/", {
    responseType: "blob",
  });
  return response.data;
}

export async function restoreRecordsBackup(data) {
  const response = await client.post("/api/snapshot/upload/", data);
  return response.data;
}

export async function getVotes(token) {
  const res = await client.get("/api/votes/getVotes/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function sendVote(token, vote) {
  const res = await client.post("/api/votes/sendVote/", vote, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getHallOfFame() {
  const res = await client.get("/api/hall_of_fame/");
  return res.data;
}

export async function sendHallOfFameMessage(architect_id, message) {
  const res = await client.post("/api/hall_of_fame/send", {
    architect_id,
    message,
  });
  return res.data;
}

export async function sendInvite(email, token) {
  const res = await client.post(
    "/api/users/invite/",
    { email },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function checkPromotePermission() {
  const token = getAuthToken();
  const res = await client.get("/api/votes/hasPermission/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function checkBanPermission() {
  const token = getAuthToken();
  const res = await client.get("/api/votes/banPermission/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function promoteUser() {
  const token = getAuthToken();
  const res = await client.patch(
    "/api/votes/promote/",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function banUser(userData) {
  const token = getAuthToken();
  const res = await client.patch("/api/votes/ban/", userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export default client;
