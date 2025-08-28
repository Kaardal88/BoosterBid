import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, ""),
    p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

/**
 * Oppdater en eksisterende listing (PUT = full oppdatering; PATCH kan også brukes)
 * body: valgfri subset av { title, description, tags, media, endsAt }
 */
export async function updateListing(id, body) {
  if (!id) throw new Error("updateListing: mangler id");
  const token = getToken();
  if (!token) throw new Error("Du må være innlogget.");

  const path = ENDPOINTS.singleListing.replace("{id}", encodeURIComponent(id));
  const url = joinUrl(BASE_URL, path);
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok)
    throw new Error(
      `Kunne ikke oppdatere listing (${res.status}): ${text.slice(0, 200)}`,
    );
  const json = text ? JSON.parse(text) : null;
  return json?.data ?? json;
}
