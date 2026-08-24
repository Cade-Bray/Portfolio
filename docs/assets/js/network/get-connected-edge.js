/**
 * Finds the edge shared by two adjacent nodes without allocating a lookup key.
 *
 * @param {Array<object>} nodes - Network nodes with parallel neighbor arrays.
 * @param {Array<object>} edges - Network edges indexed by identifier.
 * @param {number} sourceId - First endpoint identifier.
 * @param {number} targetId - Second endpoint identifier.
 * @returns {object|null} Shared edge, or null when nodes are not adjacent.
 */
export function getConnectedEdge(nodes, edges, sourceId, targetId) {
  const neighborIndex = nodes[sourceId].neighbors.indexOf(targetId);
  return neighborIndex >= 0 ? edges[nodes[sourceId].neighborEdges[neighborIndex]] : null;
}
