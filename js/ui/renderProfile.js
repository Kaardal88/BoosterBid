import { getProfile } from "../api/profiles/getProfile.js";
import { getName } from "../events/auth/storage.js";
import {
  renderProfileMyListings,
  initProfileMyListings,
} from "./profile/renderProfileMyListings.js";
import {
  renderProfileActions,
  initProfileActions,
} from "./profile/renderProfileActions.js";
import { initImageModal } from "./imageModal.js";

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

  container.innerHTML = `<div class="profile profile--loading text-x" >Loading profile...</div>`;

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

    const actionsHTML = iAmOwner ? renderProfileActions() : "";

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

    const myListingsHTML = renderProfileMyListings(data);

    container.innerHTML = `
      <article class="profile space-y-8">
        ${headerHTML}
        ${actionsHTML}
        ${myListingsHTML}
        ${winsHTML}
      </article>
    `;

    if (iAmOwner) {
      const reload = () =>
        renderProfile(container, data.name, { listings: true, wins: true });

      initProfileActions(container, data, {
        onProfileSaved: (updated) => {
          Object.assign(data, {
            bio: updated?.bio ?? data.bio,
            avatar: updated?.avatar ?? data.avatar,
            banner: updated?.banner ?? data.banner,
          });

          const avatarImg = container.querySelector(".profile__avatar");
          if (avatarImg && data.avatar?.url) {
            avatarImg.src = data.avatar.url;
            avatarImg.alt = data.avatar.alt || avatarImg.alt;
          }
          const headerAvatar = document.getElementById("header-avatar");
          if (headerAvatar && data.avatar?.url) {
            headerAvatar.src = data.avatar.url;
          }

          const header = container.querySelector(".profile__header");
          const banner = container.querySelector(".profile__banner");
          if (data.banner?.url) {
            if (banner) {
              banner.src = data.banner.url;
            } else {
              header?.insertAdjacentHTML(
                "afterbegin",
                `<img class="profile__banner w-full h-48 object-cover" src="${data.banner.url}" alt="">`,
              );
            }
          }

          let bioP = container.querySelector(".profile__bio");
          if (data.bio) {
            if (!bioP) {
              header?.insertAdjacentHTML(
                "beforeend",
                `<p class="profile__bio mt-4"></p>`,
              );
              bioP = container.querySelector(".profile__bio");
            }
            bioP.textContent = data.bio;
          } else {
            bioP?.remove();
          }
        },
        onListingCreated: reload,
      });

      //My listings
      initProfileMyListings(container, reload);
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
