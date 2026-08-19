import { ReadoutStrip } from '@/components/readout/ReadoutStrip';
import type { Plane } from '@/lib/dynamics/section';
import { useT } from '@/lib/i18n/LocaleProvider';

const AXIS_LABEL = ['x', 'y', 'z'] as const;

export type SectionReadoutStripProps = {
  readonly dt: number;
  readonly elapsed: number;
  readonly plane: Plane;
  readonly crossingCount: number;
};

export function SectionReadoutStrip({ dt, elapsed, plane, crossingCount }: SectionReadoutStripProps) {
  const t = useT();

  return (
    <ReadoutStrip
      fields={[
        { label: t.readout.integrator, value: t.integratorNames.rk4 },
        { label: t.readout.step, value: dt.toExponential(1) },
        { label: t.readout.elapsedTime, value: elapsed.toFixed(2) },
        { label: t.readout.plane, value: `${AXIS_LABEL[plane.axis]} = ${plane.offset.toFixed(3)}` },
        { label: t.readout.crossings, value: String(crossingCount) },
      ]}
    />
  );
}
