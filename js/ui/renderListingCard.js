export function renderListingCard(l) {
  const img = l?.media?.[0]?.url || "https://placehold.co/400x250";
  const alt = l?.media?.[0]?.alt || l?.title || "Listing image";
  return `
    <li class="bg-primary/20 hover:bg-primary/30 rounded shadow overflow-hidden">
      <a href="/details/index.html?id=${encodeURIComponent(l.id)}" class="block group focus:outline-none ">
        <img src="${img}" alt="${alt}" class="w-full h-40 object-cover group-hover:opacity-95 transition">
        <div class="p-3 space-y-2">
          <h1 class="font-semibold line-clamp-1 text-white text-lg">${escapeHTML(l?.title || "Untitled")}</h1>
          <p class=" text-white text-md line-clamp-2">${escapeHTML(l?.description || "")}</p>
          <p class="text-xs text-white">Ends: ${formatDate(l?.endsAt)}</p>
          <span class="inline-block mt-1 text-indigo-300 group-hover:underline">See listing →</span>
        </div>
      </a>
    </li>
  `;
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
