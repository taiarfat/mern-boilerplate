export type Insight = {
  title: string;
  description: string;
  impact: string;
  effort: string;
};

export type InsightResponse = {
  insights: Insight[];
};
