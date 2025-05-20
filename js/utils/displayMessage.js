export function displayMessage(container, type, message) {
  container.innerHTML = `<div class="${type}">${message}</div>`;
}
