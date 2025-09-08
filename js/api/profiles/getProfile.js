import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path, qs = "") {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  const q = qs ? (qs.startsWith("?") ? qs : `?${qs}`) : "";
  return `${b}/${p}${q}`;
}

/**
 * GetProfile.
 * @param {string} username
 * @param {{ listings?: boolean, wins?: boolean }} [opts]
 */
export async function getProfile(username, opts = {}) {
  if (!username || typeof username !== "string") {
    throw new Error("getProfile: 'username' missing or invalid.");
  }

  const token = getToken();

  if (!token) throw new Error("You are not logged in.");

  let path = ENDPOINTS?.singleProfile;
  if (!path) throw new Error("ENDPOINTS.singleProfile mangler.");
  path = path.replace("{name}", encodeURIComponent(username));
  if (path.includes("{name}")) {
    throw new Error("ENDPOINTS.singleProfile contains {name} – ");
  }

  const params = new URLSearchParams();
  if (opts.listings) params.set("_listings", "true");
  if (opts.wins) params.set("_wins", "true");

  const url = joinUrl(BASE_URL, path, params.toString());
  console.debug("[getProfile] URL:", url);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
  });

  const text = await res.text();
  console.debug("[getProfile] status:", res.status, res.statusText);
  if (!res.ok) {
    throw new Error(
      `Could not get profile (${res.status}). Response: ${text.slice(0, 300)}`,
    );
  }

  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Server answered with invalid JSON.");
  }

  const data = json?.data ?? json ?? null;
  if (!data || typeof data !== "object") {
    throw new Error("API did not return an object.");
  }
  return data;
}
