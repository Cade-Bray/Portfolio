import { getNetworkNodeCount, getNetworkRenderQuality, NETWORK_CONFIG } from "../config/network-config.js";
import { createRandomSeed, createSeededRandom } from "../utilities/random.js";
import { resizeCanvasToDisplaySize } from "../utilities/viewport.js";
import { updateCamera } from "./camera-controller.js";
import { createEdges } from "./create-edges.js";
import { createNodes } from "./create-nodes.js";
import { drawEdges } from "./draw-edges.js";
import { drawNodes } from "./draw-nodes.js";
import { createInfectionEngine, triggerOutbreak, updateInfection } from "./infection-engine.js";
import {
  consumeTapTarget,
  createPointerInfluence,
  updatePointerInfluence,
} from "./pointer-influence.js";
import { initializePointerTracker } from "./pointer-tracker.js";
import { prepareProjectionFrame, projectNodeInto } from "./project-node.js";
import { updateNodeMotion } from "./update-motion.js";

/**
 * Resolves canvas colors from the shared CSS palette.
 *
 * @returns {{line: string, node: string, danger: string}} Resolved network colors.
 */
function getNetworkColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    line: styles.getPropertyValue("--color-line").trim() || "rgba(255, 255, 255, 0.3)",
    node: styles.getPropertyValue("--color-node").trim() || "#fff",
    danger: styles.getPropertyValue("--color-danger").trim() || "#ff3b3b",
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
  const sceneSeed = createRandomSeed();
  const pointer = createPointerInfluence();
  let nodes = [];
  let edges = [];
  let infectionEngine;
  let projectedNodes = [];
  const projectionFrame = {};
  let viewport = { width: 0, height: 0, pixelRatio: 1 };
  let renderQuality = NETWORK_CONFIG.renderQuality.standard;
  let nodeCount = 0;
  let animationFrame = 0;
  let lastTime = 0;
  let heroVisible = true;
  let resizePending = true;

  const rebuildGraph = () => {
    nodeCount = getNetworkNodeCount(hero.clientWidth, motionQuery.matches);
    const random = createSeededRandom(sceneSeed + nodeCount);
    nodes = createNodes(nodeCount, NETWORK_CONFIG.bounds, random);
    edges = createEdges(nodes, NETWORK_CONFIG.maximumDegree, NETWORK_CONFIG.extraEdgeRatio);
    projectedNodes = Array.from({ length: nodeCount }, () => ({ visible: false }));
    pointer.active = false;
    pointer.nodeId = -1;
    pointer.influence = 0;
    pointer.tapPending = false;
    pointer.lastBurstNodeId = -1;
    pointer.burstNodeId = -1;
    if (motionQuery.matches) {
      Object.assign(camera, NETWORK_CONFIG.camera, { focusX: 0, focusY: 0 });
    }
    infectionEngine = createInfectionEngine(
      nodes,
      edges,
      createSeededRandom(sceneSeed ^ (0x9e3779b9 + nodeCount)),
      NETWORK_CONFIG.infection,
      motionQuery.matches,
    );
  };

  const resizeScene = () => {
    renderQuality = getNetworkRenderQuality(canvas.clientWidth, motionQuery.matches);
    viewport = resizeCanvasToDisplaySize(canvas, renderQuality.maximumPixelRatio);
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
    updateInfection(infectionEngine, time);

    prepareProjectionFrame(projectionFrame, camera, viewport, NETWORK_CONFIG.bounds);
    for (let index = 0; index < nodes.length; index += 1) {
      projectNodeInto(
        nodes[index],
        camera,
        projectionFrame,
        NETWORK_CONFIG.bounds,
        projectedNodes[index],
      );
    }
    if (!motionQuery.matches) {
      updatePointerInfluence(
        pointer,
        projectedNodes,
        deltaSeconds,
        time,
        NETWORK_CONFIG.interaction,
      );
      if (pointer.burstNodeId >= 0) {
        triggerOutbreak(infectionEngine, pointer.burstNodeId, time, pointer.burstIntensity);
        pointer.burstNodeId = -1;
      }
      const tapTarget = consumeTapTarget(
        pointer,
        projectedNodes,
        NETWORK_CONFIG.interaction.radius * 1.15,
      );
      if (tapTarget >= 0) {
        triggerOutbreak(infectionEngine, tapTarget, time, 0);
      }
      const targetNode = pointer.nodeId >= 0 ? nodes[pointer.nodeId] : null;
      updateCamera(
        camera,
        targetNode,
        pointer.influence,
        deltaSeconds,
        NETWORK_CONFIG.interaction,
      );
    }
    context.clearRect(0, 0, viewport.width, viewport.height);
    drawEdges(context, edges, projectedNodes, colors.line, colors.danger, time);
    drawNodes(
      context, nodes, projectedNodes, colors.node, colors.danger, time,
      renderQuality.glowScale,
    );

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
    if (document.visibilityState !== "visible" && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      return;
    }
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
  const destroyPointerTracker = initializePointerTracker(hero, pointer, NETWORK_CONFIG.interaction);
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
    destroyPointerTracker();
    window.cancelAnimationFrame(animationFrame);
  };
}
