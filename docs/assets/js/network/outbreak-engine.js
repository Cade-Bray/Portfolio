import { clamp } from "../utilities/clamp.js";
import { getConnectedEdge } from "./get-connected-edge.js";
import {
  beginEdgeTransmission,
  infectEdge,
  infectNode,
  updateTransmissionProgress,
} from "./infection-state.js";
import { scheduleNextAmbient } from "./infection-sequence.js";

function randomBetween(random, minimum, maximum) {
  return minimum + random() * (maximum - minimum);
}

/**
 * Allocates fixed outbreak buffers once for the graph lifetime.
 *
 * @param {number} nodeCount - Number of nodes in the graph.
 * @returns {object} Reusable traversal and transmission buffers.
 */
export function createOutbreakState(nodeCount) {
  return {
    active: false,
    eventCount: 0,
    remaining: 0,
    events: Array.from({ length: Math.max(0, nodeCount - 1) }, () => ({})),
    queueIds: new Uint16Array(nodeCount),
    queueTimes: new Float64Array(nodeCount),
    visited: new Uint8Array(nodeCount),
  };
}

/**
 * Creates pointer-specific recovery timing once per graph.
 *
 * @param {object} config - Shared infection configuration.
 * @returns {object} Infection configuration tuned for short outbreaks.
 */
export function createOutbreakConfig(config) {
  return {
    ...config,
    nodeHoldMinimum: config.outbreakNodeHoldMinimum,
    nodeHoldMaximum: config.outbreakNodeHoldMaximum,
    edgeHoldMinimum: config.outbreakEdgeHoldMinimum,
    edgeHoldMaximum: config.outbreakEdgeHoldMaximum,
  };
}

/**
 * Fills preallocated events with a randomized connected breadth-first tree.
 *
 * @param {object} engine - Infection engine with reusable outbreak buffers.
 * @param {number} centerId - Starting node identifier.
 * @param {number} targetCount - Total nodes to include.
 * @param {number} time - Current animation timestamp.
 * @returns {number} Number of edge transmission events prepared.
 */
function buildOutbreakEvents(engine, centerId, targetCount, time) {
  const state = engine.outbreak;
  state.visited.fill(0);
  state.visited[centerId] = 1;
  state.queueIds[0] = centerId;
  state.queueTimes[0] = time;
  let cursor = 0;
  let queueLength = 1;
  let eventCount = 0;

  while (cursor < queueLength && queueLength < targetCount) {
    const sourceId = state.queueIds[cursor];
    const neighbors = engine.nodes[sourceId].neighbors;
    const rotation = Math.floor(engine.random() * neighbors.length);
    for (let offset = 0; offset < neighbors.length && queueLength < targetCount; offset += 1) {
      const targetId = neighbors[(rotation + offset) % neighbors.length];
      if (state.visited[targetId]) {
        continue;
      }
      const event = state.events[eventCount];
      event.nodeId = targetId;
      event.edge = getConnectedEdge(engine.nodes, engine.edges, sourceId, targetId);
      event.startAt = state.queueTimes[cursor] + randomBetween(
        engine.random,
        engine.config.outbreakStepDelayMinimum,
        engine.config.outbreakStepDelayMaximum,
      );
      event.duration = randomBetween(
        engine.random,
        engine.config.outbreakTransmissionMinimum,
        engine.config.outbreakTransmissionMaximum,
      );
      event.started = false;
      event.complete = false;
      state.visited[targetId] = 1;
      state.queueIds[queueLength] = targetId;
      state.queueTimes[queueLength] = event.startAt + event.duration;
      queueLength += 1;
      eventCount += 1;
    }
    cursor += 1;
  }

  return eventCount;
}

/**
 * Starts a connected pointer or tap outbreak from one graph node.
 *
 * @param {object} engine - Mutable infection engine state.
 * @param {number} centerId - Starting node identifier.
 * @param {number} time - Current animation timestamp.
 * @param {number} intensity - Outbreak strength from zero to one.
 * @returns {number} Number of nodes included in the outbreak.
 */
export function startOutbreak(engine, centerId, time, intensity) {
  const ratio = engine.config.outbreakRatioMinimum
    + (engine.config.outbreakRatioMaximum - engine.config.outbreakRatioMinimum)
      * clamp(intensity, 0, 1);
  const targetCount = Math.max(2, Math.floor(engine.nodes.length * ratio));
  const state = engine.outbreak;
  state.eventCount = buildOutbreakEvents(engine, centerId, targetCount, time);
  state.remaining = state.eventCount;
  state.active = state.eventCount > 0;
  infectNode(engine.nodes[centerId], time, engine.random, engine.outbreakConfig);
  return state.eventCount + 1;
}

/**
 * Advances every preallocated outbreak transmission event.
 *
 * @param {object} engine - Mutable infection engine state.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function updateOutbreak(engine, time) {
  const state = engine.outbreak;
  for (let index = 0; index < state.eventCount; index += 1) {
    const event = state.events[index];
    if (event.complete || time < event.startAt) {
      continue;
    }
    if (!event.started) {
      beginEdgeTransmission(event.edge, event.startAt, event.duration);
      event.started = true;
    }
    if (updateTransmissionProgress(event.edge, time)) {
      infectEdge(event.edge, time, engine.random, engine.outbreakConfig);
      infectNode(engine.nodes[event.nodeId], time, engine.random, engine.outbreakConfig);
      event.complete = true;
      state.remaining -= 1;
    }
  }

  if (state.remaining === 0) {
    state.active = false;
    scheduleNextAmbient(engine, time);
  }
}
