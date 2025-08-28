// js/ui/listings/renderListingGrid.js
import { renderListingCard } from "./renderListingCard.js";

export function renderListingGrid(container, listings) {
  if (!container) return;
  if (!Array.isArray(listings) || !listings.length) {
    container.innerHTML = `<p class="text-gray-500">No listings available.</p>`;
    return;
  }
  container.innerHTML = `<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${listings.map(renderListingCard).join("")}</ul>`;
}
