import { updateEdgeStates, updateNodeStates } from "./infection-state.js";
import {
  applyStaticPath,
  createEdgeLookup,
  scheduleNextAmbient,
  startAmbientSequence,
  updateTransmission,
} from "./infection-sequence.js";

/**
 * Creates isolated ambient infection state for one connected graph.
 *
 * @param {Array<object>} nodes - Connected network nodes.
 * @param {Array<object>} edges - Network edges.
 * @param {() => number} random - Infection random source.
 * @param {object} config - Infection timing configuration.
 * @param {boolean} reducedMotion - Whether to use one static red path.
 * @returns {object} Mutable infection engine state.
 */
export function createInfectionEngine(nodes, edges, random, config, reducedMotion) {
  const engine = {
    nodes,
    edges,
    random,
    config,
    static: reducedMotion,
    started: false,
    nextAmbientAt: 0,
    transmission: null,
    maximumActiveNodes: Math.max(2, Math.floor(nodes.length * config.maximumActiveRatio)),
    edgeByPair: createEdgeLookup(edges),
  };

  if (reducedMotion && edges.length > 0) {
    applyStaticPath(engine);
  }

  return engine;
}

/**
 * Advances ambient infection, connected propagation, and recovery.
 *
 * @param {object} engine - Mutable infection engine state.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function updateInfection(engine, time) {
  if (engine.static) {
    return;
  }

  updateNodeStates(engine.nodes, time, engine.random, engine.config);
  updateEdgeStates(engine.edges, time);
  updateTransmission(engine, time);

  if (!engine.started) {
    engine.started = true;
    scheduleNextAmbient(engine, time);
  } else if (!engine.transmission && time >= engine.nextAmbientAt) {
    startAmbientSequence(engine, time);
  }
}
