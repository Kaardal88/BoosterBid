export async function renderCredits(credits) {
  const creditsElement = document.getElementById("total-credits");

  if (!creditsElement) {
    return;
  }

  try {
    if (credits !== undefined && credits !== null) {
      creditsElement.textContent = credits;
    } else {
      creditsElement.textContent = "Credits not found.";
    }
  } catch (error) {
    creditsElement.textContent = "An error occurred.";
    console.error("Error rendering credits:", error);
  }
}
