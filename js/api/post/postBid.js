import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken, getName } from "../../events/auth/storage.js";

export async function postBid(listingId, amount) {
  const url = `${BASE_URL}${ENDPOINTS.placeBids.replace("{name}", listingId)}`; // Fiks: bruk placeBids

  const token = getToken();
  if (!token) {
    throw new Error("Ingen token funnet. Logg inn på nytt.");
  }

  const bidData = {
    amount: parseFloat(amount),
    bidderName: getName(), // Legg til brukernavn fra storage.js
  };

  console.log("Sender bud til:", url, "med data:", bidData); // Legg til for feilsøking

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(bidData),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const json = await response.json();
    console.error("API-feil:", json); // Logg hele feilen
    throw new Error(json.errors?.[0]?.message || "Kunne ikke legge inn bud");
  }

  const data = await response.json();
  console.log("Bud respons:", data); // Logg responsen
  return { success: true, data };
}
