import { getEdgeInfectionLevel } from "./infection-levels.js";

/**
 * Draws the white resting connection for one edge.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {object} source - Projected source node.
 * @param {object} target - Projected target node.
 * @returns {void}
 */
function drawBaseEdge(context, source, target) {
  context.globalAlpha = Math.min(source.opacity, target.opacity);
  context.lineWidth = 0.55 + Math.min(source.radius, target.radius) * 0.18;
  context.beginPath();
  context.moveTo(source.x, source.y);
  context.lineTo(target.x, target.y);
  context.stroke();
}

/**
 * Draws a thick moving segment that makes transmission visible beyond color.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {object} source - Projected source node.
 * @param {object} target - Projected target node.
 * @param {number} progress - Transmission progress from zero to one.
 * @returns {void}
 */
function drawTransmission(context, source, target, progress) {
  const tail = Math.max(0, progress - 0.22);
  const startX = source.x + (target.x - source.x) * tail;
  const startY = source.y + (target.y - source.y) * tail;
  const endX = source.x + (target.x - source.x) * progress;
  const endY = source.y + (target.y - source.y) * progress;
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.stroke();
}

/**
 * Draws a dashed infected connection with recovery fade.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {object} source - Projected source node.
 * @param {object} target - Projected target node.
 * @param {number} strength - Infection strength from zero to one.
 * @returns {void}
 */
function drawInfectedEdge(context, source, target, strength) {
  context.globalAlpha *= strength;
  context.lineWidth = 1.35 + strength;
  context.setLineDash([5, 4]);
  context.beginPath();
  context.moveTo(source.x, source.y);
  context.lineTo(target.x, target.y);
  context.stroke();
  context.setLineDash([]);
}

/**
 * Draws resting connections and their active infection overlays.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {Array<object>} edges - Network edges referencing node identifiers.
 * @param {Array<object>} projectedNodes - Nodes projected into screen space.
 * @param {string} lineColor - Resolved CSS color for healthy connections.
 * @param {string} dangerColor - Resolved CSS color for infected connections.
 * @param {number} time - Current animation timestamp.
 * @returns {void}
 */
export function drawEdges(context, edges, projectedNodes, lineColor, dangerColor, time) {
  context.save();
  context.lineCap = "round";

  edges.forEach((edge) => {
    const source = projectedNodes[edge.sourceId];
    const target = projectedNodes[edge.targetId];

    if (!source.visible && !target.visible) {
      return;
    }

    context.strokeStyle = lineColor;
    drawBaseEdge(context, source, target);
    if (edge.state === "healthy") {
      return;
    }

    context.strokeStyle = dangerColor;
    context.globalAlpha = Math.min(source.opacity, target.opacity);
    if (edge.state === "transmitting") {
      drawTransmission(context, source, target, edge.progress);
    } else {
      drawInfectedEdge(context, source, target, getEdgeInfectionLevel(edge, time));
    }
  });

  context.restore();
}
