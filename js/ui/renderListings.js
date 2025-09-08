export async function renderListings(container, posts) {
  if (!container || !(container instanceof HTMLElement)) {
    console.error("Invalid container provided to renderListings");
    return;
  }
  if (!Array.isArray(posts)) {
    console.error("Posts is not an array:", posts);
    container.innerHTML = "<p>No listings available.</p>";
    return;
  }

  container.innerHTML =
    "<p class='text-white font-bold text-3xl'>Loading listings...</p>";

  container.innerHTML = "";
  for (const listing of posts) {
    const { title, id, description, media, created, endsAt, bids } = listing;

    const imageUrl =
      Array.isArray(media) && media.length > 0 ? media[0].url : "";
    const imageAlt =
      Array.isArray(media) && media.length > 0
        ? media[0].alt || `Image for ${title}`
        : `Image for ${title}`;
    const postUrl = `/details/index.html?id=${id}`;

    const formattedDate = created
      ? new Date(created).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown date";
    const endDate = endsAt
      ? new Date(endsAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Unknown end date";
    const isAuctionEnded = endsAt && new Date(endsAt) < new Date();

    const bidsListHtml = (() => {
      if (!Array.isArray(bids) || bids.length === 0) {
        return "<li>No bids yet</li>";
      }

      // Kopier og sorter synkende på amount
      const sorted = [...bids].sort((a, b) => b.amount - a.amount);
      const top = sorted[0];

      const bidderName = top.bidder?.name || "Anonymous";
      return `<li>Highest bid: ${top.amount} credits by ${bidderName}</li>`;
    })();

    const postElement = document.createElement("div");
    postElement.className =
      "bg-primary/20 hover:bg-primary  p-4 rounded-lg shadow";

    postElement.innerHTML = `
      <a href="${postUrl}" class="block" aria-label="View details for ${title}">
        <div class="overflow-x-hidden max-w-full ">
          <h1 class="text-white text-2xl font-semibold ">${title}</h1>
          <p class="text-white  text-lg">${description || "No description available"}</p>
          <p class="text-white text-md font-light italic ">Published: ${formattedDate}</p>
          <p class="text-white text-md ">Ends: ${endDate}</p>
          ${
            imageUrl
              ? `<img class="w-full h-48 object-cover rounded overflow-hidden" src="${imageUrl}" alt="${imageAlt}" loading="lazy">`
              : ""
          }
        </div>

      <div class="mt-4">
        <h3 class="text-lg font-semibold text-white ">Current Bids</h3>
       <ul id="bids-list-${id}" class="list-disc pl-5 text-white text-md">
  ${bidsListHtml}
</ul>
<p class="text-white text-sm"> ${isAuctionEnded ? `<p class="text-red-600">This auction has ended.</p>` : ""}</p></a>`;

    container.appendChild(postElement);

    if (!isAuctionEnded) {
      const bidsList = postElement.querySelector(`#bids-list-${id}`);
      if (bidsList) {
        bidsList.innerHTML = bidsListHtml;
      }
    }
  }
}
