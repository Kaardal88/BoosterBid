import { BASE_URL, ENDPOINTS } from "../api/endpoints.js";
import { getToken } from "../events/auth/storage.js";
import { API_KEY } from "../api/config.js";

export async function login(data) {
  const url = `${BASE_URL}${ENDPOINTS.login}`;

  const token = getToken();

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, options);
  console.log(response);

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.errors?.[0]?.message || "Login failed");
  }

  return await response.json();
}
