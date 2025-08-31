// js/ui/renderProfile.js
import { getProfile } from "../api/profiles/getProfile.js";
import { getName } from "../events/auth/storage.js";
import {
  renderProfileMyListings,
  initProfileMyListings,
} from "./profile/renderProfileMyListings.js";
import { renderProfileBio, initProfileBio } from "./renderProfileBio.js";
import { updateProfile } from "../api/profiles/updateProfile.js";
import { initImageModal } from "./imageModal.js";

function isValidHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}
function escapeHTML(s = "") {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

export async function renderProfile(
  container,
  username,
  opts = { listings: true, wins: true },
) {
  const paramsName = new URLSearchParams(window.location.search).get("name");
  const viewedName = username || paramsName;
  if (!viewedName) {
    container.innerHTML = `<div class="profile profile--error"><p>Missing username (?name=...)</p></div>`;
    return;
  }

  container.innerHTML = `<div class="profile profile--loading">Loading profile...</div>`;

  try {
    const data = await getProfile(viewedName, opts);
    const iAmOwner = getName?.() === data?.name;

    const avatarUrl = data?.avatar?.url || "";
    const avatarAlt = data?.avatar?.alt || `${data?.name || "User"} avatar`;
    const bannerUrl = data?.banner?.url || "";

    // HEADER
    const headerHTML = `
      <header class="profile__header mt-24">
        ${bannerUrl ? `<img class="profile__banner w-full h-48 object-cover" src="${bannerUrl}" alt="">` : ""}
        <div class="profile__top w-full flex items-center gap-4 mt-4">
          <img class="profile__avatar rounded-full border-4 bg-primary shadow-lg w-32 h-32 object-cover"
               src="${avatarUrl || "https://placehold.co/96"}" alt="${avatarAlt}">
          <div class="profile__meta">
            <h1 class="profile__name text-2xl font-bold">${data?.name ?? ""}</h1>
            <p class="profile__email">${data?.email ?? ""}</p>
            ${typeof data?.credits === "number" ? `<p class="profile__credits"><strong>Credits:</strong> ${data.credits}</p>` : ""}
            <p class="profile__counts text-sm text-white/80 flex gap-4">
              <span>Listings: ${data?._count?.listings ?? 0}</span>
              <span>Wins: ${data?._count?.wins ?? 0}</span>
            </p>
          </div>
        </div>
        ${data?.bio ? `<p class="profile__bio mt-4">${escapeHTML(data.bio)}</p>` : ""}
      </header>
    `;
    initImageModal(container, ".js-image-modal");

    const bioSectionHTML = iAmOwner ? renderProfileBio(data) : "";

    const ownerEditorHTML = !iAmOwner
      ? ""
      : `
      <section class="profile__section">
        <div class="grid gap-4 md:grid-cols-2">
          <form id="avatar-form" class="p-4 rounded shadow bg-primary/20">
            <h3 class="font-semibold mb-2">Update profile image (avatar)</h3>
            <input id="avatar-url" type="url" placeholder="Avatar URL" class="w-full border rounded p-2 mb-2" />
            <input id="avatar-alt" type="text" placeholder="Alt-text (optional)" class="w-full border rounded p-2 mb-2" />
            <button id="submit-avatar" class="bg-primary hover:bg-primaryBtnHover text-white font-semibold px-4 py-2 rounded">Save</button>
            <p id="avatar-msg" class="text-sm mt-2"></p>
          </form>

          <form id="banner-form" class="p-4 rounded shadow bg-primary/20">
            <h3 class="font-semibold mb-2">Update header image (banner)</h3>
            <input id="banner-url" type="url" placeholder="Banner URL" class="w-full border text-black rounded p-2 mb-2" />
            <input id="banner-alt" type="text" placeholder="Alt-text (optional)" class="w-full border rounded p-2 mb-2" />
            <button id="submit-banner" class="bg-primary hover:bg-primaryBtnHover text-white font-semibold px-4 py-2 rounded">Save</button>
            <p id="banner-msg" class="text-sm mt-2"></p>
          </form>
        </div>
      </section>
    `;

    // LISTINGS
    const listingsHTML = Array.isArray(data?.listings)
      ? `
      <section class="profile__section bg-primary/20 p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">Listings</h2>
        <ul class="card-grid">
          ${data.listings
            .map((l) => {
              const img = l?.media?.[0]?.url || "https://placehold.co/400x250";
              const alt = l?.media?.[0]?.alt || l?.title || "Listing image";
              return `
            <li class="card">
              <img class="card__img" src="${img}" alt="${alt}">
              <div class="card__body">
                <h3 class="card__title">${l?.title ?? "Untitled"}</h3>
                <p class="card__text">${l?.description ?? ""}</p>
                <p class="card__meta">
                  <span>Created: ${formatDate(l?.created)}</span>
                  <span>Ends: ${formatDate(l?.endsAt)}</span>
                </p>
              </div>
            </li>`;
            })
            .join("")}
        </ul>
      </section>
    `
      : "";

    // WINS
    const winsHTML = Array.isArray(data?.wins)
      ? `
      <section class="profile__section flex-grow">
        <h2 class="text-lg font-semibold mb-4">Wins</h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-primary/20 p-4 rounded-2xl">
          ${
            data.wins.length
              ? data.wins
                  .map((w) => {
                    const img =
                      w?.media?.[0]?.url || "https://placehold.co/400x250";
                    const alt =
                      w?.media?.[0]?.alt || w?.title || "Listing image";
                    return `
                  <li class="card rounded-xl overflow-hidden bg-black/10 shadow hover:shadow-lg transition">
                    <div class="w-full h-40 sm:h-48 overflow-hidden">
                      <img class="card__img w-full h-full object-cover" src="${img}" alt="${alt}">
                    </div>
                    <div class="card__body p-4">
                      <h3 class="card__title text-base font-semibold">${w?.title ?? "Without title"}</h3>
                      <p class="card__text text-sm text-white/80 mt-1">${w?.description ?? ""}</p>
                      <p class="card__meta text-xs text-white/60 mt-3 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Opprettet: ${formatDate(w?.created)}</span>
                        <span>Slutter: ${formatDate(w?.endsAt)}</span>
                      </p>
                    </div>
                  </li>`;
                  })
                  .join("")
              : `<li class="text-sm text-white/70">No wins yet.</li>`
          }
        </ul>
      </section>
    `
      : "";

    const myListingsHTML = iAmOwner ? renderProfileMyListings(data) : "";

    container.innerHTML = `
      <article class="profile space-y-8">
        ${headerHTML}
        ${bioSectionHTML}
        ${ownerEditorHTML}
        ${myListingsHTML}
        ${listingsHTML}
        ${winsHTML}
      </article>
    `;

    if (iAmOwner) {
      initProfileBio(container, data.name, () => {});

      // Avatar
      const avatarForm = container.querySelector("#avatar-form");
      avatarForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = container.querySelector("#avatar-url")?.value?.trim();
        const alt = container.querySelector("#avatar-alt")?.value?.trim();
        const msg = container.querySelector("#avatar-msg");
        msg.textContent = "";
        if (!url || !isValidHttpUrl(url)) {
          msg.textContent = "Invalid URL.";
          msg.className = "text-red-600 text-sm";
          return;
        }
        try {
          msg.textContent = "Saving…";
          msg.className = "text-gray-600 text-sm";
          const updated = await updateProfile(data.name, {
            avatar: { url, ...(alt ? { alt } : {}) },
          });
          const img = container.querySelector(".profile__avatar");
          if (img) {
            img.src = updated?.avatar?.url || url;
            img.alt = updated?.avatar?.alt || alt || img.alt;
          }
          msg.textContent = "Avatar updated ✔";
          msg.className = "text-green-700 text-sm";
        } catch (err) {
          msg.textContent = err.message || "Could not update avatar.";
          msg.className = "text-red-600 text-sm";
        }
      });

      // Banner
      const bannerForm = container.querySelector("#banner-form");
      bannerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = container.querySelector("#banner-url")?.value?.trim();
        const alt = container.querySelector("#banner-alt")?.value?.trim();
        const msg = container.querySelector("#banner-msg");
        msg.textContent = "";
        if (!url || !isValidHttpUrl(url)) {
          msg.textContent = "Invalid URL.";
          msg.className = "text-red-600 text-sm";
          return;
        }
        try {
          msg.textContent = "Saving…";
          msg.className = "text-gray-600 text-sm";
          const updated = await updateProfile(data.name, {
            banner: { url, ...(alt ? { alt } : {}) },
          });
          let banner = container.querySelector(".profile__banner");
          if (!banner) {
            const header = container.querySelector(".profile__header");
            header?.insertAdjacentHTML(
              "afterbegin",
              `<img class="profile__banner w-full h-48 object-cover" src="${updated?.banner?.url || url}" alt="">`,
            );
          } else {
            banner.src = updated?.banner?.url || url;
          }
          msg.textContent = "Header updated ✔";
          msg.className = "text-green-700 text-sm";
        } catch (err) {
          msg.textContent = err.message || "Could not update header";
          msg.className = "text-red-600 text-sm";
        }
      });

      //My listings
      initProfileMyListings(container, async () => {
        const fresh = await getProfile(data.name, {
          listings: true,
          wins: true,
        });
        renderProfile(container, fresh.name, { listings: true, wins: true });
      });
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="profile profile--error">
        <h2>Could not load «${viewedName}»</h2>
        <p>${err.message || "Unexpected error"}</p>
      </div>`;
  }
}
