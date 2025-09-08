import { renderListingCard } from "./renderListingCard.js";

export function renderListingGrid(container, listings) {
  if (!container) return;
  if (!Array.isArray(listings) || !listings.length) {
    container.innerHTML = `<p class="text-gray-500">No listings available.</p>`;
    return;
  }
  container.innerHTML = `<ul class="grid grid-cols-1 grid-rows-5 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-full overflow-x-hidden">${listings.map(renderListingCard).join("")}</ul>`;
}
