import { updateListing } from "../../api/listings/updateListing.js";

let root;

function ensureModal() {
  if (root) return root;
  const div = document.createElement("div");
  div.innerHTML = `
    <div id="edit-listing-modal" class="hidden fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/70" data-close="1"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="relative bg-primaryBtnHover rounded-lg shadow-xl w-full max-w-2xl">
          <button class="absolute top-2 right-2 p-2 rounded-full bg-black/80 text-white hover:bg-black" data-close="1" aria-label="Close">✕</button>
          <form id="edit-listing-form" class="p-6 grid gap-3">
            <h3 class="text-lg font-semibold mb-2">Edit listing</h3>

            <input id="el-title" class="border rounded p-2 text-black" type="text" placeholder="Title *" required>
            <textarea id="el-desc" class="border rounded p-2 text-black" placeholder="Description"></textarea>

            <input id="el-tags" class="border rounded p-2 text-black" type="text" placeholder="Tags (comma, optional)">

            <input id="el-media-url" class="border rounded p-2 text-black" type="url" placeholder="Image URL (optional)">
            <input id="el-media-alt" class="border rounded p-2 text-black" type="text" placeholder="Image alt (optional)">

            <label class="text-sm text-white">End date (local time)</label>
            <input id="el-ends" class="border rounded p-2 text-black" type="datetime-local">

            <div class="flex gap-2 mt-2">
              <button type="submit" class=" text-white px-4 py-2 rounded">Save</button>
              <button type="button" data-close="1" class="px-4 py-2 rounded border">Cancel</button>
            </div>
            <p id="el-msg" class="text-sm mt-1"></p>
          </form>
        </div>
      </div>
    </div>
  `;
  root = div.firstElementChild;
  document.body.appendChild(root);

  root.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) closeEditListingModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !root.classList.contains("hidden"))
      closeEditListingModal();
  });

  return root;
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function openEditListingModal(listing, onSaved) {
  const modal = ensureModal();
  modal.classList.remove("hidden");
  document.documentElement.style.overflow = "hidden";

  const form = modal.querySelector("#edit-listing-form");
  const msg = modal.querySelector("#el-msg");

  modal.dataset.id = listing.id;
  modal.querySelector("#el-title").value = listing.title || "";
  modal.querySelector("#el-desc").value = listing.description || "";
  modal.querySelector("#el-tags").value = listing.tags || "";
  modal.querySelector("#el-media-url").value = listing.mediaUrl || "";
  modal.querySelector("#el-media-alt").value = listing.mediaAlt || "";
  modal.querySelector("#el-ends").value = toLocalInputValue(listing.endsAt);

  form.onsubmit = async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "text-sm text-gray-600";

    const id = modal.dataset.id;
    const title = modal.querySelector("#el-title").value.trim();
    const description = modal.querySelector("#el-desc").value.trim();
    const tagsInput = modal.querySelector("#el-tags").value.trim();
    const mediaUrl = modal.querySelector("#el-media-url").value.trim();
    const mediaAlt = modal.querySelector("#el-media-alt").value.trim();
    const endsLocal = modal.querySelector("#el-ends").value;

    if (!title) {
      msg.textContent = "Title is required";
      msg.className = "text-red-600 text-sm";
      return;
    }

    const body = { title };
    if (description) body.description = description;
    if (tagsInput)
      body.tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    if (mediaUrl)
      body.media = [{ url: mediaUrl, ...(mediaAlt ? { alt: mediaAlt } : {}) }];
    if (endsLocal) body.endsAt = new Date(endsLocal).toISOString();

    try {
      msg.textContent = "Saving…";
      await updateListing(id, body);
      msg.textContent = "Saved ✔";
      msg.className = "text-green-700 text-sm";
      onSaved?.();

      setTimeout(closeEditListingModal, 300);
    } catch (err) {
      msg.textContent = err.message || "Could not update.";
      msg.className = "text-red-600 text-sm";
    }
  };
}

export function closeEditListingModal() {
  if (!root) return;
  root.classList.add("hidden");
  document.documentElement.style.overflow = "";
}
