import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, ""),
    p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export async function deleteListing(id) {
  if (!id) throw new Error("deleteListing: mangler id");
  const token = getToken();
  if (!token) throw new Error("Du må være innlogget.");

  const path = ENDPOINTS.singleListing.replace("{id}", encodeURIComponent(id));
  const url = joinUrl(BASE_URL, path);
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Kunne ikke slette listing (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return true;
}
