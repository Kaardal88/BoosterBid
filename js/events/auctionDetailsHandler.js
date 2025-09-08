import { getListingById } from "../api/listings/getListingById.js";
import { getCredits } from "../api/listings/getCredits.js";
import { renderBidBox } from "../ui/renderBidBox.js";
import { isLoggedIn } from "../utils/auth.js";
import { initImageModal } from "../ui/imageModal.js";

export async function auctionDetailsHandler() {
  const container = document.getElementById("details-container");
  if (!container) {
    console.error("#details-container not found on details page");
    return;
  }
  container.innerHTML = "<p>Loading details...</p>";

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    container.innerHTML = "<p>Missing listing ID (?id=...)</p>";
    return;
  }

  try {
    const data = await getListingById(id, { bids: true, seller: true });

    if (!data || typeof data !== "object") {
      container.innerHTML = `<p class="text-red-600">Invalid listing data</p>`;
      return;
    }

    const title = data.title || data.name || "Unknown";
    const description = data.description || "";
    const mediaArr = Array.isArray(data.media) ? data.media : [];
    const firstMedia = mediaArr[0] || {};
    const imgUrl = firstMedia.url || "https://placehold.co/800x400";
    const imgAlt = firstMedia.alt || title || "Listing image";
    const createdRaw = data.created ?? data.createdAt ?? null;
    const endsAtRaw = data.endsAt ?? data.endingAt ?? null;
    const created = formatDate(createdRaw);
    const endsAt = formatDate(endsAtRaw);
    const sellerName = data?.seller?.name || "Unknown";

    const bids = Array.isArray(data.bids) ? data.bids : [];
    const bidCount = bids.length;
    const isAuctionEnded = endsAtRaw ? new Date() > new Date(endsAtRaw) : false;

    container.innerHTML = `
      <article class="w-100 mx-auto   bg-primary/20 shadow p-6 rounded mb-64 mt-20 ">
        <img src="${imgUrl}"
          alt="${escapeHTML(imgAlt)}"
          class="w-full h-96 object-cover rounded mb-4 cursor-zoom-in js-image-modal"
          data-full="${imgUrl}">

        <h1 class="text-3xl font-bold mb-2">${escapeHTML(title)}</h1>
        <p class="text-white text-lg mb-4">${escapeHTML(description)}</p>
        <p class="text-lg text-white mb-2">Created: ${created}</p>
        <p class="text-lg text-white mb-2">Ends: ${endsAt}</p>
        <p class="text-lg text-white mb-4">Bid count: ${bidCount}</p>

        <h2 class="font-semibold mt-6 mb-2 text-2xl">Bids</h2>
        <ul id="bids-list" class="list-disc pl-5 text-lg mb-4">
          ${
            bidCount
              ? [...bids]
                  .sort((a, b) => b.amount - a.amount)
                  .map((b) => {
                    const bidderName = b.bidder?.name || "Anonymous";
                    return `<li>${b.amount} credits by <a class="inline-block mt-6 text-indigo-400 hover:text-indigo-200 underline"
           href="/profile/index.html?name=${encodeURIComponent(bidderName)}"><strong>${escapeHTML(bidderName)}</strong></a>
          </li>`;
                  })
                  .join("")
              : "<li>No bids yet</li>"
          }
        </ul>

        <div id="bid-container" class="mt-4">
          ${
            isAuctionEnded
              ? `<p class="text-red-600">This auction has ended.</p>`
              : `<div class="p-4 bg-gray-50 border rounded">Loading bids…</div>`
          }
        </div>

        <a class="inline-block mt-6 text-lg bg-primary p-4 rounded-md font-semibold text-white hover:text-indigo-200 underline"
           href="/profile/index.html?name=${encodeURIComponent(sellerName)}">
          Seller: ${escapeHTML(sellerName)}
        </a>
      </article>
    `;

    initImageModal(container, ".js-image-modal");

    if (!isAuctionEnded) {
      const bidContainer = document.getElementById("bid-container");

      let userCredits = null;
      if (isLoggedIn()) {
        try {
          const creditsResponse = await getCredits();
          userCredits = creditsResponse?.data?.credits ?? null;
        } catch (e) {
          console.warn("Could not get user credits:", e);
        }
      }

      renderBidBox(bidContainer, data, userCredits);
    }
  } catch (err) {
    const msg = String(err.message || err);
    const human = msg.includes("(404)")
      ? "Did not find listing. Try again."
      : "Could not load listing. Try again.";
    container.innerHTML = `<p class="text-red-600 text-center">${human}</p><pre class="text-sm text-gray-200 text-center mx-auto whitespace-pre-wrap break-words max-w-max bg-gray-800 p-2 rounded">
  ${msg}
</pre>`;
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
