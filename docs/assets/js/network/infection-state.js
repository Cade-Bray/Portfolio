import { clamp } from "../utilities/clamp.js";

/**
 * Returns a random duration inside a configured range.
 *
 * @param {() => number} random - Random source returning values from zero to one.
 * @param {number} minimum - Shortest duration.
 * @param {number} maximum - Longest duration.
 * @returns {number} Duration inside the requested range.
 */
function randomDuration(random, minimum, maximum) {
  return minimum + random() * (maximum - minimum);
}

/**
 * Starts a node infection with independent fade and hold timings.
 *
 * @param {object} node - Mutable network node.
 * @param {number} time - Current animation timestamp.
 * @param {() => number} random - Infection timing random source.
 * @param {object} config - Infection timing configuration.
 * @returns {void}
 */
export function infectNode(node, time, random, config) {
  node.state = "infected";
  node.stateStarted = time;
  node.transitionDuration = randomDuration(random, config.nodeFadeMinimum, config.nodeFadeMaximum);
  node.stateUntil = time + randomDuration(random, config.nodeHoldMinimum, config.nodeHoldMaximum);
}

/**
 * Advances infected nodes through recovery and back to healthy state.
 *
 * @param {Array<object>} nodes - Mutable network nodes.
 * @param {number} time - Current animation timestamp.
 * @param {() => number} random - Recovery timing random source.
 * @param {object} config - Infection timing configuration.
 * @returns {void}
 */
export function updateNodeStates(nodes, time, random, config) {
  nodes.forEach((node) => {
    if (node.state === "infected" && time >= node.stateUntil) {
      node.state = "recovering";
      node.stateStarted = time;
      node.transitionDuration = randomDuration(
        random,
        config.nodeRecoveryMinimum,
        config.nodeRecoveryMaximum,
      );
      node.stateUntil = time + node.transitionDuration;
    } else if (node.state === "recovering" && time >= node.stateUntil) {
      node.state = "healthy";
      node.stateStarted = 0;
      node.stateUntil = 0;
      node.transitionDuration = 0;
    }
  });
}

/**
 * Starts a timed red transmission along an edge.
 *
 * @param {object} edge - Mutable network edge.
 * @param {number} startTime - Timestamp at which transmission begins.
 * @param {number} duration - Transmission duration in milliseconds.
 * @returns {void}
 */
export function beginEdgeTransmission(edge, startTime, duration) {
  edge.state = "transmitting";
  edge.progress = 0;
  edge.stateStarted = startTime;
  edge.stateUntil = startTime + duration;
}

/**
 * Advances a transmitting edge and reports when its pulse arrives.
 *
 * @param {object} edge - Mutable transmitting edge.
 * @param {number} time - Current animation timestamp.
 * @returns {boolean} Whether transmission reached the target.
 */
export function updateTransmissionProgress(edge, time) {
  const duration = edge.stateUntil - edge.stateStarted;
  edge.progress = clamp((time - edge.stateStarted) / duration, 0, 1);
  return edge.progress >= 1;
}

/**
 * Holds an edge infection before a gradual fade to healthy.
 *
 * @param {object} edge - Mutable network edge.
 * @param {number} time - Current animation timestamp.
 * @param {() => number} random - Recovery timing random source.
 * @param {object} config - Infection timing configuration.
 * @returns {void}
 */
export function infectEdge(edge, time, random, config) {
  edge.state = "infected";
  edge.progress = 1;
  edge.stateStarted = time;
  edge.recoveryStarted = time
    + randomDuration(random, config.edgeHoldMinimum, config.edgeHoldMaximum);
  edge.stateUntil = edge.recoveryStarted
    + randomDuration(random, config.edgeRecoveryMinimum, config.edgeRecoveryMaximum);
}

/**
 * Returns fully recovered edges to their healthy state.
 *
 * @param {Array<object>} edges - Mutable network edges.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function updateEdgeStates(edges, time) {
  edges.forEach((edge) => {
    if (edge.state === "infected" && time >= edge.stateUntil) {
      edge.state = "healthy";
      edge.progress = 0;
      edge.stateStarted = 0;
      edge.recoveryStarted = 0;
      edge.stateUntil = 0;
    }
  });
}
