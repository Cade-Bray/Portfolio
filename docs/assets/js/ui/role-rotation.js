const ROLES = [
  ["Cybersecurity", " Engineer"],
  ["IT Support", " Engineer"],
  ["Software", " Engineer"],
  ["Technologist", ""],
];

const DISPLAY_DURATION = 1600;
const TRANSITION_DURATION = 260;
const RESTART_INTERVAL = 15000;
const TOP_THRESHOLD = 16;

/**
 * Waits for a role display or transition interval.
 *
 * @param {number} duration - Delay in milliseconds.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

/**
 * Updates the visible role while keeping the text hidden from assistive tools.
 *
 * @param {HTMLElement} prefix - Element containing the rotating role prefix.
 * @param {HTMLElement} suffix - Element containing the stable engineer suffix.
 * @param {string[]} role - Prefix and suffix text for the next role.
 * @returns {void}
 */
function setRole(prefix, suffix, role) {
  [prefix.textContent, suffix.textContent] = role;
}

/**
 * Replaces one role after completing its exit transition.
 *
 * @param {HTMLElement} root - Element controlling the transition classes.
 * @param {HTMLElement} prefix - Rotating role prefix element.
 * @param {HTMLElement} suffix - Stable suffix element.
 * @param {string[]} role - Prefix and suffix for the next role.
 * @param {() => boolean} isCurrent - Whether this cycle is still active.
 * @returns {Promise<void>} Promise resolved after the entry transition begins.
 */
async function transitionRole(root, prefix, suffix, role, isCurrent) {
  const removesEngineer = role[1] === "";

  root.classList.add("is-prefix-exiting");
  if (removesEngineer) root.classList.add("is-suffix-exiting");
  await wait(TRANSITION_DURATION);

  if (!isCurrent()) return;

  setRole(prefix, suffix, role);
  root.classList.remove("is-prefix-exiting", "is-suffix-exiting");
  root.classList.add("is-prefix-entering");
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-prefix-entering")));
  await wait(TRANSITION_DURATION);
}

/**
 * Plays the complete engineering-title sequence once.
 *
 * @param {HTMLElement} root - Element controlling the transition classes.
 * @param {HTMLElement} prefix - Rotating role prefix element.
 * @param {HTMLElement} suffix - Stable suffix element.
 * @param {() => boolean} isCurrent - Whether this cycle is still active.
 * @returns {Promise<void>} Promise resolved when the sequence settles.
 */
async function playSequence(root, prefix, suffix, isCurrent) {
  setRole(prefix, suffix, ROLES[0]);

  for (const role of ROLES.slice(1)) {
    await wait(DISPLAY_DURATION);
    if (!isCurrent()) return;
    await transitionRole(root, prefix, suffix, role, isCurrent);
  }
}

/**
 * Rotates the hero role every 15 seconds and when the page returns to the top.
 *
 * @param {HTMLElement} root - Hero role element containing prefix and suffix spans.
 * @returns {() => void} Cleanup function that stops timers and listeners.
 */
export function initializeRoleRotation(root) {
  const prefix = root.querySelector("[data-role-prefix]");
  const suffix = root.querySelector("[data-role-suffix]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!prefix || !suffix) return () => {};
  if (reducedMotion.matches) {
    setRole(prefix, suffix, ROLES.at(-1));
    return () => {};
  }

  let cycleId = 0;
  let restartTimer;
  let wasAtTop = window.scrollY <= TOP_THRESHOLD;

  const startCycle = () => {
    const currentId = ++cycleId;
    root.classList.remove("is-prefix-exiting", "is-prefix-entering", "is-suffix-exiting");
    void playSequence(root, prefix, suffix, () => currentId === cycleId);
    window.clearTimeout(restartTimer);
    restartTimer = window.setTimeout(startCycle, RESTART_INTERVAL);
  };

  const handleScroll = () => {
    const isAtTop = window.scrollY <= TOP_THRESHOLD;
    if (isAtTop && !wasAtTop) startCycle();
    wasAtTop = isAtTop;
  };

  startCycle();
  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    cycleId += 1;
    window.clearTimeout(restartTimer);
    window.removeEventListener("scroll", handleScroll);
    root.classList.remove("is-prefix-exiting", "is-prefix-entering", "is-suffix-exiting");
  };
}
