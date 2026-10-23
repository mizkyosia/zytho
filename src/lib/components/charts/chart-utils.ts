export interface Series {
  name: string;
  /** Any CSS color, e.g. `var(--chart-2)` */
  color: string;
  values: number[];
}

/** "Nice" upper bound and ticks for an axis going from 0 to `max` */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ??
    10 * magnitude;
  const ticks = [];
  for (let t = 0; t < max + step; t += step) ticks.push(t);
  return ticks;
}
