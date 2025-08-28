// js/utils/auth.js
import { getToken } from "../events/auth/storage.js";

export function isLoggedIn() {
  return Boolean(getToken());
}

/**
 * Sørger for innlogging før en handling.
 * Hvis ikke innlogget: send til /login med redirect tilbake.
 */
export function requireAuth(redirectTo = location.pathname + location.search) {
  if (isLoggedIn()) return true;
  const url = new URL("/login/index.html", location.origin);
  url.searchParams.set("redirect", redirectTo);
  location.href = url.toString();
  return false;
}
