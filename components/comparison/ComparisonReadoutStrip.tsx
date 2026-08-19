import { ReadoutStrip } from '@/components/readout/ReadoutStrip';
import { useT } from '@/lib/i18n/LocaleProvider';

export type ComparisonReadoutStripProps = {
  readonly dt: number;
  readonly elapsed: number;
  readonly eulerVsRk4: number | undefined;
  readonly rk2VsRk4: number | undefined;
};

export function ComparisonReadoutStrip({
  dt,
  elapsed,
  eulerVsRk4,
  rk2VsRk4,
}: ComparisonReadoutStripProps) {
  const t = useT();

  return (
    <ReadoutStrip
      fields={[
        { label: t.readout.step, value: dt.toExponential(1) },
        { label: t.readout.elapsedTime, value: elapsed.toFixed(2) },
        {
          label: t.readout.separationA,
          value: eulerVsRk4 !== undefined ? eulerVsRk4.toExponential(2) : '-',
        },
        {
          label: t.readout.separationB,
          value: rk2VsRk4 !== undefined ? rk2VsRk4.toExponential(2) : '-',
        },
      ]}
    />
  );
}
