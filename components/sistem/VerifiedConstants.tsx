'use client';

import { useEffect, useState } from 'react';
import { isWithinTolerance, KAPLAN_YORKE_TOLERANCE, LYAPUNOV_TOLERANCE } from '@/lib/constants-check';
import { invariants } from '@/lib/dynamics/invariants';
import type { SystemId } from '@/lib/dynamics/systems';
import { useT } from '@/lib/i18n/LocaleProvider';
import type { ResultMessage, StartMessage, WorkerOutboundMessage } from '@/workers/constants.worker';

export type VerifiedConstantsProps = {
  readonly systemId: SystemId;
};

/**
 * Turns the project's own quality bar — CLAUDE.md §6, "an abundance of
 * analytically known truth" — into something the reader sees, not just
 * something CI enforces: runs the same live check tests/constants asserts
 * and shows this system's published constants next to what the app itself
 * computes right now, under classic parameters.
 */
export function VerifiedConstants({ systemId }: VerifiedConstantsProps) {
  const t = useT();
  const [result, setResult] = useState<ResultMessage | null>(null);
  const published = invariants[systemId]?.published ?? {};
  const hasAnyPublished =
    published.lyapunovMax !== undefined || published.kaplanYorkeDimension !== undefined;

  useEffect(() => {
    if (!hasAnyPublished) return;
    setResult(null);
    const worker = new Worker(new URL('../../workers/constants.worker.ts', import.meta.url));
    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      setResult(event.data);
    };
    const startMessage: StartMessage = { type: 'start', systemId };
    worker.postMessage(startMessage);
    return () => worker.terminate();
  }, [systemId, hasAnyPublished]);

  if (!hasAnyPublished) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-lg font-medium">{t.sistem.checkedConstants}</h2>
      {/* Visually-hidden: the table cells update silently as the worker
          resolves (WCAG 4.1.3), so a screen reader user has no way to know
          the check finished short of re-reading the whole table. This
          announces once, without changing anything visible. */}
      <p role="status" className="sr-only">
        {result !== null ? t.sistem.constantsReady : ''}
      </p>
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr className="border-b border-rule text-caption">
            <th className="py-2 pr-4 text-left font-sans font-normal" />
            <th className="py-2 pr-4 text-right font-sans font-normal">{t.sistem.published}</th>
            <th className="py-2 pr-4 text-right font-sans font-normal">{t.sistem.computed}</th>
            <th className="py-2 text-right font-sans font-normal" />
          </tr>
        </thead>
        <tbody>
          {published.lyapunovMax !== undefined && (
            <ConstantRow
              label={t.readout.lyapunovMax}
              published={published.lyapunovMax}
              computed={result?.lyapunovMax}
              tolerance={LYAPUNOV_TOLERANCE}
              t={t}
            />
          )}
          {published.kaplanYorkeDimension !== undefined && (
            <ConstantRow
              label={t.sistem.kaplanYorkeDimension}
              published={published.kaplanYorkeDimension}
              computed={result?.kaplanYorkeDimension}
              tolerance={KAPLAN_YORKE_TOLERANCE}
              t={t}
            />
          )}
        </tbody>
      </table>
    </section>
  );
}

function ConstantRow({
  label,
  published,
  computed,
  tolerance,
  t,
}: {
  readonly label: string;
  readonly published: number;
  readonly computed: number | undefined;
  readonly tolerance: number;
  readonly t: ReturnType<typeof useT>;
}) {
  const withinTolerance = computed !== undefined ? isWithinTolerance(computed, published, tolerance) : undefined;

  return (
    <tr className="border-b border-rule">
      <td className="py-2 pr-4 font-sans italic text-readout">{label}</td>
      <td className="py-2 pr-4 text-right text-readout [font-variant-numeric:tabular-nums]">{published}</td>
      <td className="py-2 pr-4 text-right text-readout [font-variant-numeric:tabular-nums]">
        {computed !== undefined ? computed.toFixed(4) : t.sistem.verifyingConstants}
      </td>
      <td className="py-2 text-right font-sans text-caption">
        {withinTolerance === undefined ? '' : withinTolerance ? t.sistem.withinTolerance : t.sistem.outsideTolerance}
      </td>
    </tr>
  );
}
