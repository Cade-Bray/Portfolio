/**
 * Draws healthy network connections behind their endpoint nodes.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {Array<object>} edges - Network edges referencing node identifiers.
 * @param {Array<object>} projectedNodes - Nodes projected into screen space.
 * @param {string} lineColor - Resolved CSS color for healthy connections.
 * @returns {void}
 */
export function drawEdges(context, edges, projectedNodes, lineColor) {
  context.save();
  context.strokeStyle = lineColor;
  context.lineCap = "round";

  edges.forEach((edge) => {
    const source = projectedNodes[edge.sourceId];
    const target = projectedNodes[edge.targetId];

    if (!source.visible && !target.visible) {
      return;
    }

    context.globalAlpha = Math.min(source.opacity, target.opacity);
    context.lineWidth = 0.55 + Math.min(source.radius, target.radius) * 0.18;
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
    context.stroke();
  });

  context.restore();
}
