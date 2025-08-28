/* import { getCredits } from "../api/listings/getCredits.js";
import { postBid } from "../api/post/postBid.js";
import { getBids } from "../api/listings/getBids.js";
import { renderGetBids } from "../ui/renderBid.js";

export async function bidHandler(listingId, amount) {
  const container = document.getElementById("auction-container");
  try {
    const creditsResponse = await getCredits();
    const credits = creditsResponse.data?.credits;

    renderGetBids(container, credits);

    if (!credits || credits < amount) {
      throw new Error("Ikke nok credits for å legge inn dette budet.");
    }

    const bidResponse = await postBid(listingId, amount);
    const bidsResponse = await getBids(listingId); // Hent oppdaterte bud

    return {
      success: true,
      data: { bid: bidResponse, bids: bidsResponse.bids },
      message: "Budet er registrert!",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}
 */
