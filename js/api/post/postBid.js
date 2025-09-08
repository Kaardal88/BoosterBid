import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken, getName } from "../../events/auth/storage.js";

export async function postBid(listingId, amount) {
  const url = `${BASE_URL}${ENDPOINTS.placeBids.replace("{name}", listingId)}`;

  const token = getToken();
  if (!token) {
    throw new Error("No token found. Please log in.");
  }

  const bidData = {
    amount: parseFloat(amount),
    bidderName: getName(),
  };

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
    console.error("API-error:", json);
    throw new Error(json.errors?.[0]?.message || "Could not place bid");
  }

  const data = await response.json();

  return { success: true, data };
}
