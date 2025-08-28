import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken, getName } from "../../events/auth/storage.js";

export async function getCredits() {
  const name = getName();
  if (!name) {
    throw new Error("Brukernavn ikke funnet. Logg inn på nytt.");
  }

  const url = `${BASE_URL}${ENDPOINTS.credits.replace("{name}", name)}`;

  const token = getToken();
  if (!token) {
    throw new Error("Ingen token funnet. Logg inn på nytt.");
  }

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.errors?.[0]?.message || "Kunne ikke hente kreditter");
  }

  const data = await response.json();
  return data;
}
