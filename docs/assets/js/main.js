import { initializeHeaderState } from "./ui/header-state.js";

const header = document.querySelector("[data-site-header]");

if (header) {
  initializeHeaderState(header);
}
