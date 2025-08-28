export function displayWelcomeMessage() {
  const username = localStorage.getItem("username");

  const welcomeDiv = document.getElementById("welcome-user");

  if (username) {
    welcomeDiv.textContent = `Welcome, ${username}!`;
  } else {
    welcomeDiv.textContent = "No username found.";
  }
}

document.addEventListener("DOMContentLoaded", displayWelcomeMessage);
