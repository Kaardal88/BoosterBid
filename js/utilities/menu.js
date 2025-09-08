(function () {
  const qs = (sel, root = document) => root.querySelector(sel);

  const btn = qs("#hamburger");
  const menu = qs("#nav-menu");

  if (!btn || !menu) return;

  function isLoggedIn() {
    try {
      if (typeof window.isAuthenticated === "function")
        return !!window.isAuthenticated();

      if (window.Auth && typeof window.Auth.isLoggedIn === "function") {
        return !!window.Auth.isLoggedIn();
      }

      const possibleKeys = ["accessToken", "token", "auth", "user"];
      return possibleKeys.some((k) => {
        const v = localStorage.getItem(k);
        if (!v) return false;
        try {
          const parsed = JSON.parse(v);
          return !!parsed;
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
      const should = el.getAttribute("data-auth-when");
      const show =
        (should === "logged-in" && loggedIn) ||
        (should === "logged-out" && !loggedIn);
      el.classList.toggle("hidden", !show);
    });
  }

  applyAuthVisibility();

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function openMenu() {
    menu.classList.remove("hidden");
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

  btn.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) {
      closeMenu();
    }
  });

  const mq = window.matchMedia("(min-width: 640px)");
  mq.addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });

  menu.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("a, button")) closeMenu();
  });

  window.addEventListener("auth:changed", applyAuthVisibility);
})();
