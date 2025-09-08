import { register } from "../auth/register.js";
import { displayMessage } from "../utils/displayMessage.js";
import { validateRegisterForm } from "../utilities/validateRegisterForm.js";
import { showFieldErrors } from "../utilities/showFieldErrors.js";

export function registerHandler() {
  const form = document.querySelector("#form");
  if (form) {
    form.addEventListener("submit", submitForm);
  }
}

async function submitForm(event) {
  event.preventDefault();
  const form = event.target;
  const container = document.querySelector("#message");
  const fieldset = form.querySelector("fieldset");
  const button = form.querySelector("#reg-btn");

  const data = Object.fromEntries(new FormData(form));

  const fieldErrors = validateRegisterForm(data);
  if (Object.keys(fieldErrors).length > 0) {
    showFieldErrors(form, fieldErrors);
    if (container) {
      displayMessage(
        container,
        "warning",
        "Please fix the highlighted fields.",
      );
    }
    return;
  } else {
    showFieldErrors(form, {});
    if (container) container.innerHTML = "";
  }

  if (data.bio?.trim() === "") {
    delete data.bio;
  }

  if (data.avatarUrl?.trim() === "") {
    delete data.avatarUrl;
  } else {
    data.avatar = {
      url: data.avatarUrl,
      alt: `${data.name}'s avatar`,
    };
  }

  delete data.confirmPassword;

  try {
    fieldset.disabled = true;
    button.textContent = "Registering...";

    await register(data);

    displayMessage(container, "success", "Registration successful!");
    form.reset();

    showFieldErrors(form, {});
    setTimeout(() => {
      location.href = "/index.html";
    }, 2000);
  } catch (error) {
    displayMessage(
      container,
      "warning",
      error.message || "Registration failed.",
    );
  } finally {
    fieldset.disabled = false;
    button.textContent = "Register";
  }
}
