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
  ALERT = "alert"
}

/**
 * AIInsight document interface
 */
export interface IAIInsight extends Document {
  /** Type of insight (forecast, anomaly, trend, recommendation, alert) */
  insightType: InsightType;
  
  /** Department this insight relates to (can be null for company-wide insights) */
  department?: mongoose.Types.ObjectId;
  
  /** Category this insight relates to */
  category?: mongoose.Types.ObjectId;
  
  /** Start date for the time range this insight covers */
  startDate: Date;
  
  /** End date for the time range this insight covers */
  endDate: Date;
  
  /** The actual insight content (JSON or text) */
  content: any;
  
  /** Parameters used to generate this insight (for cache matching) */
  parameters: Record<string, any>;
  
  /** Hash of parameters for quick lookup */
  parameterHash: string;
  
  /** When this insight expires and should be regenerated */
  expiresAt: Date;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const AIInsightSchema = new Schema<IAIInsight>(
  {
    insightType: {
      type: String,
      required: true,
      enum: Object.values(InsightType),
      index: true
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    content: {
      type: Schema.Types.Mixed,
      required: true
    },
    parameters: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true
    },
    parameterHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  { 
    timestamps: true 
  }
);

// Create compound indexes for efficient querying
AIInsightSchema.index({ insightType: 1, department: 1, category: 1 });
AIInsightSchema.index({ startDate: 1, endDate: 1 });

const AIInsight = mongoose.model<IAIInsight>("AIInsight", AIInsightSchema);

export default AIInsight;
