import { clamp } from "../utilities/clamp.js";

/**
 * Projects a three-dimensional network node into canvas coordinates.
 *
 * @param {object} node - Three-dimensional node position and radius.
 * @param {object} camera - Camera distance, focus, focal length, and zoom.
 * @param {object} viewport - Canvas width and height in CSS pixels.
 * @param {{x: number, y: number, z: number}} bounds - Scene half-extents used to keep nodes in view.
 * @returns {object} Screen position, radius, depth, opacity, and visibility.
 */
export function projectNode(node, camera, viewport, bounds) {
  const depth = Math.max(0.1, camera.distance + node.z);
  const perspective = camera.focalLength / depth;
  const maximumPerspective = camera.focalLength / (camera.distance - bounds.z);
  const safeMargin = Math.max(24, Math.min(viewport.width, viewport.height) * 0.06);
  const horizontalRange = Math.max(0, viewport.width / 2 - safeMargin);
  const verticalRange = Math.max(0, viewport.height / 2 - safeMargin);
  const horizontalSpread = horizontalRange / (bounds.x * maximumPerspective * camera.zoom);
  const verticalSpread = verticalRange / (bounds.y * maximumPerspective * camera.zoom);
  const x = viewport.width / 2
    + (node.x - camera.focusX) * perspective * horizontalSpread * camera.zoom;
  const y = viewport.height / 2
    + (node.y - camera.focusY) * perspective * verticalSpread * camera.zoom;
  const nearFactor = clamp((bounds.z - node.z) / (bounds.z * 2), 0, 1);
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
