import { eulerStep } from '../lib/dynamics/integrate/euler';
import { rk2Step } from '../lib/dynamics/integrate/rk2';
import { rk4Step } from '../lib/dynamics/integrate/rk4';
import { derivative, type System } from '../lib/dynamics/systems';

export type StartMessage = {
  readonly type: 'start';
  readonly system: System;
  readonly dt: number;
  readonly initial: readonly [number, number, number];
};

export type WorkerInboundMessage = StartMessage;

export type BatchMessage = {
  readonly type: 'batch';
  readonly pointsEuler: Float64Array;
  readonly pointsRk2: Float64Array;
  readonly pointsRk4: Float64Array;
  /** |Euler − RK4| and |RK2 − RK4| at the end of this batch — "agree, then part". */
  readonly eulerVsRk4: number;
  readonly rk2VsRk4: number;
  readonly elapsed: number;
};

export type WorkerOutboundMessage = BatchMessage;

const BATCH_SIZE = 500;

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

function distance(a: Float64Array, b: Float64Array): number {
  let sumSq = 0;
  for (let d = 0; d < 3; d++) {
    const diff = (b[d] as number) - (a[d] as number);
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq);
}

async function run(message: StartMessage, myGeneration: number): Promise<void> {
  const { system, dt, initial } = message;
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  let stateEuler = new Float64Array(initial);
  let stateRk2 = new Float64Array(initial);
  let stateRk4 = new Float64Array(initial);
  let elapsed = 0;

  while (generation === myGeneration) {
    const pointsEuler = new Float64Array(BATCH_SIZE * 3);
    const pointsRk2 = new Float64Array(BATCH_SIZE * 3);
    const pointsRk4 = new Float64Array(BATCH_SIZE * 3);

    for (let i = 0; i < BATCH_SIZE; i++) {
      stateEuler = eulerStep(stateEuler, dt, f);
      stateRk2 = rk2Step(stateRk2, dt, f);
      stateRk4 = rk4Step(stateRk4, dt, f);
      elapsed += dt;

      pointsEuler[i * 3] = stateEuler[0] as number;
      pointsEuler[i * 3 + 1] = stateEuler[1] as number;
      pointsEuler[i * 3 + 2] = stateEuler[2] as number;
      pointsRk2[i * 3] = stateRk2[0] as number;
      pointsRk2[i * 3 + 1] = stateRk2[1] as number;
      pointsRk2[i * 3 + 2] = stateRk2[2] as number;
      pointsRk4[i * 3] = stateRk4[0] as number;
      pointsRk4[i * 3 + 1] = stateRk4[1] as number;
      pointsRk4[i * 3 + 2] = stateRk4[2] as number;
    }

    const batchMessage: BatchMessage = {
      type: 'batch',
      pointsEuler,
      pointsRk2,
      pointsRk4,
      eulerVsRk4: distance(stateEuler, stateRk4),
      rk2VsRk4: distance(stateRk2, stateRk4),
      elapsed,
    };
    (self as unknown as Worker).postMessage(batchMessage, [
      pointsEuler.buffer,
      pointsRk2.buffer,
      pointsRk4.buffer,
    ]);

    // Yield to the event loop so 'start' messages (a parameter change) can
    // preempt this run instead of queuing behind an uninterrupted loop.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}

export {};
