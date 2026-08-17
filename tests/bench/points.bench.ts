/**
 * Point-budget benchmark. Measures pure integration throughput — the
 * worker's bottleneck for how many trajectory points it can produce per
 * second — against a sustained-streaming target, scaled by a conservative
 * mobile CPU slowdown factor.
 *
 * Scope: this is a Node script with no DOM, so it cannot measure actual
 * canvas draw cost or real device frame rate — only the computational half
 * of "point budget + frame rate" from CLAUDE.md's command list. The canvas
 * side was verified interactively (drag/zoom stayed responsive at the
 * point counts exercised during manual browser testing across all four
 * instrument pages); this script exists to catch a regression that makes
 * the integrator itself too slow to keep the worker's stream flowing.
 */
import { rk4Step } from '../../lib/dynamics/integrate/rk4';
import { classicSystem, derivative, type SystemId } from '../../lib/dynamics/systems';

const BATCH_SIZE = 500; // must match workers/*.worker.ts
const STEPS_PER_SYSTEM = 1_000_000;

// Chrome DevTools' "Low-end mobile" CPU throttling preset is 6x; padded to
// 8x to stay conservative for a genuinely mid-range (not high-end) phone.
const MOBILE_SLOWDOWN_FACTOR = 8;

// Comfortably smooth continuous accumulation: 40 batches/sec of BATCH_SIZE
// points is well beyond what the "density builds over seconds" aesthetic
// (DESIGN.md §7) actually needs — this is a generous floor, not a target
// to just barely clear.
const TARGET_SUSTAINED_POINTS_PER_SEC = 20_000;
const REQUIRED_DESKTOP_POINTS_PER_SEC = TARGET_SUSTAINED_POINTS_PER_SEC * MOBILE_SLOWDOWN_FACTOR;

function benchSystem(id: SystemId): number {
  const system = classicSystem[id];
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);
  let state = new Float64Array([0.1, 0.1, 0.1]);

  const start = performance.now();
  for (let i = 0; i < STEPS_PER_SYSTEM; i++) {
    state = rk4Step(state, 0.005, f);
  }
  const elapsedMs = performance.now() - start;
  return STEPS_PER_SYSTEM / (elapsedMs / 1000);
}

function main(): void {
  const systemIds = Object.keys(classicSystem) as SystemId[];
  const results = systemIds.map((id) => ({ id, pointsPerSec: benchSystem(id) }));

  console.log(`Point budget: RK4 integration throughput (batch size ${BATCH_SIZE})`);
  console.log(`Required (desktop, ${MOBILE_SLOWDOWN_FACTOR}x mobile margin): ${REQUIRED_DESKTOP_POINTS_PER_SEC.toLocaleString()} pts/sec\n`);

  let worst = results[0] as { id: SystemId; pointsPerSec: number };
  for (const result of results) {
    const status = result.pointsPerSec >= REQUIRED_DESKTOP_POINTS_PER_SEC ? 'OK' : 'FAIL';
    console.log(`  ${result.id.padEnd(10)} ${Math.round(result.pointsPerSec).toLocaleString().padStart(12)} pts/sec  ${status}`);
    if (result.pointsPerSec < worst.pointsPerSec) worst = result;
  }

  const passed = worst.pointsPerSec >= REQUIRED_DESKTOP_POINTS_PER_SEC;
  console.log(
    `\n${passed ? 'PASS' : 'FAIL'} — worst case (${worst.id}) at ${Math.round(worst.pointsPerSec).toLocaleString()} pts/sec, ` +
      `estimated mobile throughput ${Math.round(worst.pointsPerSec / MOBILE_SLOWDOWN_FACTOR).toLocaleString()} pts/sec ` +
      `(target ${TARGET_SUSTAINED_POINTS_PER_SEC.toLocaleString()})`
  );

  if (!passed) process.exit(1);
}

main();
