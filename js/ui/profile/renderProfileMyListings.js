import { deleteListing } from "../../api/listings/deleteListing.js";
import { getName } from "../../events/auth/storage.js";

export function renderProfileMyListings(data) {
  const myListings = Array.isArray(data?.listings) ? data.listings : [];
  const iAmOwner = getName?.() === data?.name;
  const heading = iAmOwner
    ? "My listings"
    : `${escapeHTML(data?.name || "User")}'s listings`;

  return `
    <section class="profile__section">
      <h2 class="text-xl font-semibold mb-2">${heading}</h2>

      ${
        myListings.length
          ? `
      <ul id="my-listings" class="divide-y divide-white/10 bg-primary/20 rounded-2xl overflow-hidden">
        ${myListings
          .map((l) => {
            const img = l?.media?.[0]?.url || "https://placehold.co/160";
            const alt = l?.media?.[0]?.alt || l?.title || "Listing";
            const detailsUrl = `/details/index.html?id=${encodeURIComponent(l.id)}`;
            const ended = isEnded(l?.endsAt);
            return `
            <li class="flex items-center gap-4 p-3 hover:bg-white/5 transition">
              <a href="${detailsUrl}" class="flex items-center gap-4 flex-1 min-w-0 group rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <img src="${img}" alt="${escapeAttr(alt)}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0">
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-white line-clamp-1 group-hover:underline">${escapeHTML(l?.title || "Without title")}</h3>
                  <p class="text-sm text-white/70 line-clamp-1">${escapeHTML(l?.description || "")}</p>
                  <p class="text-xs text-white/60 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span class="rounded-full px-2 py-0.5 ${ended ? "bg-white/10 text-white/70" : "bg-brand/20 text-brand"}">${ended ? "Ended" : "Active"}</span>
                    <span>Ends: ${formatDate(l?.endsAt)}</span>
                  </p>
                </div>
              </a>
              ${
                iAmOwner && !ended
                  ? `
              <div class="flex flex-col sm:flex-row gap-2 shrink-0">
                <button type="button"
                  class="btn-edit hover:bg-primary text-white rounded px-3 py-1"
                  data-id="${l.id}"
                  data-title="${escapeAttr(l.title || "")}"
                  data-description="${escapeAttr(l.description || "")}"
                  data-media-url="${escapeAttr(l?.media?.[0]?.url || "")}"
                  data-media-alt="${escapeAttr(l?.media?.[0]?.alt || "")}"
                  data-ends-at="${escapeAttr(l.endsAt || "")}"
                  data-tags="${escapeAttr(Array.isArray(l.tags) ? l.tags.join(", ") : "")}"
                >Edit</button>
                <button type="button" class="btn-del hover:bg-red-500 text-white rounded px-3 py-1" data-id="${l.id}">Delete</button>
              </div>`
                  : ""
              }
            </li>
          `;
          })
          .join("")}
      </ul>`
          : `<p class="text-sm text-white/70 bg-primary/20 p-4 rounded-2xl">No listings yet.</p>`
      }
    </section>
  `;
}

export function initProfileMyListings(container, onAfterChange) {
  container.querySelectorAll(".btn-del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm("Delete listing?")) return;
      try {
        btn.disabled = true;
        btn.textContent = "Deleting…";
        await deleteListing(id);
        onAfterChange?.();
      } catch (err) {
        alert(err.message || "Could not delete.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Delete";
      }
    });
  });

  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      if (!id) return;

      const listingPrefill = {
        id,
        title: btn.dataset.title || "",
        description: btn.dataset.description || "",
        mediaUrl: btn.dataset.mediaUrl || "",
        mediaAlt: btn.dataset.mediaAlt || "",
        endsAt: btn.dataset.endsAt || "",
        tags: btn.dataset.tags || "",
      };

      const { openEditListingModal } = await import("./editListingModal.js");
      openEditListingModal(listingPrefill, onAfterChange);
    });
  });
}
function isEnded(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d.getTime() <= Date.now();
}
function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}
function escapeHTML(str = "") {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}
function escapeAttr(s = "") {
  return String(s).replace(/"/g, "&quot;");
}
