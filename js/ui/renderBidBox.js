import { requireAuth } from "../utils/auth.js";
import { postBid } from "../api/post/postBid.js";
import { getToken } from "../events/auth/storage.js";

export function renderBidBox(container, listing, userCredits = null) {
  if (!container) return;

  const token = getToken();
  if (!token) {
    container.innerHTML = `
      <div class="bg-red-100 border border-red-300 text-red-800 p-4 rounded text-center ">
        <p class="mb-2 ">
          You are not logged in. Please
          <a href="/login/index.html?redirect=${encodeURIComponent(location.pathname + location.search)}"
             class="underline text-blue-700 hover:text-blue-900">log in</a>
          to make a bid.
        </p>
      </div>`;
    return;
  }

  container.innerHTML = `
    ${userCredits != null ? `<p class="credits-display text-sm w-32 sm:w-auto text-white bg-primaryBtnHover rounded px-2 py-1 mb-2">Your credits: <span class="text-lg">${userCredits}</span></p>` : ""}
    <form id="bid-form" class="grid gap-3 bg-primary/20 p-4 rounded shadow">
      <input id="bid-amount" type="number" min="1" class="border rounded p-2 text-black"
             placeholder="Amount (credits)" required>
      <button class="bg-primary hover:bg-primaryBtnHover text-white font-semibold px-4 py-2 rounded">Publish bid</button>
      <p id="bid-msg" class="text-sm"></p>
    </form>
  `;

  const form = container.querySelector("#bid-form");
  const amount = container.querySelector("#bid-amount");
  const msg = container.querySelector("#bid-msg");
  const creditsDisplay = container.querySelector(".credits-display");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    const value = amount.valueAsNumber;
    msg.textContent = "";
    if (!value || value <= 0 || Number.isNaN(value)) {
      msg.textContent = "Please enter a valid amount.";
      msg.className = "text-red-600 text-sm";
      return;
    }
    if (userCredits != null && value > userCredits) {
      msg.textContent = "Not enough credits.";
      msg.className = "text-red-600 text-sm";
      return;
    }
    try {
      msg.textContent = "Sending bid…";
      msg.className = "text-gray-600 text-sm";
      await postBid(listing.id, value);
      msg.textContent = "Bid sent ✔";
      msg.className = "text-green-700 text-sm";
      amount.value = "";
      if (userCredits != null) {
        userCredits -= value;
        if (creditsDisplay)
          creditsDisplay.textContent = `Your credits: ${userCredits}`;
      }
    } catch (err) {
      msg.textContent = err.message || "Could not send bid.";
      msg.className = "text-red-600 text-sm";
    }
  });
}
