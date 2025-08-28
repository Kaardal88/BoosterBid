// js/api/profiles/updateProfile.js
import { BASE_URL } from "../endpoints.js"; // eller ../config.js hvis du samler BASE_URL der
import { API_KEY } from "../config.js"; // Noroff auction API krever x-noroff-api-key
import { getToken } from "../../events/auth/storage.js"; // din eksisterende token-helper

/**
 * Oppdaterer innlogget brukers profil (bio, avatar, banner osv.)
 * @param {string} name - Profilnavnet som skal oppdateres
 * @param {Object} patch - Delvis oppdatering, f.eks. { bio: "tekst" }
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
    throw new Error(`Kunne ikke oppdatere profil (${res.status}): ${errText}`);
  }

  return await res.json();
}
