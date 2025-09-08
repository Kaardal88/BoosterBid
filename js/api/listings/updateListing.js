import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, ""),
    p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export async function updateListing(id, body) {
  if (!id) throw new Error("updateListing: missing id");
  const token = getToken();
  if (!token) throw new Error("You are not logged in.");

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
      `Could not update listing (${res.status}): ${text.slice(0, 200)}`,
    );
  const json = text ? JSON.parse(text) : null;
  return json?.data ?? json;
}
