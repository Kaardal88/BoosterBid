// js/api/listings/searchListings.js
import { BASE_URL, ENDPOINTS } from "../endpoints.js";
import { API_KEY } from "../config.js";
import { getToken } from "../../events/auth/storage.js";

function joinUrl(base, path, qs = "") {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}${qs ? `?${qs}` : ""}`;
}

/**
 * Søk i ALLE listings (tittel + beskrivelse). Returnerer array av listings.
 * opts: { bids?: boolean, seller?: boolean, limit?: number, page?: number }
 */
export async function searchListings(query, opts = {}) {
  if (!query || !query.trim()) return [];
  const params = new URLSearchParams({ q: query.trim() });
  if (opts.bids) params.set("_bids", "true");
  if (opts.seller) params.set("_seller", "true");
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.page) params.set("page", String(opts.page));

  const url = joinUrl(BASE_URL, ENDPOINTS.searchListings, params.toString());

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });

  const text = await res.text();
  if (!res.ok)
    throw new Error(`Search feilet (${res.status}): ${text.slice(0, 200)}`);
  const json = text ? JSON.parse(text) : null;
  return Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
      ? json
      : [];
}
