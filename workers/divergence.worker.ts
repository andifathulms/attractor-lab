import { step, type Integrator } from '../lib/dynamics/integrate';
import { largestLyapunovExponent } from '../lib/dynamics/lyapunov';
import { derivative, type System } from '../lib/dynamics/systems';

export type StartMessage = {
  readonly type: 'start';
  readonly system: System;
  readonly integrator: Integrator;
  readonly dt: number;
  readonly initial: readonly [number, number, number];
  readonly epsilon: number;
  /** One-shot: compute this many steps in one burst and stop, instead of streaming indefinitely. DESIGN.md §7. */
  readonly reducedMotionSteps?: number;
};

export type WorkerInboundMessage = StartMessage;

export type BatchMessage = {
  readonly type: 'batch';
  /** Trajectory A, from `initial`. */
  readonly pointsA: Float64Array;
  /** Trajectory B, from `initial` perturbed by `epsilon` in x. */
  readonly pointsB: Float64Array;
  /** |B − A| at each corresponding point, one entry per point. */
  readonly separations: Float64Array;
  /** Elapsed system time at each corresponding point, one entry per point. */
  readonly times: Float64Array;
  readonly elapsed: number;
};

export type MetricsMessage = {
  readonly type: 'metrics';
  readonly lyapunovMax: number;
  readonly elapsed: number;
};

export type WorkerOutboundMessage = BatchMessage | MetricsMessage;

const BATCH_SIZE = 500;
const LYAPUNOV_EVERY_BATCHES = 20;

// Incremented on every 'start' so an in-flight run from a superseded
// parameter set stops posting once a newer one begins.
let generation = 0;

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;
  if (message.type === 'start') {
    generation += 1;
    void run(message, generation);
  }
};

function separation(a: Float64Array, b: Float64Array): number {
  let sumSq = 0;
  for (let d = 0; d < 3; d++) {
    const diff = (b[d] as number) - (a[d] as number);
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq);
}

async function run(message: StartMessage, myGeneration: number): Promise<void> {
  const { system, integrator, dt, initial, epsilon, reducedMotionSteps } = message;
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  if (reducedMotionSteps) {
    let stateA = new Float64Array(initial);
    let stateB = new Float64Array(initial);
    stateB[0] = (stateB[0] as number) + epsilon;

    const pointsA = new Float64Array(reducedMotionSteps * 3);
    const pointsB = new Float64Array(reducedMotionSteps * 3);
    const separations = new Float64Array(reducedMotionSteps);
    const times = new Float64Array(reducedMotionSteps);
    let elapsed = 0;

    for (let i = 0; i < reducedMotionSteps; i++) {
      stateA = step(integrator, stateA, dt, f);
      stateB = step(integrator, stateB, dt, f);
      elapsed += dt;

      pointsA[i * 3] = stateA[0] as number;
      pointsA[i * 3 + 1] = stateA[1] as number;
      pointsA[i * 3 + 2] = stateA[2] as number;
      pointsB[i * 3] = stateB[0] as number;
      pointsB[i * 3 + 1] = stateB[1] as number;
      pointsB[i * 3 + 2] = stateB[2] as number;
      separations[i] = separation(stateA, stateB);
      times[i] = elapsed;
    }

    if (generation !== myGeneration) return;
    const batchMessage: BatchMessage = { type: 'batch', pointsA, pointsB, separations, times, elapsed };
    (self as unknown as Worker).postMessage(batchMessage, [
      pointsA.buffer,
      pointsB.buffer,
      separations.buffer,
      times.buffer,
    ]);

    const lyapunovMax = largestLyapunovExponent(
      system,
      integrator,
      new Float64Array(initial),
      dt,
      reducedMotionSteps,
      { epsilon }
    );
    if (generation === myGeneration) {
      const metricsMessage: MetricsMessage = { type: 'metrics', lyapunovMax, elapsed };
      (self as unknown as Worker).postMessage(metricsMessage);
    }
    return;
  }

  let stateA = new Float64Array(initial);
  let stateB = new Float64Array(initial);
  stateB[0] = (stateB[0] as number) + epsilon;

  let elapsed = 0;
  let batchCount = 0;

  while (generation === myGeneration) {
    const pointsA = new Float64Array(BATCH_SIZE * 3);
    const pointsB = new Float64Array(BATCH_SIZE * 3);
    const separations = new Float64Array(BATCH_SIZE);
    const times = new Float64Array(BATCH_SIZE);

    for (let i = 0; i < BATCH_SIZE; i++) {
      stateA = step(integrator, stateA, dt, f);
      stateB = step(integrator, stateB, dt, f);
      elapsed += dt;

      pointsA[i * 3] = stateA[0] as number;
      pointsA[i * 3 + 1] = stateA[1] as number;
      pointsA[i * 3 + 2] = stateA[2] as number;
      pointsB[i * 3] = stateB[0] as number;
      pointsB[i * 3 + 1] = stateB[1] as number;
      pointsB[i * 3 + 2] = stateB[2] as number;
      separations[i] = separation(stateA, stateB);
      times[i] = elapsed;
    }
    batchCount += 1;

    const batchMessage: BatchMessage = {
      type: 'batch',
      pointsA,
      pointsB,
      separations,
      times,
      elapsed,
    };
    (self as unknown as Worker).postMessage(batchMessage, [
      pointsA.buffer,
      pointsB.buffer,
      separations.buffer,
      times.buffer,
    ]);

    if (batchCount % LYAPUNOV_EVERY_BATCHES === 0) {
      const lyapunovMax = largestLyapunovExponent(
        system,
        integrator,
        new Float64Array(initial),
        dt,
        batchCount * BATCH_SIZE,
        { epsilon }
      );
      if (generation === myGeneration) {
        const metricsMessage: MetricsMessage = { type: 'metrics', lyapunovMax, elapsed };
        (self as unknown as Worker).postMessage(metricsMessage);
      }
    }

    // Yield to the event loop so 'start' messages (a parameter change) can
    // preempt this run instead of queuing behind an uninterrupted loop.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}

export {};
