import {
  beginEdgeTransmission,
  infectEdge,
  infectNode,
  updateTransmissionProgress,
} from "./infection-state.js";
import { getConnectedEdge } from "./get-connected-edge.js";

function randomBetween(random, minimum, maximum) {
  return minimum + random() * (maximum - minimum);
}

function choose(items, random) {
  return items[Math.floor(random() * items.length)];
}

/**
 * Counts nodes that still carry visible infection state.
 *
 * @param {Array<object>} nodes - Network nodes to inspect.
 * @returns {number} Active infected or recovering node count.
 */
function countActiveNodes(nodes) {
  let count = 0;
  for (let index = 0; index < nodes.length; index += 1) {
    count += nodes[index].state === "healthy" ? 0 : 1;
  }
  return count;
}

/**
 * Checks for one available connected target without allocating a list.
 *
 * @param {object} engine - Infection engine state.
 * @param {number} sourceId - Source node identifier.
 * @returns {boolean} Whether a healthy target edge exists.
 */
function hasHealthyTarget(engine, sourceId) {
  const neighbors = engine.nodes[sourceId].neighbors;
  for (let index = 0; index < neighbors.length; index += 1) {
    const targetId = neighbors[index];
    const edge = getConnectedEdge(engine.nodes, engine.edges, sourceId, targetId);
    if (engine.nodes[targetId].state === "healthy" && edge.state === "healthy") {
      return true;
    }
  }
  return false;
}

/**
 * Finds healthy connected targets whose edge is also available.
 *
 * @param {object} engine - Infection engine state.
 * @param {number} sourceId - Source node identifier.
 * @param {Set<number>} visited - Nodes already used by the sequence.
 * @returns {Array<number>} Eligible connected node identifiers.
 */
function getHealthyTargets(engine, sourceId, visited) {
  return engine.nodes[sourceId].neighbors.filter((targetId) => {
    const edge = getConnectedEdge(engine.nodes, engine.edges, sourceId, targetId);
    return !visited.has(targetId)
      && engine.nodes[targetId].state === "healthy"
      && edge.state === "healthy";
  });
}

/**
 * Sets the next randomized ambient infection time.
 *
 * @param {object} engine - Infection engine state.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function scheduleNextAmbient(engine, time) {
  engine.nextAmbientAt = time + randomBetween(
    engine.random,
    engine.config.ambientDelayMinimum,
    engine.config.ambientDelayMaximum,
  );
}

/**
 * Schedules a connected edge pulse after a short pause.
 *
 * @param {object} engine - Infection engine state.
 * @param {number} sourceId - Source node identifier.
 * @param {number} targetId - Target node identifier.
 * @param {number} time - Current animation timestamp.
 * @param {number} hopsRemaining - Additional propagation hops allowed.
 * @param {Set<number>} visited - Nodes already used by the sequence.
 * @returns {void}
 */
function scheduleTransmission(engine, sourceId, targetId, time, hopsRemaining, visited) {
  const config = engine.config;
  const delay = randomBetween(
    engine.random,
    config.transmissionDelayMinimum,
    config.transmissionDelayMaximum,
  );
  const duration = randomBetween(
    engine.random,
    config.transmissionDurationMinimum,
    config.transmissionDurationMaximum,
  );
  engine.transmission = { sourceId, targetId, startAt: time + delay, duration, hopsRemaining, visited };
}

/**
 * Attempts to begin one bounded ambient infection sequence.
 *
 * @param {object} engine - Infection engine state.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function startAmbientSequence(engine, time) {
  const availableCapacity = engine.maximumActiveNodes - countActiveNodes(engine.nodes);
  const candidates = engine.nodes.filter((node) => (
    node.state === "healthy" && hasHealthyTarget(engine, node.id)
  ));

  if (availableCapacity >= 2 && candidates.length > 0) {
    const source = choose(candidates, engine.random);
    const visited = new Set([source.id]);
    const targetId = choose(getHealthyTargets(engine, source.id, visited), engine.random);
    visited.add(targetId);
    infectNode(source, time, engine.random, engine.config);
    const hops = engine.random() < engine.config.secondHopChance ? 1 : 0;
    scheduleTransmission(engine, source.id, targetId, time, hops, visited);
  }

  scheduleNextAmbient(engine, time);
}

/**
 * Completes a pulse and optionally continues through one connected hop.
 *
 * @param {object} engine - Infection engine state.
 * @param {object} transmission - Completed transmission record.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
function completeTransmission(engine, transmission, time) {
  const edge = getConnectedEdge(
    engine.nodes,
    engine.edges,
    transmission.sourceId,
    transmission.targetId,
  );
  infectEdge(edge, time, engine.random, engine.config);
  infectNode(engine.nodes[transmission.targetId], time, engine.random, engine.config);
  engine.transmission = null;

  if (transmission.hopsRemaining < 1
    || countActiveNodes(engine.nodes) >= engine.maximumActiveNodes) {
    return;
  }

  const targets = getHealthyTargets(engine, transmission.targetId, transmission.visited);
  if (targets.length > 0) {
    const targetId = choose(targets, engine.random);
    transmission.visited.add(targetId);
    scheduleTransmission(
      engine,
      transmission.targetId,
      targetId,
      time,
      transmission.hopsRemaining - 1,
      transmission.visited,
    );
  }
}

/**
 * Advances an active edge transmission when its delay has elapsed.
 *
 * @param {object} engine - Infection engine state.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function updateTransmission(engine, time) {
  const transmission = engine.transmission;
  if (!transmission || time < transmission.startAt) {
    return;
  }

  const edge = getConnectedEdge(
    engine.nodes,
    engine.edges,
    transmission.sourceId,
    transmission.targetId,
  );
  if (edge.state === "healthy") {
    beginEdgeTransmission(edge, transmission.startAt, transmission.duration);
  }
  if (updateTransmissionProgress(edge, time)) {
    completeTransmission(engine, transmission, time);
  }
}

/**
 * Applies one permanent path for users who request reduced motion.
 *
 * @param {object} engine - Infection engine state.
 * @returns {void}
 */
export function applyStaticPath(engine) {
  const edge = choose(engine.edges, engine.random);
  [edge.sourceId, edge.targetId].forEach((nodeId) => {
    infectNode(engine.nodes[nodeId], 0, engine.random, engine.config);
    engine.nodes[nodeId].transitionDuration = 0;
    engine.nodes[nodeId].stateUntil = Infinity;
  });
  infectEdge(edge, 0, engine.random, engine.config);
  edge.recoveryStarted = Infinity;
  edge.stateUntil = Infinity;
}
