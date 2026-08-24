export const NETWORK_CONFIG = Object.freeze({
  nodeCounts: Object.freeze({
    large: 56,
    standard: 42,
    mobile: 28,
    reducedMotion: 18,
  }),
  breakpoints: Object.freeze({
    large: 1280,
    mobile: 768,
  }),
  bounds: Object.freeze({
    x: 1,
    y: 0.72,
    z: 0.65,
  }),
  camera: Object.freeze({
    distance: 2.5,
    focalLength: 1.75,
    zoom: 1,
  }),
  maximumDegree: 4,
  extraEdgeRatio: 0.55,
  maximumPixelRatio: 2,
});

/**
 * Chooses a graph size for the current viewport and motion preference.
 *
 * @param {number} viewportWidth - Current viewport width in CSS pixels.
 * @param {boolean} reducedMotion - Whether the user requests reduced motion.
 * @returns {number} Number of network nodes to create.
 */
export function getNetworkNodeCount(viewportWidth, reducedMotion) {
  if (reducedMotion) {
    return NETWORK_CONFIG.nodeCounts.reducedMotion;
  }

  if (viewportWidth < NETWORK_CONFIG.breakpoints.mobile) {
    return NETWORK_CONFIG.nodeCounts.mobile;
  }

  if (viewportWidth >= NETWORK_CONFIG.breakpoints.large) {
    return NETWORK_CONFIG.nodeCounts.large;
  }

  return NETWORK_CONFIG.nodeCounts.standard;
}
