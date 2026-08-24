/**
 * Finds the closest visible projected node within an interaction radius.
 *
 * @param {Array<object>} projectedNodes - Reused projected-node records.
 * @param {number} x - Pointer x-coordinate inside the hero.
 * @param {number} y - Pointer y-coordinate inside the hero.
 * @param {number} radius - Maximum interaction distance.
 * @param {object} result - Reusable nearest-node result.
 * @returns {object} Updated nearest-node result.
 */
function findNearestNode(projectedNodes, x, y, radius, result) {
  let nearestDistanceSquared = radius * radius;
  result.nodeId = -1;

  for (let index = 0; index < projectedNodes.length; index += 1) {
    const node = projectedNodes[index];
    if (!node.visible) {
      continue;
    }
    const offsetX = node.x - x;
    const offsetY = node.y - y;
    const distanceSquared = offsetX * offsetX + offsetY * offsetY;
    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      result.nodeId = index;
    }
  }

  result.distance = Math.sqrt(nearestDistanceSquared);
  return result;
}

/**
 * Creates mutable pointer influence state reused for the scene lifetime.
 *
 * @returns {object} Pointer coordinates, influence, and reusable query state.
 */
export function createPointerInfluence() {
  return {
    x: 0,
    y: 0,
    active: false,
    tapPending: false,
    rectangle: null,
    rectangleDirty: true,
    nodeId: -1,
    influence: 0,
    nearest: { nodeId: -1, distance: Infinity },
  };
}

/**
 * Updates nearest-node selection and smoothly eases pointer influence.
 *
 * @param {object} state - Mutable pointer influence state.
 * @param {Array<object>} projectedNodes - Reused projected-node records.
 * @param {number} deltaSeconds - Elapsed frame time in seconds.
 * @param {object} config - Interaction radius and response configuration.
 * @returns {void}
 */
export function updatePointerInfluence(state, projectedNodes, deltaSeconds, config) {
  let targetInfluence = 0;
  let targetNodeId = -1;

  if (state.active) {
    findNearestNode(projectedNodes, state.x, state.y, config.radius, state.nearest);
    targetNodeId = state.nearest.nodeId;
    if (targetNodeId >= 0) {
      targetInfluence = 1 - state.nearest.distance / config.radius;
    }
  }

  const response = 1 - Math.exp(-config.influenceResponse * deltaSeconds);
  state.influence += (targetInfluence - state.influence) * response;
  state.nodeId = targetNodeId >= 0 ? targetNodeId : state.nodeId;
  if (state.influence < 0.005 && targetNodeId < 0) {
    state.influence = 0;
    state.nodeId = -1;
  }
}

/**
 * Finds and consumes a pending tap target without enabling camera tracking.
 *
 * @param {object} state - Mutable pointer influence state.
 * @param {Array<object>} projectedNodes - Reused projected-node records.
 * @param {number} radius - Maximum tap distance from a node.
 * @returns {number} Target node identifier, or negative one when absent.
 */
export function consumeTapTarget(state, projectedNodes, radius) {
  if (!state.tapPending) {
    return -1;
  }

  state.tapPending = false;
  findNearestNode(projectedNodes, state.x, state.y, radius, state.nearest);
  return state.nearest.nodeId;
}
