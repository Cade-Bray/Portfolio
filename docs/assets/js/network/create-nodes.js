/**
 * Returns a random value inside an inclusive numeric range.
 *
 * @param {() => number} random - Random source returning values from zero to one.
 * @param {number} minimum - Lower range boundary.
 * @param {number} maximum - Upper range boundary.
 * @returns {number} Value inside the requested range.
 */
function randomBetween(random, minimum, maximum) {
  return minimum + random() * (maximum - minimum);
}

/**
 * Creates drifting network nodes inside a bounded three-dimensional scene.
 *
 * @param {number} count - Number of nodes to create.
 * @param {{x: number, y: number, z: number}} bounds - Scene half-extents.
 * @param {() => number} random - Random source returning values from zero to one.
 * @returns {Array<object>} Network node records with stable identifiers.
 */
export function createNodes(count, bounds, random) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: randomBetween(random, -bounds.x, bounds.x),
    y: randomBetween(random, -bounds.y, bounds.y),
    z: randomBetween(random, -bounds.z, bounds.z),
    vx: randomBetween(random, -0.028, 0.028),
    vy: randomBetween(random, -0.02, 0.02),
    vz: randomBetween(random, -0.024, 0.024),
    baseRadius: randomBetween(random, 2.1, 3.5),
    state: "healthy",
    stateUntil: 0,
    neighbors: [],
  }));
}
