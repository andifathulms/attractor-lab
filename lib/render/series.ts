export type Series = {
  readonly times: readonly number[];
  readonly values: readonly number[];
};

export const EMPTY_SERIES: Series = { times: [], values: [] };

/**
 * Appends new (time, value) samples, halving resolution (keeping every other
 * sample) once the series exceeds `maxSamples` — keeps the redraw cost of a
 * long-running divergence plot bounded without capping how far in time it
 * can show.
 */
export function appendSamples(
  series: Series,
  newTimes: readonly number[],
  newValues: readonly number[],
  maxSamples: number
): Series {
  let times = series.times.concat(newTimes);
  let values = series.values.concat(newValues);

  while (times.length > maxSamples) {
    const thinnedTimes: number[] = [];
    const thinnedValues: number[] = [];
    for (let i = 0; i < times.length; i += 2) {
      thinnedTimes.push(times[i] as number);
      thinnedValues.push(values[i] as number);
    }
    times = thinnedTimes;
    values = thinnedValues;
  }

  return { times, values };
}
