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
  interaction: Object.freeze({
    radius: 140,
    influenceResponse: 11,
    cameraResponse: 7,
    maximumZoom: 1.48,
    tapMaximumDistance: 12,
    tapMaximumDuration: 350,
  }),
  infection: Object.freeze({
    ambientDelayMinimum: 3500,
    ambientDelayMaximum: 7000,
    nodeFadeMinimum: 250,
    nodeFadeMaximum: 450,
    transmissionDelayMinimum: 350,
    transmissionDelayMaximum: 750,
    transmissionDurationMinimum: 350,
    transmissionDurationMaximum: 700,
    nodeHoldMinimum: 2500,
    nodeHoldMaximum: 5000,
    nodeRecoveryMinimum: 500,
    nodeRecoveryMaximum: 850,
    edgeHoldMinimum: 1500,
    edgeHoldMaximum: 2600,
    edgeRecoveryMinimum: 500,
    edgeRecoveryMaximum: 900,
    secondHopChance: 0.45,
    maximumActiveRatio: 0.15,
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
