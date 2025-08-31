import { createListing } from "../../api/listings/createListing.js";
import { updateListing } from "../../api/listings/updateListing.js";
import { deleteListing } from "../../api/listings/deleteListing.js";
import { getName } from "../../events/auth/storage.js";

export function renderProfileMyListings(data) {
  const myListings = Array.isArray(data?.listings) ? data.listings : [];
  const iAmOwner = getName?.() === data?.name;

  return `
    <section class="profile__section">
      <h2 class="text-xl font-semibold mb-2">Post new listing</h2>
      <form id="create-listing-form" class="bg-primary/20 p-4 rounded shadow grid gap-3">
        <input id="cl-title" class="border rounded p-2 text-black" type="text" placeholder="Title *" required>
        <textarea id="cl-desc" class="border rounded p-2 text-black" placeholder="Description"></textarea>
        <input id="cl-tags" class="border rounded p-2 text-black" type="text" placeholder="Tags (comma-separated)">
        <input id="cl-media-url" class="border rounded p-2 text-black" type="url" placeholder="Image URL (optional)">
        <input id="cl-media-alt" class="border rounded p-2 text-black" type="text" placeholder="Image alt-text (optional)">
        <label class="text-sm text-white-600">End date (local time)</label>
        <input id="cl-ends" class="border rounded text-black p-2" type="datetime-local" required>
        <button class="bg-primary hover:bg-primaryBtnHover text-white font-semibold rounded px-4 py-2">Publish</button>
        <p id="cl-msg" class="text-sm mt-1"></p>
      </form>

      <h2 class="text-xl font-semibold mt-8 mb-2">My listings</h2>

      <ul id="my-listings" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${myListings
          .map((l) => {
            const img = l?.media?.[0]?.url || "https://placehold.co/400x250";
            const alt = l?.media?.[0]?.alt || l?.title || "Listing";
            const detailsUrl = `/details/index.html?id=${encodeURIComponent(l.id)}`;
            return `
            <li class="bg-primary/20 rounded shadow overflow-hidden">
              <a href="${detailsUrl}" class="block group focus:outline-none focus:ring-2 focus:ring-blue-500">
                <img src="${img}" alt="${alt}" class="w-full h-40 object-cover group-hover:opacity-95 transition">
                <div class="p-3 space-y-2">
                  <h3 class="font-semibold text-white line-clamp-1">${escapeHTML(l?.title || "Without title")}</h3>
                  <p class="text-sm text-white line-clamp-2">${escapeHTML(l?.description || "")}</p>
                </div>
              </a>
              ${
                iAmOwner
                  ? `
                <div class="p-3 flex  justify-between border-t">
                  <button class="btn-edit  hover:bg-primary text-white rounded px-3 py-1" data-id="${l.id}">Edit</button>
                  <button class="btn-del  hover:bg-red-500 text-white rounded px-3 py-1" data-id="${l.id}">Delete</button>
                </div>`
                  : ""
              }
            </li>`;
          })
          .join("")}
      </ul>
    </section>
  `;
}

export function initProfileMyListings(container, onAfterChange) {
  const form = container.querySelector("#create-listing-form");
  const msg = container.querySelector("#cl-msg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = container.querySelector("#cl-title").value.trim();
    const description = container.querySelector("#cl-desc").value.trim();
    const tagsRaw = container.querySelector("#cl-tags").value.trim();
    const mediaUrl = container.querySelector("#cl-media-url").value.trim();
    const mediaAlt = container.querySelector("#cl-media-alt").value.trim();
    const endsLocal = container.querySelector("#cl-ends").value;

    if (!title) {
      msg.textContent = "Title is required.";
      msg.className = "text-red-600 text-sm";
      return;
    }
    if (!endsLocal) {
      msg.textContent = "End date is required.";
      msg.className = "text-red-600 text-sm";
      return;
    }

    const endsAt = new Date(endsLocal).toISOString();
    const body = {
      title,
      ...(description ? { description } : {}),
      ...(tagsRaw
        ? {
            tags: tagsRaw
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          }
        : {}),
      ...(mediaUrl
        ? { media: [{ url: mediaUrl, ...(mediaAlt ? { alt: mediaAlt } : {}) }] }
        : {}),
      endsAt,
    };

    try {
      msg.textContent = "Publishing…";
      msg.className = "text-gray-600 text-sm";
      await createListing(body);
      msg.textContent = "Listing published ✔";
      msg.className = "text-green-700 text-sm";
      form.reset();
      onAfterChange?.();
    } catch (err) {
      msg.textContent = err.message || "Could not publish.";
      msg.className = "text-red-600 text-sm";
    }
  });

  // Slett
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

  // Rediger (enkel prompt-basert for nå; kan byttes til modal senere)
  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!id) return;
      const title = prompt("New title (leave empty to keep)");
      const description = prompt("New description (leave empty to keep)");
      const mediaUrl = prompt("New media URL (leave empty to keep)");
      const ends = prompt(
        "New end date (YYYY-MM-DDTHH:mm, leave empty to keep)",
      );

      const body = {};
      if (title) body.title = title.trim();
      if (description) body.description = description.trim();
      if (mediaUrl) body.media = [{ url: mediaUrl.trim() }];
      if (ends) body.endsAt = new Date(ends).toISOString();

      if (Object.keys(body).length === 0) return;

      try {
        btn.disabled = true;
        btn.textContent = "Saving…";
        await updateListing(id, body);
        onAfterChange?.();
      } catch (err) {
        alert(err.message || "Could not update.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Edit";
      }
    });
  });
}

function escapeHTML(str = "") {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
