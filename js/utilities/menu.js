// /js/utilities/menu.js
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);

  const btn = qs("#hamburger");
  const menu = qs("#nav-menu");

  if (!btn || !menu) return; // IDs må finnes

  // --- AUTH STATE -----------------------------------------------------------
  // Bruk din egen auth hvis tilgjengelig, ellers fallback til keys i localStorage
  function isLoggedIn() {
    try {
      // Hvis du har en global util:
      if (typeof window.isAuthenticated === "function")
        return !!window.isAuthenticated();

      // Hvis du har en auth util i prosjektet:
      if (window.Auth && typeof window.Auth.isLoggedIn === "function") {
        return !!window.Auth.isLoggedIn();
      }

      // Fallback heuristikk:
      const possibleKeys = ["accessToken", "token", "auth", "user"];
      return possibleKeys.some((k) => {
        const v = localStorage.getItem(k);
        if (!v) return false;
        try {
          // støtt JSON lagring av user-objekt
          const parsed = JSON.parse(v);
          return !!parsed; // object truthy
        } catch {
          return typeof v === "string" && v.length > 0;
        }
      });
    } catch {
      return false;
    }
  }

  function applyAuthVisibility() {
    const loggedIn = isLoggedIn();
    document.querySelectorAll("[data-auth-when]").forEach((el) => {
      const should = el.getAttribute("data-auth-when"); // "logged-in" | "logged-out"
      const show =
        (should === "logged-in" && loggedIn) ||
        (should === "logged-out" && !loggedIn);
      el.classList.toggle("hidden", !show);
    });
  }

  // Kall ved load
  applyAuthVisibility();

  // (Valgfritt) Koble til logout-knapp hvis du har en slik
  /* const logoutBtn = qs("#logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Kall din faktiske logout! Her er en defensiv fallback:
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
      } catch {
        applyAuthVisibility();
        // Lukk meny
        closeMenu();
        // Naviger, om ønskelig:
        location.href = "/login/index.html";
      }
    });
  } */

  // --- MENU TOGGLE ----------------------------------------------------------
  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function openMenu() {
    menu.classList.remove("hidden"); // behold sm:hidden så den kun vises på mobil
    btn.setAttribute("aria-expanded", "true");
    lockScroll(true);
  }

  function closeMenu() {
    menu.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
    lockScroll(false);
  }

  function toggleMenu() {
    const isHidden = menu.classList.contains("hidden");
    if (isHidden) openMenu();
    else closeMenu();
  }

  // ÉN (1) lytter. Ikke ha andre togglere i inline script.
  btn.addEventListener("click", toggleMenu);

  // Lukk med Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) {
      closeMenu();
    }
  });

  // Lukk når vi passerer sm (>= 640px)
  const mq = window.matchMedia("(min-width: 640px)");
  mq.addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });

  // Lukk ved klikk inne i meny på lenker/knapper (typisk navigasjon)
  menu.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("a, button")) closeMenu();
  });

  // Hvis du oppdaterer auth state andre steder, kan du trigge:
  // window.dispatchEvent(new Event('auth:changed'));
  window.addEventListener("auth:changed", applyAuthVisibility);
})();
