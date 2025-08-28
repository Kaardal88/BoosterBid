import { BASE_URL, ENDPOINTS } from "../endpoints.js";

function joinUrl(base, path, qs = "") {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}${qs ? `?${qs}` : ""}`;
}

export async function getListingsPage({
  page = 1,
  limit = 9,
  bids = false,
  seller = true,
  active,
  tag,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (bids) params.set("_bids", "true");
  if (seller) params.set("_seller", "true");

  params.set("sort", "created");
  params.set("sortOrder", "desc");

  if (typeof active === "boolean") params.set("_active", String(active));
  if (tag && tag.trim()) params.set("_tag", tag.trim());

  const url = joinUrl(BASE_URL, ENDPOINTS.listListings, params.toString());
  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Could not fetch listings (${res.status}): ${text.slice(0, 150)}`,
    );
  }
  const json = text ? JSON.parse(text) : null;
  const data = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
      ? json
      : [];
  const total = json?.meta?.total || null;

  return { items: data, total };
}
