import { localMaxima, type LocalMaximaConfig } from '../lib/dynamics/bifurcation';
import type { System } from '../lib/dynamics/systems';

export type StartMessage = {
  readonly type: 'start';
  /** Base system; `paramName` is overridden per sweep sample. */
  readonly system: System;
  readonly paramName: string;
  readonly paramMin: number;
  readonly paramMax: number;
  readonly sampleCount: number;
  readonly initial: readonly [number, number, number];
  readonly config: LocalMaximaConfig;
  /** One-shot: compute every sample in one burst and post a single complete message, instead of streaming per-sample. DESIGN.md §7. */
  readonly reducedMotion?: boolean;
};

export type WorkerInboundMessage = StartMessage;

export type SampleMessage = {
  readonly type: 'sample';
  readonly param: number;
  readonly maxima: Float64Array;
  readonly sampleIndex: number;
  readonly sampleCount: number;
};

export type DoneMessage = { readonly type: 'done' };

export type CompleteMessage = {
  readonly type: 'complete';
  /** Parallel to `values` — one entry per accumulated (param, local-maximum) point across every sample. */
  readonly params: Float64Array;
  readonly values: Float64Array;
};

export type WorkerOutboundMessage = SampleMessage | DoneMessage | CompleteMessage;

// Incremented on every 'start' so an in-flight sweep from a superseded
// parameter set stops posting once a newer one begins.
let generation = 0;

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;
  if (message.type === 'start') {
    generation += 1;
    void run(message, generation);
  }
};

function withParam(system: System, paramName: string, value: number): System {
  return { ...system, params: { ...system.params, [paramName]: value } } as System;
}

async function run(message: StartMessage, myGeneration: number): Promise<void> {
  const { system, paramName, paramMin, paramMax, sampleCount, initial, config, reducedMotion } = message;
  const initialState = new Float64Array(initial);

  if (reducedMotion) {
    const allParams: number[] = [];
    const allValues: number[] = [];

    for (let i = 0; i < sampleCount; i++) {
      if (generation !== myGeneration) return;
      const param =
        sampleCount === 1 ? paramMin : paramMin + ((paramMax - paramMin) * i) / (sampleCount - 1);
      const sampleSystem = withParam(system, paramName, param);
      const maxima = localMaxima(sampleSystem, initialState, config);
      for (let j = 0; j < maxima.length; j++) {
        allParams.push(param);
        allValues.push(maxima[j] as number);
      }
    }

    if (generation !== myGeneration) return;
    const params = new Float64Array(allParams);
    const values = new Float64Array(allValues);
    const completeMessage: CompleteMessage = { type: 'complete', params, values };
    (self as unknown as Worker).postMessage(completeMessage, [params.buffer, values.buffer]);
    return;
  }

  for (let i = 0; i < sampleCount; i++) {
    if (generation !== myGeneration) return;

    const param =
      sampleCount === 1 ? paramMin : paramMin + ((paramMax - paramMin) * i) / (sampleCount - 1);
    const sampleSystem = withParam(system, paramName, param);
    const maxima = new Float64Array(localMaxima(sampleSystem, initialState, config));

    const sampleMessage: SampleMessage = {
      type: 'sample',
      param,
      maxima,
      sampleIndex: i,
      sampleCount,
    };
    (self as unknown as Worker).postMessage(sampleMessage, [maxima.buffer]);

    // Yield to the event loop so 'start' messages (a parameter change) can
    // preempt this run instead of queuing behind an uninterrupted loop.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  if (generation === myGeneration) {
    const doneMessage: DoneMessage = { type: 'done' };
    (self as unknown as Worker).postMessage(doneMessage);
  }
}

export {};
