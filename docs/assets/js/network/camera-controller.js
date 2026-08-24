/**
 * Smoothly moves the camera toward a selected node and interaction zoom.
 *
 * @param {object} camera - Mutable camera state.
 * @param {object|null} targetNode - Influenced scene node, when available.
 * @param {number} influence - Pointer influence from zero to one.
 * @param {number} deltaSeconds - Elapsed frame time in seconds.
 * @param {object} config - Camera response and zoom configuration.
 * @returns {void}
 */
export function updateCamera(camera, targetNode, influence, deltaSeconds, config) {
  const response = 1 - Math.exp(-config.cameraResponse * deltaSeconds);
  const targetX = targetNode ? targetNode.x * influence : 0;
  const targetY = targetNode ? targetNode.y * influence : 0;
  const targetZoom = 1 + (config.maximumZoom - 1) * influence;

  camera.focusX += (targetX - camera.focusX) * response;
  camera.focusY += (targetY - camera.focusY) * response;
  camera.zoom += (targetZoom - camera.zoom) * response;
}
