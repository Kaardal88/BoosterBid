import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path, qs = "") {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  const q = qs ? (qs.startsWith("?") ? qs : `?${qs}`) : "";
  return `${b}/${p}${q}`;
}

export async function getListingById(id, opts = { bids: true, seller: true }) {
  if (!id || typeof id !== "string") {
    throw new Error("getListingById: 'id' mangler eller er ugyldig.");
  }

  const token = getToken();
  if (!token)
    throw new Error(
      "You are not logged in. Missing token. Please <a href='/login' class='underline text-indigo-200'>log in</a> or <a href='/register' class='underline text-indigo-200'>register</a>.",
    );

  let path = ENDPOINTS?.singleListing;
  if (!path) throw new Error("ENDPOINTS.singleListing mangler.");
  path = path.replace("{id}", encodeURIComponent(id));
  if (path.includes("{id}")) {
    throw new Error(
      "ENDPOINTS.singleListing inneholder fortsatt {id} – sjekk endpoints.js",
    );
  }

  const params = new URLSearchParams();
  if (opts.bids) params.set("_bids", "true");
  if (opts.seller) params.set("_seller", "true");

  const url = joinUrl(BASE_URL, path, params.toString());
  console.debug("[getListingById] URL:", url);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    },
  });

  const text = await res.text();
  console.debug("[getListingById] status:", res.status, res.statusText);
  console.debug("[getListingById] raw body:", text);

  if (!res.ok) {
    throw new Error(
      `Kunne ikke hente listing (${res.status}). Respons: ${truncate(text, 300)}`,
    );
  }

  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Server svarte ikke med gyldig JSON.");
  }

  const data = json?.data ?? json ?? null;
  if (!data || typeof data !== "object") {
    throw new Error("API svarte uten data for denne ID-en.");
  }
  return data;
}

function truncate(str, max) {
  return str && str.length > max ? str.slice(0, max) + "…" : str;
}
