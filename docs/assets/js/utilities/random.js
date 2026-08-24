/**
 * Creates a deterministic pseudo-random number generator for repeatable scenes.
 *
 * @param {number} seed - Unsigned seed used to initialize the sequence.
 * @returns {() => number} Function returning values from zero up to one.
 */
export function createSeededRandom(seed) {
  let state = seed >>> 0 || 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
