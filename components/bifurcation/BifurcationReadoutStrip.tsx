import { ReadoutStrip } from '@/components/readout/ReadoutStrip';
import { useT } from '@/lib/i18n/LocaleProvider';

export type BifurcationReadoutStripProps = {
  readonly dt: number;
  readonly paramName: string;
  readonly paramMin: number;
  readonly paramMax: number;
  readonly sampleIndex: number;
  readonly sampleCount: number;
  readonly done: boolean;
};

export function BifurcationReadoutStrip({
  dt,
  paramName,
  paramMin,
  paramMax,
  sampleIndex,
  sampleCount,
  done,
}: BifurcationReadoutStripProps) {
  const t = useT();

  return (
    <ReadoutStrip
      fields={[
        { label: t.readout.integrator, value: t.integratorNames.rk4 },
        { label: t.readout.step, value: dt.toExponential(1) },
        { label: t.readout.sweep, value: `${paramName} ∈ [${paramMin.toFixed(3)}, ${paramMax.toFixed(3)}]` },
        {
          label: t.readout.progress,
          value: done ? `${sampleCount}/${sampleCount} ${t.readout.done}` : `${sampleIndex}/${sampleCount}`,
        },
      ]}
    />
  );
}
