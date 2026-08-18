import { rk4Step } from '../lib/dynamics/integrate/rk4';
import { detectCrossing, type Plane } from '../lib/dynamics/section';
import { derivative, type System } from '../lib/dynamics/systems';

export type StartMessage = {
  readonly type: 'start';
  readonly system: System;
  readonly dt: number;
  readonly initial: readonly [number, number, number];
  readonly plane: Plane;
  /** One-shot: compute this many steps in one burst and stop, instead of streaming indefinitely. DESIGN.md §7. */
  readonly reducedMotionSteps?: number;
};

export type WorkerInboundMessage = StartMessage;

export type BatchMessage = {
  readonly type: 'batch';
  readonly points: Float64Array;
  /** Interpolated crossing points found within this batch, flattened xyz triples. */
  readonly crossings: Float64Array;
  readonly elapsed: number;
};

export type WorkerOutboundMessage = BatchMessage;

const BATCH_SIZE = 500;

// Incremented on every 'start' so an in-flight run from a superseded
// parameter set stops posting once a newer one begins. Fixed to RK4 — the
// most trustworthy integrator available, since crossing accuracy matters
// here more than exposing a step-size demonstration.
let generation = 0;

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;
  if (message.type === 'start') {
    generation += 1;
    void run(message, generation);
  }
};

const BURN_IN_STEPS = 2000;

async function run(message: StartMessage, myGeneration: number): Promise<void> {
  const { system, dt, initial, plane, reducedMotionSteps } = message;
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  let state = new Float64Array(initial);

  // Settle onto the attractor before recording anything — starting from an
  // arbitrary initial condition, the transient's crossings sit far from the
  // attractor's characteristic range and would stretch the section plot's
  // auto-scale, squeezing the actual structure into a corner.
  for (let i = 0; i < BURN_IN_STEPS; i++) {
    state = rk4Step(state, dt, f);
  }

  if (reducedMotionSteps) {
    const points = new Float64Array(reducedMotionSteps * 3);
    const crossings: number[] = [];
    let elapsed = 0;

    for (let i = 0; i < reducedMotionSteps; i++) {
      const prev = state;
      state = rk4Step(state, dt, f);
      elapsed += dt;

      points[i * 3] = state[0] as number;
      points[i * 3 + 1] = state[1] as number;
      points[i * 3 + 2] = state[2] as number;

      const crossing = detectCrossing(prev, state, plane);
      if (crossing) {
        crossings.push(crossing[0] as number, crossing[1] as number, crossing[2] as number);
      }
    }

    if (generation !== myGeneration) return;
    const crossingsArray = new Float64Array(crossings);
    const batchMessage: BatchMessage = { type: 'batch', points, crossings: crossingsArray, elapsed };
    (self as unknown as Worker).postMessage(batchMessage, [points.buffer, crossingsArray.buffer]);
    return;
  }

  let elapsed = 0;

  while (generation === myGeneration) {
    const points = new Float64Array(BATCH_SIZE * 3);
    const crossings: number[] = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const prev = state;
      state = rk4Step(state, dt, f);
      elapsed += dt;

      points[i * 3] = state[0] as number;
      points[i * 3 + 1] = state[1] as number;
      points[i * 3 + 2] = state[2] as number;

      const crossing = detectCrossing(prev, state, plane);
      if (crossing) {
        crossings.push(crossing[0] as number, crossing[1] as number, crossing[2] as number);
      }
    }

    const crossingsArray = new Float64Array(crossings);
    const batchMessage: BatchMessage = { type: 'batch', points, crossings: crossingsArray, elapsed };
    (self as unknown as Worker).postMessage(batchMessage, [points.buffer, crossingsArray.buffer]);

    // Yield to the event loop so 'start' messages (a parameter change) can
    // preempt this run instead of queuing behind an uninterrupted loop.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}

export {};
