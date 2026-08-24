import { clamp } from "../utilities/clamp.js";

/**
 * Precomputes viewport projection values once for an animation frame.
 *
 * @param {object} target - Reusable projection-frame record.
 * @param {object} camera - Camera distance, focus, focal length, and zoom.
 * @param {object} viewport - Canvas width and height in CSS pixels.
 * @param {{x: number, y: number, z: number}} bounds - Scene half-extents.
 * @returns {object} The updated reusable projection-frame record.
 */
export function prepareProjectionFrame(target, camera, viewport, bounds) {
  const maximumPerspective = camera.focalLength / (camera.distance - bounds.z);
  const safeMargin = Math.max(24, Math.min(viewport.width, viewport.height) * 0.06);
  target.centerX = viewport.width / 2;
  target.centerY = viewport.height / 2;
  target.width = viewport.width;
  target.height = viewport.height;
  target.horizontalSpread = Math.max(0, target.centerX - safeMargin)
    / (bounds.x * maximumPerspective);
  target.verticalSpread = Math.max(0, target.centerY - safeMargin)
    / (bounds.y * maximumPerspective);
  return target;
}

/**
 * Projects a node into a caller-owned record without allocating per frame.
 *
 * @param {object} node - Three-dimensional node position and radius.
 * @param {object} camera - Camera distance, focus, focal length, and zoom.
 * @param {object} frame - Precomputed projection-frame values.
 * @param {{x: number, y: number, z: number}} bounds - Scene half-extents.
 * @param {object} target - Reusable projected-node record.
 * @returns {object} The updated projected-node record.
 */
export function projectNodeInto(node, camera, frame, bounds, target) {
  const depth = Math.max(0.1, camera.distance + node.z);
  const perspective = camera.focalLength / depth;
  target.x = frame.centerX
    + (node.x - camera.focusX) * perspective * frame.horizontalSpread * camera.zoom;
  target.y = frame.centerY
    + (node.y - camera.focusY) * perspective * frame.verticalSpread * camera.zoom;
  target.radius = node.baseRadius * perspective * camera.zoom;
  target.depth = depth;
  target.opacity = 0.22 + clamp((bounds.z - node.z) / (bounds.z * 2), 0, 1) * 0.7;
  target.visible = target.x >= -target.radius && target.x <= frame.width + target.radius
    && target.y >= -target.radius && target.y <= frame.height + target.radius;
  return target;
}

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
  const frame = prepareProjectionFrame({}, camera, viewport, bounds);
  return projectNodeInto(node, camera, frame, bounds, {});
}
