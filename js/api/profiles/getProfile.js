// js/api/profiles/getProfile.js
import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path, qs = "") {
  const b = (base || "").replace(/\/+$/, ""); // fjern trailing /
  const p = (path || "").replace(/^\/+/, ""); // fjern leading /
  const q = qs ? (qs.startsWith("?") ? qs : `?${qs}`) : "";
  return `${b}/${p}${q}`;
}

/**
 * Hent profil for gitt brukernavn.
 * @param {string} username
 * @param {{ listings?: boolean, wins?: boolean }} [opts]
 */
export async function getProfile(username, opts = {}) {
  if (!username || typeof username !== "string") {
    throw new Error("getProfile: 'username' mangler/ugyldig.");
  }

  const token = getToken();

  if (!token) throw new Error("Du er ikke innlogget. Mangler token.");

  // f.eks. "auction/profiles/{name}" (uten leading slash i ENDPOINTS)
  let path = ENDPOINTS?.singleProfile;
  if (!path) throw new Error("ENDPOINTS.singleProfile mangler.");
  path = path.replace("{name}", encodeURIComponent(username));
  if (path.includes("{name}")) {
    throw new Error(
      "ENDPOINTS.singleProfile inneholder fortsatt {name} – sjekk endpoints.js",
    );
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

  // Les body KUN én gang
  const text = await res.text();
  console.debug("[getProfile] status:", res.status, res.statusText);
  if (!res.ok) {
    // vis litt av body i feilmelding (404 = user finnes ikke)
    throw new Error(
      `Kunne ikke hente profil (${res.status}). Respons: ${text.slice(0, 300)}`,
    );
  }

  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Server svarte ikke med gyldig JSON.");
  }

  const data = json?.data ?? json ?? null;
  if (!data || typeof data !== "object") {
    throw new Error("API svarte uten data for denne profilen.");
  }
  return data;
}
