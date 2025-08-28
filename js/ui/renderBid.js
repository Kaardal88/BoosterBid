import { bidHandler } from "../events/bidHandler.js";

export function renderBid(listingId, credits) {
  const bidSection = document.createElement("div");
  bidSection.className = "mt-8 bg-white p-6 rounded-lg shadow-md";

  bidSection.innerHTML = `
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Place a Bid</h2>
    <input type="number" id="bid-amount" class="w-full p-2 border rounded" placeholder="Enter your bid" min="0" step="0.01" />
    <button id="submit-bid" class="mt-4 bg-blue-500 text-white p-2 rounded">Place Bid</button>
    <p id="bid-message" class="mt-2 text-red-500"></p>
  `;

  const submitButton = bidSection.querySelector("#submit-bid");
  const bidAmountInput = bidSection.querySelector("#bid-amount");
  const bidMessage = bidSection.querySelector("#bid-message");

  submitButton.addEventListener("click", async () => {
    const amount = parseFloat(bidAmountInput.value);
    console.log(
      "Klikket på Place Bid. ListingId:",
      listingId,
      "Budbeløp:",
      amount,
    ); // Legg til
    if (!amount || amount <= 0) {
      bidMessage.textContent = "Vennligst skriv inn et gyldig beløp.";
      console.log("Ugyldig budbeløp"); // Legg til
      return;
    }

    const result = await bidHandler(listingId, amount);
    console.log("Resultat fra bidHandler:", result); // Legg til
    bidMessage.textContent = result.message;
    bidMessage.className = result.success
      ? "mt-2 text-green-500"
      : "mt-2 text-red-500";

    if (result.success) {
      bidAmountInput.value = ""; // Tøm inputfeltet
      renderCredits(credits - amount); // Oppdater credits
    }
  });

  return bidSection;
}

// Antatt eksisterende funksjon for å rendere credits
export function renderCredits(credits) {
  const creditsElement = document.getElementById("total-credits");
  creditsElement.textContent = credits || "...Loading";
}
