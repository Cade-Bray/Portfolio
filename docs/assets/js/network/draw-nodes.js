/**
 * Draws healthy nodes with depth-based size, opacity, and restrained glow.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {Array<object>} projectedNodes - Nodes projected into screen space.
 * @param {string} nodeColor - Resolved CSS color for healthy nodes.
 * @returns {void}
 */
export function drawNodes(context, projectedNodes, nodeColor) {
  context.save();
  context.fillStyle = nodeColor;
  context.shadowColor = nodeColor;

  projectedNodes.forEach((node) => {
    if (!node.visible) {
      return;
    }

    context.globalAlpha = node.opacity;
    context.shadowBlur = Math.min(8, node.radius * 2.2);
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fill();
  });

  context.restore();
}
