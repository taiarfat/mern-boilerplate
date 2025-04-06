export type Anomaly = {
  period: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  earlyWarningIndicators: string[];
  preventativeMeasures: string[];
};

export type AnomalyResponse = {
  predictedAnomalies: Anomaly[];
};
