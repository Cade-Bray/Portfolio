/**
 * Synchronizes a canvas backing store with its displayed size.
 *
 * @param {HTMLCanvasElement} canvas - Canvas to resize.
 * @param {number} maximumPixelRatio - Upper device-pixel-ratio limit.
 * @returns {{width: number, height: number, pixelRatio: number, resized: boolean}} Viewport details in CSS pixels.
 */
export function resizeCanvasToDisplaySize(canvas, maximumPixelRatio) {
  const width = Math.max(0, Math.round(canvas.clientWidth));
  const height = Math.max(0, Math.round(canvas.clientHeight));
  const pixelRatio = Math.min(window.devicePixelRatio || 1, maximumPixelRatio);
  const backingWidth = Math.round(width * pixelRatio);
  const backingHeight = Math.round(height * pixelRatio);
  const resized = canvas.width !== backingWidth || canvas.height !== backingHeight;

  if (resized) {
    canvas.width = backingWidth;
    canvas.height = backingHeight;
  }

  return { width, height, pixelRatio, resized };
}
