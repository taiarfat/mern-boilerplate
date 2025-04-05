/**
 * AIInsight Model
 *
 * This model stores AI-generated insights, forecasts, anomalies, and recommendations.
 * It caches responses from AI to avoid redundant API calls for similar requests.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Types of AI insights
 */
export enum InsightType {
  FORECAST = "forecast",
  ANOMALY = "anomaly",
  TREND = "trend",
  RECOMMENDATION = "recommendation",
  ALERT = "alert",
}

/**
 * AIInsight document interface
 */
export interface IAIInsight extends Document {
  /** Type of insight (forecast, anomaly, trend, recommendation, alert) */
  type: InsightType;

  /** Full URL used to generate the insight will use this to check if the insight is already generated */
  fullUrl: string;

  /** The actual insight content (JSON or text) */
  content: any;

  /** Timestamp when the document was created */
  createdAt: Date;

  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const AIInsightSchema = new Schema<IAIInsight>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(InsightType),
      index: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    fullUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient querying
AIInsightSchema.index({ fullUrl: 1 });

const AIInsight = mongoose.model<IAIInsight>("AIInsight", AIInsightSchema);

export default AIInsight;
