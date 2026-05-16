import type { AdvancedMetrics } from "../types";

export function calculateShannonEntropy(values: number[]): number {
  if (values.length === 0) return 0;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return 0;

  const binCount = 10;
  const bins = new Array(binCount).fill(0);

  for (const v of values) {
    let binIdx = Math.floor(((v - min) / range) * binCount);

    if (binIdx >= binCount) binIdx = binCount - 1;
    if (binIdx < 0) binIdx = 0;

    bins[binIdx]++;
  }

  let entropy = 0;
  const n = values.length;

  for (const count of bins) {
    if (count > 0) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }
  }

  return parseFloat(entropy.toFixed(3));
}

export function calculateAdvancedNumericMetrics(
  values: number[]
): AdvancedMetrics {
  const n = values.length;

  if (n === 0) {
    return {
      mean: 0,
      variance: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      percentiles: {
        p25: 0,
        p50: 0,
        p75: 0,
        p90: 0,
      },
      zScoreOutliers: [],
      entropy: 0,
      rollingVolatility: [],
      regimeShiftDetected: false,
      skewness: 0,
      nullRatio: 1,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);

  const mean =
    values.reduce((sum, v) => sum + v, 0) / n;

  const variance =
    values.reduce(
      (sum, v) => sum + Math.pow(v - mean, 2),
      0
    ) / n;

  const stdDev = Math.sqrt(variance);

  const getPercentile = (p: number) => {
    const idx = Math.floor((n - 1) * p);
    return sorted[idx] ?? 0;
  };

  const zScoreOutliers: number[] = [];

  if (stdDev > 0) {
    for (let i = 0; i < values.length; i++) {
      const z = Math.abs(
        (values[i] - mean) / stdDev
      );

      if (z > 2.5) {
        zScoreOutliers.push(i);
      }
    }
  }

  let skewness = 0;

  if (n > 2 && stdDev > 0) {
    const m3 =
      values.reduce(
        (sum, v) => sum + Math.pow(v - mean, 3),
        0
      ) / n;

    skewness = m3 / Math.pow(stdDev, 3);
  }

  const rollingVolatility: number[] = [];
  const windowSize = 5;

  for (
    let i = 0;
    i <= values.length - windowSize;
    i++
  ) {
    const subset = values.slice(i, i + windowSize);

    const subMean =
      subset.reduce((a, b) => a + b, 0) /
      windowSize;

    const subVar =
      subset.reduce(
        (a, b) => a + Math.pow(b - subMean, 2),
        0
      ) / windowSize;

    rollingVolatility.push(
      parseFloat(Math.sqrt(subVar).toFixed(3))
    );
  }

  let regimeShiftDetected = false;

  if (n >= 10) {
    const midPoint = Math.floor(n / 2);

    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);

    const fhMean =
      firstHalf.reduce((a, b) => a + b, 0) /
      firstHalf.length;

    const shMean =
      secondHalf.reduce((a, b) => a + b, 0) /
      secondHalf.length;

    const difference = Math.abs(fhMean - shMean);

    if (
      stdDev > 0 &&
      difference > 1.5 * stdDev
    ) {
      regimeShiftDetected = true;
    }
  }

  return {
    mean: parseFloat(mean.toFixed(3)),
    variance: parseFloat(variance.toFixed(3)),
    stdDev: parseFloat(stdDev.toFixed(3)),
    min: sorted[0],
    max: sorted[n - 1],
    percentiles: {
      p25: getPercentile(0.25),
      p50: getPercentile(0.5),
      p75: getPercentile(0.75),
      p90: getPercentile(0.9),
    },
    zScoreOutliers,
    entropy: calculateShannonEntropy(values),
    rollingVolatility,
    regimeShiftDetected,
    skewness: parseFloat(skewness.toFixed(3)),
    nullRatio: 0,
  };
}