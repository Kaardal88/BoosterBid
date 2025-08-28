export function initBioToggle(container) {
  const button = container.querySelector("#toggle-bio");
  const form = container.querySelector("#bio-form");
  if (!button || !form) return;

  form.classList.add("hidden");
  button.setAttribute("aria-controls", "bio-form");
  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = form.classList.toggle("hidden");
    const innerText = isHidden ? "Edit bio" : "Cancel";
    button.textContent = innerText;
    button.setAttribute("aria-expanded", String(!isHidden));
    if (!isHidden) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}
