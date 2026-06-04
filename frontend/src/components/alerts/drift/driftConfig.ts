export interface DriftFeatureData {
  bin: string;
  zeekLive: number;     // Zeek-first distribution baseline %
  publicStandard: number; // Public training baseline %
}

export interface ModelPerformanceEpoch {
  epoch: string;
  ai1Accuracy: number;
  ai1F1: number;
  ai2aAccuracy: number;
  ai2bAccuracy: number;
  falsePositiveRate: number;
}

export const DRIFT_METRICS_DUMMY = {
  psiScoreAI1: 0.08,  // Green: <0.1
  psiScoreAI2a: 0.14, // Yellow: 0.1 - 0.25
  psiScoreAI2b: 0.22, // Yellow, trending to Red
};

// Histograms comparing live client traffic (Zeek-first baseline) vs Public datasets
export const FEATURE_DISTRIBUTIONS: Record<string, DriftFeatureData[]> = {
  duration: [
    { bin: "0-1s", zeekLive: 72, publicStandard: 45 },
    { bin: "1-10s", zeekLive: 18, publicStandard: 30 },
    { bin: "10-60s", zeekLive: 8, publicStandard: 15 },
    { bin: "1-5m", zeekLive: 1.5, publicStandard: 7 },
    { bin: "5m+", zeekLive: 0.5, publicStandard: 3 },
  ],
  bytes: [
    { bin: "0-1KB", zeekLive: 65, publicStandard: 38 },
    { bin: "1-10KB", zeekLive: 20, publicStandard: 28 },
    { bin: "10-100KB", zeekLive: 10, publicStandard: 18 },
    { bin: "100KB-1MB", zeekLive: 4, publicStandard: 11 },
    { bin: "1MB+", zeekLive: 1, publicStandard: 5 },
  ],
  packetRate: [
    { bin: "0-10", zeekLive: 58, publicStandard: 35 },
    { bin: "10-100", zeekLive: 25, publicStandard: 30 },
    { bin: "100-1K", zeekLive: 12, publicStandard: 20 },
    { bin: "1K-10K", zeekLive: 4, publicStandard: 10 },
    { bin: "10K+", zeekLive: 1, publicStandard: 5 },
  ],
};

// Longitudinal performance tracking and degradation
export const PERFORMANCE_TIMELINE: ModelPerformanceEpoch[] = [
  { epoch: "Jan '26", ai1Accuracy: 0.982, ai1F1: 0.978, ai2aAccuracy: 0.952, ai2bAccuracy: 0.941, falsePositiveRate: 0.012 },
  { epoch: "Feb '26", ai1Accuracy: 0.980, ai1F1: 0.975, ai2aAccuracy: 0.948, ai2bAccuracy: 0.938, falsePositiveRate: 0.014 },
  { epoch: "Mar '26", ai1Accuracy: 0.975, ai1F1: 0.970, ai2aAccuracy: 0.941, ai2bAccuracy: 0.922, falsePositiveRate: 0.019 },
  { epoch: "Apr '26", ai1Accuracy: 0.971, ai1F1: 0.963, ai2aAccuracy: 0.935, ai2bAccuracy: 0.905, falsePositiveRate: 0.024 },
  { epoch: "May '26", ai1Accuracy: 0.968, ai1F1: 0.958, ai2aAccuracy: 0.930, ai2bAccuracy: 0.882, falsePositiveRate: 0.038 }, // AI2B degradation highlight
];
