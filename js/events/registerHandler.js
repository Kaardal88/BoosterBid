import { register } from "../auth/register.js";
import { displayMessage } from "../utils/displayMessage.js";

export function registerHandler() {
  const form = document.querySelector("#form");
  if (form) {
    form.addEventListener("submit", submitForm);
  }
}

async function submitForm(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));

  if (data.bio.trim() === "") {
    delete data.bio;
  }

  const fieldset = form.querySelector("fieldset");
  const button = form.querySelector("#reg-btn");
  const container = document.querySelector("#message");

  try {
    fieldset.disabled = true;
    button.textContent = "Registering...";
    await register(data);

    displayMessage(container, "success", "Registration successful!");
    form.reset();
    setTimeout(() => {
      location.href = "/index.html";
    }, 2000);
  } catch (error) {
    displayMessage(container, "warning", error.message);
  } finally {
    fieldset.disabled = false;
    button.textContent = "Register";
  }
}
