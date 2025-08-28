import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

export async function getListings() {
  const url = `${BASE_URL}${ENDPOINTS.allListings}?_active=true&_bids=true&sort=created&sortOrder=desc`;
  console.log("Henter listings fra:", url);

  const token = getToken();
  console.log("Token:", token);
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
  const json = await response.json();
  console.log("Listings respons:", json);
  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Could not fetch listings");
  }

  return json;
}
