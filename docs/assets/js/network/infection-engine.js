import { resetInfectionStates, updateEdgeStates, updateNodeStates } from "./infection-state.js";
import {
  applyStaticPath,
  scheduleNextAmbient,
  startAmbientSequence,
  updateTransmission,
} from "./infection-sequence.js";
import {
  createOutbreakConfig,
  createOutbreakState,
  startOutbreak,
  updateOutbreak,
} from "./outbreak-engine.js";

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
    outbreak: createOutbreakState(nodes.length),
    outbreakConfig: createOutbreakConfig(config),
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
  if (engine.outbreak.active) {
    updateOutbreak(engine, time);
    return;
  }
  updateTransmission(engine, time);

  if (!engine.started) {
    engine.started = true;
    scheduleNextAmbient(engine, time);
  } else if (!engine.transmission && time >= engine.nextAmbientAt) {
    startAmbientSequence(engine, time);
  }
}

/**
 * Replaces ambient state with a bounded connected interaction outbreak.
 *
 * @param {object} engine - Mutable infection engine state.
 * @param {number} centerId - Starting node identifier.
 * @param {number} time - Current animation timestamp.
 * @param {number} intensity - Outbreak strength from zero to one.
 * @returns {number} Number of nodes included, or zero when disabled.
 */
export function triggerOutbreak(engine, centerId, time, intensity) {
  if (engine.static || centerId < 0 || centerId >= engine.nodes.length) {
    return 0;
  }

  engine.transmission = null;
  resetInfectionStates(engine.nodes, engine.edges);
  return startOutbreak(engine, centerId, time, intensity);
}
