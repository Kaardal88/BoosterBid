import { getListingsPage } from "../api/listings/getListingsPage.js";
import { renderListingCard } from "../ui/renderListingCard.js";

export async function homeIndexHandler() {
  const grid = document.getElementById("auction-container");
  const loadMoreBtn = document.getElementById("load-more");
  const seeLessBtn = document.getElementById("see-less");
  const statusSelect = document.getElementById("filter-status");
  const tagInput = document.getElementById("filter-tag");
  if (!grid) return;

  let page = 1;
  const limit = 12;
  let reachedEnd = false;
  let isLoading = false;

  let activeFilter = undefined;
  let tagFilter = "";

  function uiSetLoading(on) {
    if (on) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<div id="loading-sentinel" class="col-span-full flex items-center justify-center gap-3 py-10">
          <span
            class="inline-block w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin"
          ></span>
          <span class="text-sm text-white opacity-80">Loading…</span>
        </div>`,
      );
      loadMoreBtn?.classList.add("hidden");
      seeLessBtn?.classList.add("hidden");
    } else {
      document.getElementById("loading-sentinel")?.remove();
    }
  }

  function updateButtons() {
    loadMoreBtn?.classList.toggle("hidden", reachedEnd);
    seeLessBtn?.classList.toggle("hidden", page <= 2);
  }

  async function loadPage() {
    if (reachedEnd || isLoading) return;
    isLoading = true;
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
        updateButtons();
        return;
      }

      grid.insertAdjacentHTML(
        "beforeend",
        items.map(renderListingCard).join(""),
      );

      if (items.length < limit) reachedEnd = true;
      page += 1;
      updateButtons();
    } catch (err) {
      uiSetLoading(false);
      grid.insertAdjacentHTML(
        "beforeend",
        `<p class="col-span-full text-red-300">Loading failed: ${err.message}</p>`,
      );
      updateButtons();
    } finally {
      isLoading = false;
    }
  }

  function seeLess() {
    while (grid.children.length > limit) {
      grid.lastElementChild.remove();
    }
    page = 2;
    reachedEnd = false;
    updateButtons();
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetAndLoad() {
    page = 1;
    reachedEnd = false;
    grid.innerHTML = "";
    loadMoreBtn?.classList.add("hidden");
    seeLessBtn?.classList.add("hidden");
    loadPage();
  }

  resetAndLoad();

  loadMoreBtn?.addEventListener("click", loadPage);
  seeLessBtn?.addEventListener("click", seeLess);

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
