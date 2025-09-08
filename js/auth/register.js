import { BASE_URL, ENDPOINTS } from "../api/endpoints.js";

export async function register(user) {
  const url = `${BASE_URL}${ENDPOINTS.register}`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.errors?.[0]?.message || "Registration failed");
  }

  return await response.json();
}
