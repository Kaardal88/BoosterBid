import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken, getName } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

async function doFetch(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, json: safeParse(text) };
}

function safeParse(t) {
  try {
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

/**
 * Uppdate avatar and banner.
 * @param {string} username - Must match logged in user
 * @param {{ avatar?: { url?: string, alt?: string }, banner?: { url?: string, alt?: string } }} payload
 */
export async function updateAvatar(username, payload) {
  const loggedIn = getName?.();
  if (!username) throw new Error("Missing username.");
  if (!getToken()) throw new Error("You are not logged in.");
  if (!loggedIn || loggedIn !== username) {
    throw new Error(
      `You are logged in as: ${loggedIn || "unknown account"}, but trying to update avatar for: ${username}`,
    );
  }

  let path = ENDPOINTS?.updateProfileMedia?.replace(
    "{name}",
    encodeURIComponent(username),
  );
  const primaryUrl = path ? joinUrl(BASE_URL, path) : null;
  if (!primaryUrl) throw new Error("ENDPOINTS.updateProfileMedia mangler.");

  console.debug("[updateProfileMedia] TRY PUT", primaryUrl, payload);
  let r = await doFetch(primaryUrl, "PUT", payload);
  if (r.ok) return r.json?.data ?? r.json;

  if (r.status === 404 || r.status === 405) {
    console.debug("[updateProfileMedia] fallback PATCH /media");
    r = await doFetch(primaryUrl, "PATCH", payload);
    if (r.ok) return r.json?.data ?? r.json;
  }

  const altPath = ENDPOINTS?.singleProfile?.replace(
    "{name}",
    encodeURIComponent(username),
  );
  const altUrl = altPath ? joinUrl(BASE_URL, altPath) : null;
  if (altUrl) {
    console.debug("[updateProfileMedia] fallback PUT", altUrl);
    r = await doFetch(altUrl, "PUT", payload);
    if (r.ok) return r.json?.data ?? r.json;
  }

  const msg = r.json?.errors?.[0]?.message || r.text || `Status ${r.status}`;
  throw new Error(`Could not update avatar: ${msg}`);
}
