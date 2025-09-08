import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken, getName } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}
export async function updateBio(username, body) {
  if (!username) throw new Error("updateProfile: missing username.");
  const token = getToken();
  if (!token) throw new Error("Your are not logged in.");
  if (getName?.() !== username)
    throw new Error("You can only update your own profile.");

  let path = ENDPOINTS?.singleProfile;
  if (!path) throw new Error("ENDPOINTS.singleProfile missing.");
  path = path.replace("{name}", encodeURIComponent(username));
  const url = joinUrl(BASE_URL, path);

  let res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify(body),
  });

  let text = await res.text();
  if (res.ok) {
    return text ? (JSON.parse(text)?.data ?? JSON.parse(text)) : null;
  }

  res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify(body),
  });

  text = await res.text();
  if (!res.ok)
    throw new Error(
      `Could not update profile (${res.status}): ${text.slice(0, 200)}`,
    );
  return text ? (JSON.parse(text)?.data ?? JSON.parse(text)) : null;
}
