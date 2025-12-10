import axios from "axios";
import { getAuthToken } from "./auth";

const API_BASE = "/api/";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export async function verifyEntryPassword(password) {
  const res = await client.post("authentific/entry/", { password });
  return res.data;
}

export async function login(email, password) {
  const res = await client.post("authentific/login/", { email, password });
  return res.data;
}

export async function register(username, email, password) {
  const res = await client.post("authentific/register/", {
    username,
    email,
    password,
  });
  return res.data;
}

export async function getAllRecords() {
  const res = await client.get("records/all");
  return res.data;
}

export async function createRecord(data) {
  const res = await client.post("records/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getRecordById(id) {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await client.get(`records/${id}`, { headers });
  return res.data;
}

export async function likeRecord(recordId) {
  const token = getAuthToken();
  const res = await client.post(
    `records/${recordId}/like/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function unlikeRecord(recordId) {
  const token = getAuthToken();
  const res = await client.post(
    `records/${recordId}/unlike/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function eraseAllRecords() {
  const token = getAuthToken();
  const res = await client.post(
    "records/erase",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function downloadRecordsBackup() {
  const response = await client.get("snapshot/download/", {
    responseType: "blob",
  });
  return response.data;
}

export async function restoreRecordsBackup(data) {
  const response = await client.post("snapshot/upload/", data);
  return response.data;
}

export async function getVotes(token) {
  const res = await client.get("votes/getVotes/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function sendVote(token, vote) {
  const res = await client.post("votes/sendVote/", vote, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getHallOfFame() {
  const res = await client.get("hall_of_fame/");
  return res.data;
}

export async function sendHallOfFameMessage(architect_id, message) {
  const res = await client.post("hall_of_fame/send", {
    architect_id,
    message,
  });
  return res.data;
}

export async function sendInvite(email, token) {
  const res = await client.post(
    "users/invite/",
    { email },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function checkPromotePermission() {
  const token = getAuthToken();
  const res = await client.get("votes/hasPermission/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function checkBanPermission() {
  const token = getAuthToken();
  const res = await client.get("votes/banPermission/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function promoteUser() {
  const token = getAuthToken();
  const res = await client.patch(
    "votes/promote/",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function banUser(userData) {
  const token = getAuthToken();
  const res = await client.patch("votes/ban/", userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function sendBroadcast(data) {
  const token = getAuthToken();
  const { tiers, topic, text } = data;
  const res = await client.post(
    "users/broadcast/",
    { tiers, topic, text },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export default client;
