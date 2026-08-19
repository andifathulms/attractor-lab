import { describe, expect, it } from 'vitest';
import { BIFURCATION_INITIAL_STATE, INITIAL_STATE } from '../../lib/initial-state';

// Thomas and Halvorsen are cyclically symmetric: a trajectory starting on
// x=y=z never leaves that diagonal and collapses to its fixed point instead
// of the chaotic attractor. Every shared initial state in this app must
// therefore have three distinct components.
describe('shared initial states are asymmetric', () => {
  it.each([
    ['INITIAL_STATE', INITIAL_STATE],
    ['BIFURCATION_INITIAL_STATE', BIFURCATION_INITIAL_STATE],
  ])('%s is not on the x=y=z diagonal', (_name, state) => {
    const [x, y, z] = state;
    expect(x).not.toBe(y);
    expect(y).not.toBe(z);
    expect(x).not.toBe(z);
  });
});
