/**
 * Keeps the fixed header legible after the page leaves the hero's top edge.
 *
 * @param {HTMLElement} header - Header element that receives the scroll state.
 * @returns {() => void} Cleanup function that removes the scroll listener.
 */
export function initializeHeaderState(header) {
  let isScrolled;

  const updateState = () => {
    const nextState = window.scrollY > 24;
    if (nextState === isScrolled) return;
    isScrolled = nextState;
    header.classList.toggle("is-scrolled", isScrolled);
  };

  updateState();
  window.addEventListener("scroll", updateState, { passive: true });

  return () => window.removeEventListener("scroll", updateState);
}
