import { BASE_URL } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

/**
 * Updating a profile
 * @param {string} name - Profile name to update
 * @param {Object} patch - Parts to update. { bio: "text" }
 */
export async function updateProfile(name, patch) {
  const token = getToken();
  const url = `${BASE_URL}auction/profiles/${encodeURIComponent(name)}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Could not update profile (${res.status}): ${errText}`);
  }

  return await res.json();
}
