import { getNodeInfectionLevel } from "./infection-levels.js";

/**
 * Draws the white resting node beneath any active state.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {object} node - Projected node geometry.
 * @param {number} glowScale - Viewport-specific shadow intensity.
 * @returns {void}
 */
function drawBaseNode(context, node, glowScale) {
  context.globalAlpha = node.opacity;
  context.shadowBlur = Math.min(8, node.radius * 2.2) * glowScale;
  context.beginPath();
  context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
  context.fill();
}

/**
 * Draws a larger fill and outer ring so infection is not conveyed by hue alone.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {object} node - Projected node geometry.
 * @param {number} strength - Infection strength from zero to one.
 * @param {number} glowScale - Viewport-specific shadow intensity.
 * @returns {void}
 */
function drawInfectedNode(context, node, strength, glowScale) {
  context.globalAlpha = node.opacity * strength;
  context.shadowBlur = (6 + strength * 12) * glowScale;
  context.beginPath();
  context.arc(node.x, node.y, node.radius * (1 + strength * 0.4), 0, Math.PI * 2);
  context.fill();

  context.globalAlpha *= 0.72;
  context.lineWidth = 0.8 + strength * 1.2;
  context.beginPath();
  context.arc(node.x, node.y, node.radius * (1.8 + strength * 0.55), 0, Math.PI * 2);
  context.stroke();
}

/**
 * Draws healthy nodes and accessible infected-state overlays.
 *
 * @param {CanvasRenderingContext2D} context - Canvas drawing context.
 * @param {Array<object>} nodes - Network nodes carrying infection state.
 * @param {Array<object>} projectedNodes - Nodes projected into screen space.
 * @param {string} nodeColor - Resolved CSS color for healthy nodes.
 * @param {string} dangerColor - Resolved CSS color for infected nodes.
 * @param {number} time - Current animation timestamp.
 * @param {number} glowScale - Viewport-specific shadow intensity.
 * @returns {void}
 */
export function drawNodes(context, nodes, projectedNodes, nodeColor, dangerColor, time, glowScale) {
  context.save();

  for (let index = 0; index < projectedNodes.length; index += 1) {
    const projectedNode = projectedNodes[index];
    if (!projectedNode.visible) {
      continue;
    }

    context.fillStyle = nodeColor;
    context.shadowColor = nodeColor;
    drawBaseNode(context, projectedNode, glowScale);

    const strength = getNodeInfectionLevel(nodes[index], time);
    if (strength > 0) {
      context.fillStyle = dangerColor;
      context.strokeStyle = dangerColor;
      context.shadowColor = dangerColor;
      drawInfectedNode(context, projectedNode, strength, glowScale);
    }
  }

  context.restore();
}
