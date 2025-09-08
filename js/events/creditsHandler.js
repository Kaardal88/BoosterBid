import { getCredits } from "../api/listings/getCredits.js";
import { renderCredits } from "../ui/renderCredits.js";

export async function creditsHandler() {
  try {
    const response = await getCredits();

    const credits = response.data?.credits;
    renderCredits(credits);

    return {
      success: true,
      data: credits,
      message: "Credits fetch successful",
    };
  } catch (error) {
    const errorMessage = error.message || "Failed to fetch credits";

    return {
      success: false,
      data: null,
      message: errorMessage,
    };
  }
}
