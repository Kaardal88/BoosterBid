// js/events/searchIndexHandler.js
import { searchListings } from "../api/listings/searchListings.js";
import { renderListingGrid } from "../ui/renderListingGrid.js";

export function searchIndexHandler() {
  const input = document.getElementById("search-input");
  const button = document.getElementById("search-btn");
  const container = document.getElementById("auction-container");
  if (!input || !button || !container) return;

  async function runSearch() {
    const q = input.value.trim();
    if (!q) return; // valgfritt: kunne nullstille til alle
    button.disabled = true;
    button.textContent = "Searching…";
    try {
      const results = await searchListings(q, { seller: true }); // _seller for å få med selger i kortet hvis du vil
      renderListingGrid(container, results);
    } catch (err) {
      container.innerHTML = `<p class="text-red-600">Søk feilet: ${err.message}</p>`;
    } finally {
      button.disabled = false;
      button.textContent = "Search";
    }
  }

  button.addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}
