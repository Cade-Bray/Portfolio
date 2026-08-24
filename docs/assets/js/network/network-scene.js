import { getNetworkNodeCount, NETWORK_CONFIG } from "../config/network-config.js";
import { createSeededRandom } from "../utilities/random.js";
import { resizeCanvasToDisplaySize } from "../utilities/viewport.js";
import { createEdges } from "./create-edges.js";
import { createNodes } from "./create-nodes.js";
import { drawEdges } from "./draw-edges.js";
import { drawNodes } from "./draw-nodes.js";
import { projectNode } from "./project-node.js";
import { updateNodeMotion } from "./update-motion.js";

/**
 * Resolves canvas colors from the shared CSS palette.
 *
 * @returns {{line: string, node: string}} Healthy network colors.
 */
function getNetworkColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    line: styles.getPropertyValue("--color-line").trim() || "rgba(255, 255, 255, 0.3)",
    node: styles.getPropertyValue("--color-node").trim() || "#fff",
  };
}

/**
 * Creates and runs the decorative hero network lifecycle. Observer ownership
 * stays in one closure so every listener shares a single cleanup path.
 *
 * @param {HTMLElement} hero - Hero element used for visibility observation.
 * @param {HTMLCanvasElement} canvas - Decorative network canvas.
 * @returns {() => void} Cleanup function for observers and animation work.
 */
export function initializeNetworkScene(hero, canvas) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return () => {};
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const camera = { ...NETWORK_CONFIG.camera, focusX: 0, focusY: 0 };
  const colors = getNetworkColors();
  let nodes = [];
  let edges = [];
  let projectedNodes = [];
  let viewport = { width: 0, height: 0, pixelRatio: 1 };
  let nodeCount = 0;
  let animationFrame = 0;
  let lastTime = 0;
  let heroVisible = true;
  let resizePending = true;

  const rebuildGraph = () => {
    nodeCount = getNetworkNodeCount(hero.clientWidth, motionQuery.matches);
    const random = createSeededRandom(80134 + nodeCount);
    nodes = createNodes(nodeCount, NETWORK_CONFIG.bounds, random);
    edges = createEdges(nodes, NETWORK_CONFIG.maximumDegree, NETWORK_CONFIG.extraEdgeRatio);
  };

  const resizeScene = () => {
    viewport = resizeCanvasToDisplaySize(canvas, NETWORK_CONFIG.maximumPixelRatio);
    context.setTransform(viewport.pixelRatio, 0, 0, viewport.pixelRatio, 0, 0);
    const nextCount = getNetworkNodeCount(viewport.width, motionQuery.matches);
    if (nextCount !== nodeCount) {
      rebuildGraph();
    }
    resizePending = false;
  };

  const canRender = () => heroVisible
    && document.visibilityState === "visible"
    && viewport.width > 0
    && viewport.height > 0;

  const requestFrame = () => {
    if (!animationFrame && heroVisible && document.visibilityState === "visible") {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  const renderFrame = (time) => {
    animationFrame = 0;
    if (resizePending) {
      resizeScene();
    }
    if (!canRender()) {
      return;
    }

    const deltaSeconds = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    if (!motionQuery.matches) {
      updateNodeMotion(nodes, NETWORK_CONFIG.bounds, deltaSeconds);
    }

    projectedNodes = nodes.map((node) => (
      projectNode(node, camera, viewport, NETWORK_CONFIG.bounds)
    ));
    context.clearRect(0, 0, viewport.width, viewport.height);
    drawEdges(context, edges, projectedNodes, colors.line);
    drawNodes(context, projectedNodes, colors.node);

    if (!motionQuery.matches) {
      requestFrame();
    }
  };

  const refreshScene = () => {
    resizePending = true;
    lastTime = 0;
    requestFrame();
  };

  const handleVisibility = () => {
    lastTime = 0;
    requestFrame();
  };

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting && entry.intersectionRatio > 0.05;
    if (!heroVisible && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    handleVisibility();
  }, { threshold: [0, 0.05] });

  const resizeObserver = new ResizeObserver(refreshScene);
  visibilityObserver.observe(hero);
  resizeObserver.observe(canvas);
  document.addEventListener("visibilitychange", handleVisibility);
  motionQuery.addEventListener("change", refreshScene);
  rebuildGraph();
  requestFrame();

  return () => {
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", handleVisibility);
    motionQuery.removeEventListener("change", refreshScene);
    window.cancelAnimationFrame(animationFrame);
  };
}
