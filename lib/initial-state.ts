/**
 * Both cyclically symmetric systems in this app (Thomas, Halvorsen — x, y
 * and z play interchangeable roles in their equations) have the line
 * x=y=z as an invariant subspace: a trajectory starting exactly on it
 * never leaves, and collapses onto whichever fixed point sits there
 * instead of showing the chaotic attractor. Every initial state used
 * anywhere in this app is therefore deliberately asymmetric, so it works
 * the same way for every system rather than needing a per-system carve-out.
 *
 * `INITIAL_STATE` is the small-scale start used by every trajectory
 * render and check that mirrors one (the canvases, the verify check).
 * `BIFURCATION_INITIAL_STATE` is the larger-scale start used where a
 * bigger perturbation was already the convention (the bifurcation sweep,
 * the live constants verification) — kept separate rather than unified,
 * since nothing here depends on the two matching each other.
 */
export const INITIAL_STATE: readonly [number, number, number] = [0.1, 0.15, 0.12];
export const BIFURCATION_INITIAL_STATE: readonly [number, number, number] = [1, 1.15, 0.9];
