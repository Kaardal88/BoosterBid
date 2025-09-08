export const BASE_URL = "https://v2.api.noroff.dev/";
export const ENDPOINTS = {
  register: "auth/register",
  login: "auth/login",
  singleProfile: "auction/profiles/{name}",
  allListings: "auction/listings",
  credits: "auction/profiles/{name}/credits",
  placeBids: "auction/listings/{name}/bids",
  fetchBids: "auction/listings/{name}/bids",
  singleListing: "auction/listings/{id}",
  updateProfileMedia: "auction/profiles/{name}/media",
  listListings: "auction/listings",
  searchListings: "auction/listings/search",
};
