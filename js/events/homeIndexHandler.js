import { getListingsPage } from "../api/listings/getListingsPage.js";
import { renderListingCard } from "../ui/renderListingCard.js";

export async function homeIndexHandler() {
  const grid = document.getElementById("auction-container");
  const container = document.getElementById("auction-container");
  container.innerHTML = `<p class="text-white text-3xl  mx-auto">Loading Listings...</p>`;
  try {
    const { items } = await getListingsPage({ page: 1, limit: 9 });
    grid.innerHTML = items.map(renderListingCard).join("");
  } catch (error) {
    grid.innerHTML = `<p class="text-red-400">Could not load listings.</p>`;
    console.error(error);
  }
  const loadMoreBtn = document.getElementById("load-more");
  const statusSelect = document.getElementById("filter-status");
  const tagInput = document.getElementById("filter-tag"); // valgfritt
  if (!grid) return;

  let page = 1;
  const limit = 9;
  let reachedEnd = false;

  // nåværende filter-state
  let activeFilter = undefined; // undefined = alle, true = aktive
  let tagFilter = ""; // valgfritt

  function uiSetLoading(on) {
    if (on) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<div class="bb-loader flex items-center justify-center gap-3 py-10">
          <span
            class="inline-block w-24 h-24 rounded-full border-red-500 border-red/30 border-t-red animate-spin"
          ></span>
          <span class="text-sm opacity-80">Test…</span>
        </div>`,
      );
      loadMoreBtn?.classList.add("hidden");
    } else {
      document.getElementById("loading-sentinel")?.remove();
    }
  }

  async function loadPage() {
    if (reachedEnd) return;
    uiSetLoading(true);
    try {
      const { items } = await getListingsPage({
        page,
        limit,
        seller: true,
        active: activeFilter,
        tag: tagFilter,
      });

      uiSetLoading(false);

      if (!Array.isArray(items) || items.length === 0) {
        reachedEnd = true;
        if (page === 1) {
          grid.innerHTML = `<p class="text-gray-300">No listings available.</p>`;
        }
        loadMoreBtn?.classList.add("hidden");
        return;
      }

      grid.insertAdjacentHTML(
        "beforeend",
        items.map(renderListingCard).join(""),
      );

      if (items.length < limit) {
        reachedEnd = true;
        loadMoreBtn?.classList.add("hidden");
      } else {
        loadMoreBtn?.classList.remove("hidden");
      }

      page += 1;
    } catch (err) {
      uiSetLoading(false);
      grid.insertAdjacentHTML(
        "beforeend",
        `<p class="col-span-full text-red-300">Loading failed: ${err.message}</p>`,
      );
    }
  }

  function resetAndLoad() {
    page = 1;
    reachedEnd = false;
    grid.innerHTML = "";
    loadMoreBtn?.classList.add("hidden");
    loadPage();
  }

  grid.innerHTML = "";
  resetAndLoad();

  loadMoreBtn?.addEventListener("click", loadPage);

  statusSelect?.addEventListener("change", () => {
    const v = statusSelect.value;
    activeFilter = v === "active" ? true : undefined;
    resetAndLoad();
  });

  tagInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      tagFilter = tagInput.value.trim();
      resetAndLoad();
    }
  });
}
