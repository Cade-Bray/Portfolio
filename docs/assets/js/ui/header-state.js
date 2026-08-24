/**
 * Keeps the fixed header legible after the page leaves the hero's top edge.
 *
 * @param {HTMLElement} header - Header element that receives the scroll state.
 * @returns {() => void} Cleanup function that removes the scroll listener.
 */
export function initializeHeaderState(header) {
  const updateState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateState();
  window.addEventListener("scroll", updateState, { passive: true });

  return () => window.removeEventListener("scroll", updateState);
}
