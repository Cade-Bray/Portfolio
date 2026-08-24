/**
 * Calculates squared three-dimensional distance without allocating a vector.
 *
 * @param {object} first - First network node.
 * @param {object} second - Second network node.
 * @returns {number} Squared distance between the nodes.
 */
function distanceSquared(first, second) {
  const x = first.x - second.x;
  const y = first.y - second.y;
  const z = first.z - second.z;
  return x * x + y * y + z * z;
}

/**
 * Adds a unique edge and synchronizes both nodes' adjacency lists.
 *
 * @param {Array<object>} edges - Mutable edge collection.
 * @param {Set<string>} keys - Existing undirected edge keys.
 * @param {Array<object>} nodes - Network nodes indexed by identifier.
 * @param {number} sourceId - First endpoint identifier.
 * @param {number} targetId - Second endpoint identifier.
 * @returns {void}
 */
function addEdge(edges, keys, nodes, sourceId, targetId) {
  const low = Math.min(sourceId, targetId);
  const high = Math.max(sourceId, targetId);
  const key = `${low}:${high}`;

  if (keys.has(key)) {
    return;
  }

  const edgeId = edges.length;
  keys.add(key);
  nodes[sourceId].neighbors.push(targetId);
  nodes[sourceId].neighborEdges.push(edgeId);
  nodes[targetId].neighbors.push(sourceId);
  nodes[targetId].neighborEdges.push(edgeId);
  edges.push({
    id: edgeId,
    sourceId,
    targetId,
    state: "healthy",
    progress: 0,
    stateStarted: 0,
    recoveryStarted: 0,
    stateUntil: 0,
  });
}

/**
 * Connects every node through a proximity-based spanning tree.
 *
 * @param {Array<object>} nodes - Network nodes to connect.
 * @param {Array<object>} edges - Mutable edge collection.
 * @param {Set<string>} keys - Existing undirected edge keys.
 * @param {number} maximumDegree - Preferred maximum neighbor count.
 * @returns {void}
 */
function addSpanningTree(nodes, edges, keys, maximumDegree) {
  for (let index = 1; index < nodes.length; index += 1) {
    const candidates = nodes.slice(0, index).sort((first, second) => (
      distanceSquared(nodes[index], first) - distanceSquared(nodes[index], second)
    ));
    const target = candidates.find((node) => node.neighbors.length < maximumDegree) ?? candidates[0];
    addEdge(edges, keys, nodes, index, target.id);
  }
}

/**
 * Builds an ordered list of possible proximity edges for graph enrichment.
 *
 * @param {Array<object>} nodes - Network nodes to compare.
 * @returns {Array<object>} Candidate endpoint pairs sorted by distance.
 */
function getCandidateEdges(nodes) {
  const candidates = [];

  for (let sourceId = 0; sourceId < nodes.length; sourceId += 1) {
    for (let targetId = sourceId + 1; targetId < nodes.length; targetId += 1) {
      candidates.push({
        sourceId,
        targetId,
        distance: distanceSquared(nodes[sourceId], nodes[targetId]),
      });
    }
  }

  return candidates.sort((first, second) => first.distance - second.distance);
}

/**
 * Creates a connected sparse graph and records adjacency on every node.
 *
 * @param {Array<object>} nodes - Network nodes to connect.
 * @param {number} maximumDegree - Preferred maximum neighbors per node.
 * @param {number} extraEdgeRatio - Additional edges as a ratio of node count.
 * @returns {Array<object>} Connected network edges.
 */
export function createEdges(nodes, maximumDegree, extraEdgeRatio) {
  const edges = [];
  const keys = new Set();
  const targetCount = Math.floor((nodes.length - 1) + nodes.length * extraEdgeRatio);

  nodes.forEach((node) => {
    node.neighbors.length = 0;
    node.neighborEdges.length = 0;
  });

  addSpanningTree(nodes, edges, keys, maximumDegree);

  for (const candidate of getCandidateEdges(nodes)) {
    if (edges.length >= targetCount) {
      break;
    }

    const source = nodes[candidate.sourceId];
    const target = nodes[candidate.targetId];
    if (source.neighbors.length < maximumDegree && target.neighbors.length < maximumDegree) {
      addEdge(edges, keys, nodes, source.id, target.id);
    }
  }

  return edges;
}
