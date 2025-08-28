//Events
import { loginHandler } from "./events/loginHandler.js";
import { registerHandler } from "./events/registerHandler.js";
import { creditsHandler } from "./events/creditsHandler.js";

import { logoutListener } from "./events/logoutHandler.js";
import { auctionDetailsHandler } from "./events/auctionDetailsHandler.js";
import { searchIndexHandler } from "./events/searchIndexHandler.js";
import { homeIndexHandler } from "./events/homeIndexHandler.js";

//UI
import { renderProfile } from "./ui/renderProfile.js";
import { initHeaderProfile } from "./ui/headerProfile.js";

//Storage
import { getName } from "./events/auth/storage.js";

document.addEventListener("DOMContentLoaded", () => {
  router();
  initHeaderProfile();
});
function setFavicon(path = "/images/BB_logo.png") {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = path;
  document.getElementsByTagName("head")[0].appendChild(link);
}
function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/"))
    return pathname.slice(0, -1);
  return pathname;
}
export function router() {
  const pathname = normalizePath(window.location.pathname);
  switch (pathname) {
    case "":
    case "/":
    case "/index.html": {
      homeIndexHandler();
      searchIndexHandler();
      break;
    }
    case "/login":
    case "/login/index.html": {
      loginHandler();
      break;
    }
    case "/register":
    case "/register/index.html": {
      registerHandler();
      break;
    }
    case "/details":
    case "/details/index.html": {
      auctionDetailsHandler();
      initHeaderProfile();
      break;
    }
    case "/profile/":
    case "/profile/index.html":
      {
        initHeaderProfile();
        creditsHandler();
        logoutListener();
        const profileContainer = document.getElementById("profile-container");
        if (profileContainer) {
          const urlName = new URLSearchParams(window.location.search).get(
            "name",
          );
          const fallbackName = getName("username");
          renderProfile(profileContainer, urlName || fallbackName, {
            listings: true,
            wins: true,
          });
        } else {
          console.error("Container not found for renderProfile");
        }
      }
      break;
    case "/user":
    case "/user/index.html": {
      break;
    }
    default: {
      console.warn("No route matched for:", pathname);
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  router();
  setFavicon();
});
