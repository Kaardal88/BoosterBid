// js/events/profileHandler.js

import { renderProfile } from "../ui/renderProfile.js";

export async function profileHandler() {
  const mount = document.getElementById("profile-container");
  if (!mount) return;
  try {
    renderProfile(mount);
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<p class="error">Kunne ikke laste profilen.</p>`;
  }
}
