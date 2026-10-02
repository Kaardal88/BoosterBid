export function renderProfileActions() {
  return `
    <section class="profile__section flex flex-wrap gap-3" id="profile-actions">
      <button id="edit-profile-btn" type="button"
              class="bg-primary hover:bg-primaryBtnHover text-white rounded px-4 py-2">
        Edit profile
      </button>
      <button id="new-listing-btn" type="button"
              class="inline-flex items-center gap-2 bg-primary hover:bg-primaryBtnHover text-white rounded px-4 py-2">
        <span aria-hidden="true" class="text-lg leading-none">+</span>
        New listing
      </button>
    </section>
  `;
}

export function initProfileActions(
  container,
  data,
  { onProfileSaved, onListingCreated } = {},
) {
  container
    .querySelector("#edit-profile-btn")
    ?.addEventListener("click", async () => {
      const { openEditProfileModal } = await import("./editProfileModal.js");
      openEditProfileModal(data, onProfileSaved);
    });

  container
    .querySelector("#new-listing-btn")
    ?.addEventListener("click", async () => {
      const { openCreateListingModal } = await import(
        "./createListingModal.js"
      );
      openCreateListingModal(onListingCreated);
    });
}
