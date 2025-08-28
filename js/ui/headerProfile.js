// js/ui/headerProfile.js
import { getName, getToken } from "../events/auth/storage.js";
import { getProfile } from "../api/profiles/getProfile.js";

export async function initHeaderProfile() {
  const username = getName();
  const token = getToken();
  const avatarImg = document.getElementById("header-avatar");
  const link = document.getElementById("my-profile-link");

  if (!username || !token) {
    console.debug("[HeaderProfile] Ikke logget inn, hopper over avatar.");
    return;
  }

  try {
    // henter min egen profil
    const profile = await getProfile(username);

    if (avatarImg) {
      avatarImg.src = profile?.avatar?.url || "https://placehold.co/32";
      avatarImg.alt = `${profile?.name || "User"} avatar`;
    }

    if (link) {
      link.href = `/profile/index.html?name=${encodeURIComponent(username)}`;
    }
  } catch (err) {
    console.error("[HeaderProfile] Klarte ikke hente profil:", err);
    if (avatarImg) {
      avatarImg.src = "https://placehold.co/32";
    }
  }
}
