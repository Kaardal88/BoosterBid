export function logoutHandler() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");

  window.location.href = "/login/index.html";
  history.replaceState(null, "", "/index.html");
}

export function logoutListener() {
  document.addEventListener("click", function (event) {
    if (event.target.closest("#logout-btn")) {
      logoutHandler();
    }
  });
}
