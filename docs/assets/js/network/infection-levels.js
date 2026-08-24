import { clamp } from "../utilities/clamp.js";

/**
 * Calculates the current visual infection strength of a node.
 *
 * @param {object} node - Network node with infection timing state.
 * @param {number} time - Current animation timestamp.
 * @returns {number} Infection strength from zero to one.
 */
export function getNodeInfectionLevel(node, time) {
  if (node.state === "infected") {
    if (node.transitionDuration <= 0) {
      return 1;
    }
    return clamp((time - node.stateStarted) / node.transitionDuration, 0, 1);
  }

  if (node.state === "recovering") {
    return clamp(1 - (time - node.stateStarted) / node.transitionDuration, 0, 1);
  }

  return 0;
}

/**
 * Calculates the current visual infection strength of an edge.
 *
 * @param {object} edge - Network edge with infection timing state.
 * @param {number} time - Current animation timestamp.
 * @returns {number} Infection strength from zero to one.
 */
export function getEdgeInfectionLevel(edge, time) {
  if (edge.state === "transmitting") {
    return edge.progress;
  }

  if (edge.state === "infected") {
    const duration = edge.stateUntil - edge.recoveryStarted;
    return time < edge.recoveryStarted
      ? 1
      : clamp(1 - (time - edge.recoveryStarted) / duration, 0, 1);
  }

  return 0;
}
