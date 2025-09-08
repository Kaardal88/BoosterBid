export function showSpinner(container, label = "Loading…") {
  if (!container) return;
  container.innerHTML = `
    <div class="bb-loader flex items-center justify-center gap-3 py-10">
      <span class="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
      <span class="text-sm opacity-80">${escapeHTML(label)}</span>
    </div>`;
}

export function hideLoader(container) {
  if (!container) return;
  // Du kan enten tømme, eller la kalleren fylle innholdet etterpå:
  container.innerHTML = "";
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
