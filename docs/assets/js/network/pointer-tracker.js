/**
 * Updates pointer coordinates relative to a cached hero rectangle.
 *
 * @param {HTMLElement} hero - Pointer interaction surface.
 * @param {object} state - Mutable pointer influence state.
 * @param {PointerEvent} event - Browser pointer event.
 * @returns {void}
 */
function updatePosition(hero, state, event) {
  if (state.rectangleDirty || !state.rectangle) {
    state.rectangle = hero.getBoundingClientRect();
    state.rectangleDirty = false;
  }
  state.x = event.clientX - state.rectangle.left;
  state.y = event.clientY - state.rectangle.top;
}

/**
 * Attaches passive mouse tracking and scroll-safe touch tap detection.
 *
 * @param {HTMLElement} hero - Hero interaction surface.
 * @param {object} state - Mutable pointer influence state.
 * @param {object} config - Tap distance and duration configuration.
 * @returns {() => void} Cleanup function for every attached listener.
 */
export function initializePointerTracker(hero, state, config) {
  const passive = { passive: true };
  let contactId = -1;
  let contactX = 0;
  let contactY = 0;
  let contactStarted = 0;
  let contactMoved = false;

  const handleEnter = (event) => {
    if (event.pointerType === "mouse") {
      state.active = true;
      state.rectangleDirty = true;
      updatePosition(hero, state, event);
    }
  };

  const handleMove = (event) => {
    if (event.pointerType === "mouse") {
      state.active = true;
      updatePosition(hero, state, event);
    } else if (event.pointerId === contactId) {
      const x = event.clientX - contactX;
      const y = event.clientY - contactY;
      contactMoved ||= Math.hypot(x, y) > config.tapMaximumDistance;
    }
  };

  const handleLeave = (event) => {
    if (event.pointerType === "mouse") {
      state.active = false;
    }
  };

  const handleDown = (event) => {
    if (event.pointerType === "mouse" || event.target.closest?.("a, button")) {
      return;
    }
    contactId = event.pointerId;
    contactX = event.clientX;
    contactY = event.clientY;
    contactStarted = event.timeStamp;
    contactMoved = false;
  };

  const clearContact = () => {
    contactId = -1;
    contactMoved = false;
  };

  const handleUp = (event) => {
    if (event.pointerId === contactId
      && !contactMoved
      && event.timeStamp - contactStarted <= config.tapMaximumDuration) {
      state.rectangleDirty = true;
      updatePosition(hero, state, event);
      state.tapPending = true;
    }
    clearContact();
  };

  const handleScroll = () => {
    state.active = false;
    state.rectangleDirty = true;
    clearContact();
  };

  hero.addEventListener("pointerenter", handleEnter, passive);
  hero.addEventListener("pointermove", handleMove, passive);
  hero.addEventListener("pointerleave", handleLeave, passive);
  hero.addEventListener("pointerdown", handleDown, passive);
  hero.addEventListener("pointerup", handleUp, passive);
  hero.addEventListener("pointercancel", clearContact, passive);
  window.addEventListener("scroll", handleScroll, passive);

  return () => {
    hero.removeEventListener("pointerenter", handleEnter);
    hero.removeEventListener("pointermove", handleMove);
    hero.removeEventListener("pointerleave", handleLeave);
    hero.removeEventListener("pointerdown", handleDown);
    hero.removeEventListener("pointerup", handleUp);
    hero.removeEventListener("pointercancel", clearContact);
    window.removeEventListener("scroll", handleScroll);
  };
}
