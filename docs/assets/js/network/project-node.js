import { clamp } from "../utilities/clamp.js";

/**
 * Projects a three-dimensional network node into canvas coordinates.
 *
 * @param {object} node - Three-dimensional node position and radius.
 * @param {object} camera - Camera distance, focus, focal length, and zoom.
 * @param {object} viewport - Canvas width and height in CSS pixels.
 * @param {number} maximumDepth - Scene depth half-extent used for opacity.
 * @returns {object} Screen position, radius, depth, opacity, and visibility.
 */
export function projectNode(node, camera, viewport, maximumDepth) {
  const depth = Math.max(0.1, camera.distance + node.z);
  const perspective = camera.focalLength / depth;
  const spread = Math.min(viewport.width * 0.72, viewport.height * 0.9);
  const x = viewport.width / 2 + (node.x - camera.focusX) * perspective * spread * camera.zoom;
  const y = viewport.height / 2 + (node.y - camera.focusY) * perspective * spread * camera.zoom;
  const nearFactor = clamp((maximumDepth - node.z) / (maximumDepth * 2), 0, 1);
  const radius = node.baseRadius * perspective * camera.zoom;

  return {
    x,
    y,
    radius,
    depth,
    opacity: 0.22 + nearFactor * 0.7,
    visible: x >= -radius && x <= viewport.width + radius
      && y >= -radius && y <= viewport.height + radius,
  };
}
