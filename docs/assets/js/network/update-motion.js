/**
 * Moves one node coordinate and gently reverses its velocity at a boundary.
 *
 * @param {object} node - Mutable network node.
 * @param {string} positionKey - Position property to update.
 * @param {string} velocityKey - Velocity property to update.
 * @param {number} boundary - Positive half-extent for the coordinate.
 * @param {number} deltaSeconds - Elapsed time in seconds.
 * @returns {void}
 */
function moveWithinBoundary(node, positionKey, velocityKey, boundary, deltaSeconds) {
  node[positionKey] += node[velocityKey] * deltaSeconds;

  if (node[positionKey] > boundary) {
    node[positionKey] = boundary;
    node[velocityKey] = -Math.abs(node[velocityKey]);
  } else if (node[positionKey] < -boundary) {
    node[positionKey] = -boundary;
    node[velocityKey] = Math.abs(node[velocityKey]);
  }
}

/**
 * Advances every node through the bounded three-dimensional scene.
 *
 * @param {Array<object>} nodes - Mutable network nodes.
 * @param {{x: number, y: number, z: number}} bounds - Scene half-extents.
 * @param {number} deltaSeconds - Elapsed time in seconds.
 * @returns {void}
 */
export function updateNodeMotion(nodes, bounds, deltaSeconds) {
  nodes.forEach((node) => {
    moveWithinBoundary(node, "x", "vx", bounds.x, deltaSeconds);
    moveWithinBoundary(node, "y", "vy", bounds.y, deltaSeconds);
    moveWithinBoundary(node, "z", "vz", bounds.z, deltaSeconds);
  });
}
