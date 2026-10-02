import { updateProfile } from "../../api/profiles/updateProfile.js";

let root;

function ensureModal() {
  if (root) return root;
  const div = document.createElement("div");
  div.innerHTML = `
    <div id="edit-profile-modal" class="hidden fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/70" data-close="1"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4" data-close="1">
        <div class="relative bg-primaryBtnHover rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <button type="button" class="absolute top-2 right-2 p-2 rounded-full bg-black/80 text-white hover:bg-black" data-close="1" aria-label="Close">✕</button>
          <form id="edit-profile-form" class="p-6 grid gap-3">
            <h3 class="text-lg font-semibold mb-2">Edit profile</h3>

            <label for="ep-bio" class="text-sm text-white">Bio</label>
            <textarea id="ep-bio" class="border text-black rounded p-2 min-h-28" maxlength="500" placeholder="Write your bio (Max 500 characters)"></textarea>
            <span id="ep-bio-count" class="text-xs text-white/70">0/500</span>

            <label for="ep-avatar-url" class="text-sm text-white mt-2">Profile image (avatar)</label>
            <input id="ep-avatar-url" class="border rounded p-2 text-black" type="url" placeholder="Avatar URL">
            <input id="ep-avatar-alt" class="border rounded p-2 text-black" type="text" placeholder="Alt-text (optional)">

            <label for="ep-banner-url" class="text-sm text-white mt-2">Header image (banner)</label>
            <input id="ep-banner-url" class="border rounded p-2 text-black" type="url" placeholder="Banner URL">
            <input id="ep-banner-alt" class="border rounded p-2 text-black" type="text" placeholder="Alt-text (optional)">

            <div class="flex gap-2 mt-2">
              <button type="submit" class="bg-primary hover:bg-primary/80 text-white font-semibold px-4 py-2 rounded">Save</button>
              <button type="button" data-close="1" class="px-4 py-2 rounded border">Cancel</button>
            </div>
            <p id="ep-msg" class="text-sm mt-1"></p>
          </form>
        </div>
      </div>
    </div>
  `;
  root = div.firstElementChild;
  document.body.appendChild(root);

  root.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) closeEditProfileModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !root.classList.contains("hidden"))
      closeEditProfileModal();
  });

  return root;
}

function isValidHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function openEditProfileModal(profile, onSaved) {
  const modal = ensureModal();
  modal.classList.remove("hidden");
  document.documentElement.style.overflow = "hidden";

  const form = modal.querySelector("#edit-profile-form");
  const msg = modal.querySelector("#ep-msg");
  const bio = modal.querySelector("#ep-bio");
  const count = modal.querySelector("#ep-bio-count");

  const initial = {
    bio: profile?.bio ?? "",
    avatarUrl: profile?.avatar?.url ?? "",
    avatarAlt: profile?.avatar?.alt ?? "",
    bannerUrl: profile?.banner?.url ?? "",
    bannerAlt: profile?.banner?.alt ?? "",
  };

  msg.textContent = "";
  msg.className = "text-sm mt-1";
  bio.value = initial.bio;
  count.textContent = `${initial.bio.length}/500`;
  modal.querySelector("#ep-avatar-url").value = initial.avatarUrl;
  modal.querySelector("#ep-avatar-alt").value = initial.avatarAlt;
  modal.querySelector("#ep-banner-url").value = initial.bannerUrl;
  modal.querySelector("#ep-banner-alt").value = initial.bannerAlt;

  bio.oninput = () => {
    count.textContent = `${bio.value.length}/500`;
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const bioValue = bio.value.trim();
    const avatarUrl = modal.querySelector("#ep-avatar-url").value.trim();
    const avatarAlt = modal.querySelector("#ep-avatar-alt").value.trim();
    const bannerUrl = modal.querySelector("#ep-banner-url").value.trim();
    const bannerAlt = modal.querySelector("#ep-banner-alt").value.trim();

    const patch = {};
    if (bioValue !== initial.bio) patch.bio = bioValue;

    if (avatarUrl !== initial.avatarUrl || avatarAlt !== initial.avatarAlt) {
      if (!isValidHttpUrl(avatarUrl)) {
        msg.textContent = "Invalid avatar URL.";
        msg.className = "text-red-300 text-sm";
        return;
      }
      patch.avatar = {
        url: avatarUrl,
        ...(avatarAlt ? { alt: avatarAlt } : {}),
      };
    }

    if (bannerUrl !== initial.bannerUrl || bannerAlt !== initial.bannerAlt) {
      if (!isValidHttpUrl(bannerUrl)) {
        msg.textContent = "Invalid banner URL.";
        msg.className = "text-red-300 text-sm";
        return;
      }
      patch.banner = {
        url: bannerUrl,
        ...(bannerAlt ? { alt: bannerAlt } : {}),
      };
    }

    if (!Object.keys(patch).length) {
      msg.textContent = "No changes to save.";
      msg.className = "text-white/70 text-sm";
      return;
    }

    try {
      msg.textContent = "Saving…";
      msg.className = "text-white/70 text-sm";
      const res = await updateProfile(profile.name, patch);
      const updated = res?.data ?? res;
      msg.textContent = "Profile updated ✔";
      msg.className = "text-green-300 text-sm";
      onSaved?.(updated);

      setTimeout(closeEditProfileModal, 300);
    } catch (err) {
      msg.textContent = err.message || "Could not update profile.";
      msg.className = "text-red-300 text-sm";
    }
  };
}

export function closeEditProfileModal() {
  if (!root) return;
  root.classList.add("hidden");
  document.documentElement.style.overflow = "";
}
