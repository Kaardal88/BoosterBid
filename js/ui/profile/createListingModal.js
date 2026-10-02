import { createListing } from "../../api/listings/createListing.js";

let root;

function ensureModal() {
  if (root) return root;
  const div = document.createElement("div");
  div.innerHTML = `
    <div id="create-listing-modal" class="hidden fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/70" data-close="1"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4" data-close="1">
        <div class="relative bg-primaryBtnHover rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <button type="button" class="absolute top-2 right-2 p-2 rounded-full bg-black/80 text-white hover:bg-black" data-close="1" aria-label="Close">✕</button>
          <form id="create-listing-form" class="p-6 grid gap-3">
            <h3 class="text-lg font-semibold mb-2">Post new listing</h3>

            <input id="cl-title" class="border rounded p-2 text-black" type="text" placeholder="Title *" required>
            <textarea id="cl-desc" class="border rounded p-2 text-black" placeholder="Description"></textarea>
            <input id="cl-tags" class="border rounded p-2 text-black" type="text" placeholder="Tags (comma-separated)">
            <input id="cl-media-url" class="border rounded p-2 text-black" type="url" placeholder="Image URL (optional)">
            <input id="cl-media-alt" class="border rounded p-2 text-black" type="text" placeholder="Image alt-text (optional)">
            <label for="cl-ends" class="text-sm text-white">End date (local time)</label>
            <input id="cl-ends" class="border rounded text-black p-2" type="datetime-local" required>

            <div class="flex gap-2 mt-2">
              <button type="submit" class="bg-primary hover:bg-primary/80 text-white font-semibold rounded px-4 py-2">Publish</button>
              <button type="button" data-close="1" class="px-4 py-2 rounded border">Cancel</button>
            </div>
            <p id="cl-msg" class="text-sm mt-1"></p>
          </form>
        </div>
      </div>
    </div>
  `;
  root = div.firstElementChild;
  document.body.appendChild(root);

  root.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) closeCreateListingModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !root.classList.contains("hidden"))
      closeCreateListingModal();
  });

  return root;
}

export function openCreateListingModal(onCreated) {
  const modal = ensureModal();
  modal.classList.remove("hidden");
  document.documentElement.style.overflow = "hidden";

  const form = modal.querySelector("#create-listing-form");
  const msg = modal.querySelector("#cl-msg");
  msg.textContent = "";
  msg.className = "text-sm mt-1";

  form.onsubmit = async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = modal.querySelector("#cl-title").value.trim();
    const description = modal.querySelector("#cl-desc").value.trim();
    const tagsRaw = modal.querySelector("#cl-tags").value.trim();
    const mediaUrl = modal.querySelector("#cl-media-url").value.trim();
    const mediaAlt = modal.querySelector("#cl-media-alt").value.trim();
    const endsLocal = modal.querySelector("#cl-ends").value;

    if (!title) {
      msg.textContent = "Title is required.";
      msg.className = "text-red-300 text-sm";
      return;
    }
    if (!endsLocal) {
      msg.textContent = "End date is required.";
      msg.className = "text-red-300 text-sm";
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
      msg.className = "text-white/70 text-sm";
      await createListing(body);
      msg.textContent = "Listing published ✔";
      msg.className = "text-green-300 text-sm";
      form.reset();
      onCreated?.();

      setTimeout(closeCreateListingModal, 300);
    } catch (err) {
      msg.textContent = err.message || "Could not publish.";
      msg.className = "text-red-300 text-sm";
    }
  };
}

export function closeCreateListingModal() {
  if (!root) return;
  root.classList.add("hidden");
  document.documentElement.style.overflow = "";
}
