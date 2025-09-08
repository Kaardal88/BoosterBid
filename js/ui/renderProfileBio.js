import { updateBio } from "../api/profiles/updateBio.js";
import { initBioToggle } from "../utils/toggleBio.js";

export function renderProfileBio(data) {
  const current = data?.bio ?? "";
  return `
    <section class="profile__section w-full" id="bio-section">
      <button id="toggle-bio"
              class="bg-primary hover:bg-primaryBtnHover text-white rounded px-4 py-2"
              aria-expanded="false">
        Edit bio
      </button>
<form id="bio-form" class="hidden bg-primary/20 p-4 rounded shadow  gap-3 w-full">
        <textarea id="bio-text"
                  class="border text-black rounded p-2 min-h-28 w-full"
                  maxlength="500"
                  placeholder="Write your bio (Max 500 characters)">${escapeHTML(current)}</textarea>
        <div class="flex items-center gap-3">
          <button class="bg-primary hover:bg-primaryBtnHover text-white rounded px-4 py-2">
            Save
          </button>
          <span id="bio-count" class="text-xs text-gray-700">${current.length}/500</span>
        </div>
        <p id="bio-msg" class="text-sm mt-1"></p>
      </form>
    </section>
  `;
}
export function initProfileBio(container, username, onSaved) {
  const section = container.querySelector("#bio-section");
  if (!section) return;
  initBioToggle(section);
  const form = section.querySelector("#bio-form");
  const textarea = section.querySelector("#bio-text");
  const count = section.querySelector("#bio-count");
  const msg = section.querySelector("#bio-msg");
  if (!form || !textarea) return;
  textarea.addEventListener("input", () => {
    if (count) count.textContent = `${textarea.value.length}/500`;
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = textarea.value.trim();
    msg.textContent = "";
    try {
      msg.textContent = "Saving…";
      msg.className = "text-gray-700 text-sm";
      const updated = await updateBio(username, { bio: value });
      let bioP = container.querySelector(".profile__bio");
      if (!bioP) {
        const header = container.querySelector(".profile__header");
        header?.insertAdjacentHTML(
          "beforeend",
          `<p class="profile__bio mt-4"></p>`,
        );
        bioP = container.querySelector(".profile__bio");
      }
      if (bioP) bioP.textContent = updated?.bio ?? value;
      msg.textContent = "Bio updated ✔";
      msg.className = "text-green-700 text-sm";
      onSaved?.(updated);
    } catch (err) {
      msg.textContent = err.message || "Could not update bio";
      msg.className = "text-red-600 text-sm";
    }
  });
}
function escapeHTML(s = "") {
  return s.replace(
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
