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
 * @param {Map<number, Function>} pendingWaits - Cancellable wait resolvers by timer.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
function wait(duration, pendingWaits) {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      pendingWaits.delete(timer);
      resolve();
    }, duration);
    pendingWaits.set(timer, resolve);
  });
}

/**
 * Cancels and resolves queued waits so stale async sequences can exit.
 *
 * @param {Map<number, Function>} pendingWaits - Wait resolvers keyed by timer.
 * @returns {void}
 */
function clearWaits(pendingWaits) {
  pendingWaits.forEach((resolve, timer) => {
    window.clearTimeout(timer);
    resolve();
  });
  pendingWaits.clear();
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
 * @param {Map<number, Function>} pendingWaits - Cancellable wait registry.
 * @returns {Promise<void>} Promise resolved after the entry transition begins.
 */
async function transitionRole(root, prefix, suffix, role, isCurrent, pendingWaits) {
  const removesEngineer = role[1] === "";

  root.classList.add("is-prefix-exiting");
  if (removesEngineer) root.classList.add("is-suffix-exiting");
  await wait(TRANSITION_DURATION, pendingWaits);

  if (!isCurrent()) return;

  setRole(prefix, suffix, role);
  root.classList.remove("is-prefix-exiting", "is-suffix-exiting");
  root.classList.add("is-prefix-entering");
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-prefix-entering")));
  await wait(TRANSITION_DURATION, pendingWaits);
}

/**
 * Plays the complete engineering-title sequence once.
 *
 * @param {HTMLElement} root - Element controlling the transition classes.
 * @param {HTMLElement} prefix - Rotating role prefix element.
 * @param {HTMLElement} suffix - Stable suffix element.
 * @param {() => boolean} isCurrent - Whether this cycle is still active.
 * @param {Map<number, Function>} pendingWaits - Cancellable wait registry.
 * @returns {Promise<void>} Promise resolved when the sequence settles.
 */
async function playSequence(root, prefix, suffix, isCurrent, pendingWaits) {
  setRole(prefix, suffix, ROLES[0]);

  for (const role of ROLES.slice(1)) {
    await wait(DISPLAY_DURATION, pendingWaits);
    if (!isCurrent()) return;
    await transitionRole(root, prefix, suffix, role, isCurrent, pendingWaits);
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

  let cycleId = 0;
  let restartTimer;
  let wasAtTop = window.scrollY <= TOP_THRESHOLD;
  const pendingWaits = new Map();

  const startCycle = () => {
    clearWaits(pendingWaits);
    const currentId = ++cycleId;
    root.classList.remove("is-prefix-exiting", "is-prefix-entering", "is-suffix-exiting");
    void playSequence(root, prefix, suffix, () => currentId === cycleId, pendingWaits);
    window.clearTimeout(restartTimer);
    restartTimer = window.setTimeout(startCycle, RESTART_INTERVAL);
  };

  const handleScroll = () => {
    const isAtTop = window.scrollY <= TOP_THRESHOLD;
    if (isAtTop && !wasAtTop && !reducedMotion.matches) startCycle();
    wasAtTop = isAtTop;
  };

  const handleMotionChange = () => {
    cycleId += 1;
    window.clearTimeout(restartTimer);
    clearWaits(pendingWaits);
    root.classList.remove("is-prefix-exiting", "is-prefix-entering", "is-suffix-exiting");
    if (reducedMotion.matches) {
      setRole(prefix, suffix, ROLES.at(-1));
    } else {
      startCycle();
    }
  };

  handleMotionChange();
  window.addEventListener("scroll", handleScroll, { passive: true });
  reducedMotion.addEventListener("change", handleMotionChange);

  return () => {
    cycleId += 1;
    window.clearTimeout(restartTimer);
    clearWaits(pendingWaits);
    window.removeEventListener("scroll", handleScroll);
    reducedMotion.removeEventListener("change", handleMotionChange);
    root.classList.remove("is-prefix-exiting", "is-prefix-entering", "is-suffix-exiting");
  };
}
