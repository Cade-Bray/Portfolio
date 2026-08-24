const MOBILE_QUERY = "(max-width: 48rem)";

/**
 * Applies the mobile navigation's open state and accessibility metadata.
 *
 * @param {HTMLElement} header - Site header that owns the expanded state.
 * @param {HTMLButtonElement} toggle - Button controlling the section menu.
 * @param {boolean} isOpen - Whether the section menu should be expanded.
 * @returns {void}
 */
function setMenuState(header, toggle, isOpen) {
  header.classList.toggle("is-menu-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", `${isOpen ? "Close" : "Open"} page navigation`);
}

/**
 * Adds an accessible expanding menu for section anchors on mobile screens.
 *
 * @param {HTMLElement} header - Site header containing the menu and toggle.
 * @returns {() => void} Cleanup function that removes menu listeners and state.
 */
export function initializeMobileMenu(header) {
  const toggle = header.querySelector("[data-menu-toggle]");
  const menu = header.querySelector("[data-section-menu]");
  const mobileViewport = window.matchMedia(MOBILE_QUERY);

  if (!(toggle instanceof HTMLButtonElement) || !menu) return () => {};

  const closeMenu = () => setMenuState(header, toggle, false);
  const handleToggle = () => setMenuState(header, toggle, !header.classList.contains("is-menu-open"));
  const handleMenuClick = (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  };
  const handleKeydown = (event) => {
    if (event.key !== "Escape" || !header.classList.contains("is-menu-open")) return;
    closeMenu();
    toggle.focus();
  };
  const handleViewportChange = () => {
    if (!mobileViewport.matches) closeMenu();
  };

  header.dataset.menuReady = "true";
  toggle.addEventListener("click", handleToggle);
  menu.addEventListener("click", handleMenuClick);
  document.addEventListener("keydown", handleKeydown);
  mobileViewport.addEventListener("change", handleViewportChange);

  return () => {
    closeMenu();
    delete header.dataset.menuReady;
    toggle.removeEventListener("click", handleToggle);
    menu.removeEventListener("click", handleMenuClick);
    document.removeEventListener("keydown", handleKeydown);
    mobileViewport.removeEventListener("change", handleViewportChange);
  };
}
