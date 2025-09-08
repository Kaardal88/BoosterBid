import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, ""),
    p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export async function createListing(body) {
  const token = getToken();
  if (!token) throw new Error("Du må være innlogget.");

  const url = joinUrl(BASE_URL, ENDPOINTS.listListings);
  const res = await fetch(url, {
    method: "POST",
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
      `Kunne ikke opprette listing (${res.status}): ${text.slice(0, 200)}`,
    );
  const json = text ? JSON.parse(text) : null;
  return json?.data ?? json;
}
