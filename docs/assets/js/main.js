import { initializeHeaderState } from "./ui/header-state.js";
import { initializeMobileMenu } from "./ui/mobile-menu.js";
import { initializeRoleRotation } from "./ui/role-rotation.js";

const header = document.querySelector("[data-site-header]");
const rotatingRole = document.querySelector("[data-rotating-role]");

if (header) {
  initializeHeaderState(header);
  initializeMobileMenu(header);
}

if (rotatingRole) {
  initializeRoleRotation(rotatingRole);
}
