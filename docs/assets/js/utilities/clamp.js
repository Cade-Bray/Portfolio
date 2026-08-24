/**
 * Restricts a number to an inclusive range.
 *
 * @param {number} value - Value to restrict.
 * @param {number} minimum - Smallest allowed result.
 * @param {number} maximum - Largest allowed result.
 * @returns {number} The restricted value.
 */
export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}
