// js/api/profiles/updateProfile.js
import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken, getName } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

/**
 * Oppdater felter på profilen (f.eks. { bio })
 * Prøver PUT først, faller tilbake til PATCH om nødvendig.
 */
export async function updateBio(username, body) {
  if (!username) throw new Error("updateProfile: mangler username");
  const token = getToken();
  if (!token) throw new Error("Du er ikke innlogget.");
  if (getName?.() !== username)
    throw new Error("Du kan bare oppdatere din egen profil.");

  let path = ENDPOINTS?.singleProfile;
  if (!path) throw new Error("ENDPOINTS.singleProfile mangler.");
  path = path.replace("{name}", encodeURIComponent(username));
  const url = joinUrl(BASE_URL, path);

  // Prøv PUT
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

  // Fallback: PATCH
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
      `Kunne ikke oppdatere profil (${res.status}): ${text.slice(0, 200)}`,
    );
  return text ? (JSON.parse(text)?.data ?? JSON.parse(text)) : null;
}
