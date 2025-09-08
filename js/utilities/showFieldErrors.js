export function showFieldErrors(form, errors) {
  form.querySelectorAll("[data-error-for]").forEach((el) => {
    el.textContent = "";
  });

  Object.entries(errors).forEach(([field, message]) => {
    const target = form.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message;

    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.setAttribute("aria-invalid", "true");
      input.classList.add("ring-1", "ring-red-500");
    }
  });

  form.querySelectorAll("input, textarea").forEach((input) => {
    const field = input.name;
    if (!errors[field]) {
      input.removeAttribute("aria-invalid");
      input.classList.remove("ring-1", "ring-red-500");
    }
  });
}
