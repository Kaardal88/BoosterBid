/* import { loginHandler } from "./events/loginHandler.js"; */
import { registerHandler } from "./events/registerHandler.js";
/* import { viewPostsHandler } from "./events/viewPostsHandler.js"; */
/* import { createPostHandler } from "./events/createPostHandler.js"; */
/* import { viewPersonalPostsHandler } from "./events/viewPersonalPostsHandler.js"; */
/* import { logoutListener } from "./events/logoutHandler.js"; */
/* import { viewSinglePostHandler } from "./events/viewSinglePostHandler.js"; */
/* import editPostHandler from "./events/editPostHandler.js"; */
/* import { searchPostsHandler } from "./events/searchPostsHandler.js"; */

function router() {
  const pathname = window.location.pathname;
  console.log("pathname", pathname);

  switch (pathname) {
    case "/":
    case "/index.html":
      loginHandler();
      break;

    case "/register/":
    case "/register/index.html":
      registerHandler();
      break;

    case "/feed/":
    case "/feed/index.html":
      viewPostsHandler();
      createPostHandler();
      searchPostsHandler();
      break;

    case "/profile/":
    case "/profile/index.html":
      viewPersonalPostsHandler();
      logoutListener();
      break;

    case "/post-detail/":
    case "/post-detail/index.html":
      viewSinglePostHandler();
      break;

    case "/edit-post/":
    case "/edit-post/index.html":
      editPostHandler();
      break;

    default:
      console.warn("No route matched for:", pathname);
  }
}

router();
