import { step, type Integrator } from '../lib/dynamics/integrate';
import { largestLyapunovExponent } from '../lib/dynamics/lyapunov';
import { derivative, type System } from '../lib/dynamics/systems';

export type StartMessage = {
  readonly type: 'start';
  readonly system: System;
  readonly integrator: Integrator;
  readonly dt: number;
  readonly initial: readonly [number, number, number];
  /** One-shot: compute this many steps in one burst and stop, instead of streaming indefinitely. DESIGN.md §7. */
  readonly reducedMotionSteps?: number;
};

export type WorkerInboundMessage = StartMessage;

export type BatchMessage = {
  readonly type: 'batch';
  readonly points: Float64Array;
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

async function run(message: StartMessage, myGeneration: number): Promise<void> {
  const { system, integrator, dt, initial, reducedMotionSteps } = message;
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  if (reducedMotionSteps) {
    let state = new Float64Array(initial);
    const points = new Float64Array(reducedMotionSteps * 3);
    let elapsed = 0;
    for (let i = 0; i < reducedMotionSteps; i++) {
      state = step(integrator, state, dt, f);
      points[i * 3] = state[0] as number;
      points[i * 3 + 1] = state[1] as number;
      points[i * 3 + 2] = state[2] as number;
      elapsed += dt;
    }
    if (generation !== myGeneration) return;
    const batchMessage: BatchMessage = { type: 'batch', points, elapsed };
    (self as unknown as Worker).postMessage(batchMessage, [points.buffer]);

    const lyapunovMax = largestLyapunovExponent(
      system,
      integrator,
      new Float64Array(initial),
      dt,
      reducedMotionSteps
    );
    if (generation === myGeneration) {
      const metricsMessage: MetricsMessage = { type: 'metrics', lyapunovMax, elapsed };
      (self as unknown as Worker).postMessage(metricsMessage);
    }
    return;
  }

  let state = new Float64Array(initial);
  let elapsed = 0;
  let batchCount = 0;

  while (generation === myGeneration) {
    const batch = new Float64Array(BATCH_SIZE * 3);
    for (let i = 0; i < BATCH_SIZE; i++) {
      state = step(integrator, state, dt, f);
      batch[i * 3] = state[0] as number;
      batch[i * 3 + 1] = state[1] as number;
      batch[i * 3 + 2] = state[2] as number;
      elapsed += dt;
    }
    batchCount += 1;

    const batchMessage: BatchMessage = { type: 'batch', points: batch, elapsed };
    (self as unknown as Worker).postMessage(batchMessage, [batch.buffer]);

    if (batchCount % LYAPUNOV_EVERY_BATCHES === 0) {
      const lyapunovMax = largestLyapunovExponent(
        system,
        integrator,
        new Float64Array(initial),
        dt,
        batchCount * BATCH_SIZE
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
