export function logoutHandler() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");

  window.location.href = "/index.html";
  history.replaceState(null, "", "/index.html");

  console.log("User logged out locally.");
}

export function logoutListener() {
  document.addEventListener("click", function (event) {
    if (event.target.closest("#logout")) {
      logoutHandler();
    }
  });
}
