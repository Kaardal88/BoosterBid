// js/ui/modal/imageModal.js
let modalEl, imgEl, captionEl;

function ensureModalInDOM() {
  if (modalEl) return;
  const tpl = document.createElement("div");
  tpl.innerHTML = `
    <div id="image-modal" class="hidden fixed inset-0 z-[100]">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/70" data-close="1"></div>

      <!-- dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          <button type="button" aria-label="Close"
            class="absolute top-2 right-2 rounded-full p-2 bg-black/80 text-white hover:bg-black"
            data-close="1">✕</button>

          <div class="p-4">
            <img id="image-modal-img" src="" alt="" class="w-full h-auto max-h-[80vh] object-contain" />
            <p id="image-modal-caption" class="mt-2 text-sm text-gray-600"></p>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(tpl.firstElementChild);

  modalEl = document.getElementById("image-modal");
  imgEl = document.getElementById("image-modal-img");
  captionEl = document.getElementById("image-modal-caption");

  modalEl.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) closeImageModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalEl.classList.contains("hidden")) {
      closeImageModal();
    }
  });
}

function preventScroll(lock) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

export function openImageModal(src, alt = "", caption = "") {
  ensureModalInDOM();
  imgEl.src = src;
  imgEl.alt = alt || "";
  captionEl.textContent = caption || "";
  modalEl.classList.remove("hidden");
  preventScroll(true);
}

export function closeImageModal() {
  if (!modalEl) return;
  modalEl.classList.add("hidden");

  imgEl.src = "";
  preventScroll(false);
}

export function initImageModal(container, selector = ".js-image-modal") {
  if (!container) return;
  container.querySelectorAll(selector).forEach((node) => {
    node.addEventListener("click", (e) => {
      e.preventDefault();
      const src = node.getAttribute("data-full") || node.getAttribute("src");
      const alt = node.getAttribute("alt") || "";
      const caption = node.getAttribute("data-caption") || alt || "";
      if (src) openImageModal(src, alt, caption);
    });
  });
}
