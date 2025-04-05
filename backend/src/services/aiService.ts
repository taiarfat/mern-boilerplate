/**
 * AI Service
 *
 * This service handles interactions with the OpenAI API for generating insights,
 * forecasts, anomaly detection, and recommendations.
 */

import axios from "axios";
import { InsightType } from "../models/AIInsight";
import AIInsight from "../models/AIInsight";
import { generateParameterHash } from "../utils/hashGenerator";
import mongoose from "mongoose";
import config from "../constants/config";

/**
 * Interface for AI insight request parameters
 */
interface InsightRequestParams {
  insightType: InsightType;
  department?: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  additionalParams?: Record<string, any>;
}

/**
 * AI Service class for generating and retrieving insights
 */
class AIService {
  private apiEndpoint: string;

  /**
   * Initialize the AI service
   *
   * @param apiKey - OpenAI API key
   * @param apiEndpoint - OpenAI API endpoint
   */
  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Get insight from cache or generate new one
   *
   * @param params - Parameters for the insight request
   * @returns The AI-generated insight
   */
  async getInsight(params: InsightRequestParams): Promise<any> {
    // Create parameters object for caching
    const parameters = {
      insightType: params.insightType,
      department: params.department ? params.department.toString() : null,
      category: params.category ? params.category.toString() : null,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      ...params.additionalParams,
    };

    // Generate hash for cache lookup
    const parameterHash = generateParameterHash(parameters);

    // Check if we have a cached insight
    const cachedInsight = await AIInsight.findOne({
      parameterHash,
      expiresAt: { $gt: new Date() },
    });

    // Return cached insight if available
    if (cachedInsight) {
      return cachedInsight.content;
    }

    // Generate new insight
    const content = await this.generateInsight(params);

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save to cache
    await AIInsight.create({
      insightType: params.insightType,
      department: params.department,
      category: params.category,
      startDate: params.startDate,
      endDate: params.endDate,
      content,
      parameters,
      parameterHash,
      expiresAt,
    });

    return content;
  }

  /**
   * Generate a new insight using OpenAI API
   *
   * @param params - Parameters for the insight request
   * @returns The AI-generated insight
   */
  private async generateInsight(params: InsightRequestParams): Promise<any> {
    try {
      // Construct prompt based on insight type
      const prompt = await this.constructPrompt(params);

      // Call OpenAI API
      console.log("================= AI magic is happing..........");

      console.log("================= prompt", prompt);

      const data = (
        await axios.post(this.apiEndpoint, {
          model: config.AI_MODEL,
          prompt: JSON.stringify([
            {
              role: "system",
              content:
                "You are an AI assistant specialized in business analytics and executive insights.",
            },
            { role: "user", content: prompt },
          ]),
          stream: false,
        })
      ).data;
      console.log("=================", data.response);

      // Extract and parse the response
      const content = data.response;

      // Try to parse as JSON if possible
      try {
        return JSON.parse(content);
      } catch (e) {
        // Return as text if not valid JSON
        return { text: content };
      }
    } catch (error) {
      console.error("Error generating AI insight:", error);
      throw new Error("Failed to generate AI insight");
    }
  }

  /**
   * Construct a prompt for the AI based on insight type
   *
   * @param params - Parameters for the insight request
   * @returns A prompt string for the AI
   */
  private async constructPrompt(params: InsightRequestParams): Promise<string> {
    const { insightType, department, category, startDate, endDate } = params;

    // Get department and category names if IDs are provided
    let departmentName = "the entire company";
    let categoryName = "";

    if (department) {
      const Department = mongoose.model("Department");
      const deptDoc = await Department.findById(department);
      if (deptDoc) {
        departmentName = deptDoc.name;
      }
    }

    if (category) {
      const Category = mongoose.model("Category");
      const catDoc = await Category.findById(category);
      if (catDoc) {
        categoryName = ` for ${catDoc.name} category`;
      }
    }

    const dateRange = `from ${startDate.toISOString().split("T")[0]} to ${
      endDate.toISOString().split("T")[0]
    }`;

    switch (insightType) {
      case InsightType.FORECAST:
        return `Generate a business forecast${categoryName} for ${departmentName} department ${dateRange}. Include projected growth, key metrics, and confidence intervals. Format the response as JSON with the following structure: { "title": "Forecast title", "summary": "Brief summary", "projections": [{ "metric": "metric name", "value": "projected value", "confidence": "confidence percentage" }], "insights": [{ "title": "insight title", "description": "detailed description", "priority": "high/medium/low" }] }`;

      case InsightType.ANOMALY:
        return `Identify any anomalies or outliers in the financial data${categoryName} for ${departmentName} department ${dateRange}. Explain possible causes and implications. Format the response as JSON with the following structure: { "title": "Anomaly detection title", "summary": "Brief summary", "anomalies": [{ "metric": "metric name", "expected": "expected value", "actual": "actual value", "deviation": "percentage deviation", "cause": "possible cause" }], "insights": [{ "title": "insight title", "description": "detailed description", "priority": "high/medium/low" }] }`;

      case InsightType.TREND:
        return `Analyze trends${categoryName} for ${departmentName} department ${dateRange}. Identify patterns, correlations, and key insights. Format the response as JSON with the following structure: { "title": "Trend analysis title", "summary": "Brief summary", "trends": [{ "metric": "metric name", "pattern": "identified pattern", "impact": "business impact" }], "insights": [{ "title": "insight title", "description": "detailed description", "priority": "high/medium/low" }] }`;

      case InsightType.RECOMMENDATION:
        return `Provide strategic recommendations to improve business performance${categoryName} for ${departmentName} department based on data ${dateRange}. Include actionable steps and expected outcomes. Format the response as JSON with the following structure: { "title": "Recommendations title", "summary": "Brief summary", "recommendations": [{ "title": "recommendation title", "description": "detailed description", "impact": "high/medium/low", "effort": "high/medium/low", "steps": ["step 1", "step 2"] }] }`;

      case InsightType.ALERT:
        return `Generate critical alerts and warnings${categoryName} for ${departmentName} department based on data ${dateRange}. Highlight issues requiring immediate attention. Format the response as JSON with the following structure: { "title": "Alerts title", "summary": "Brief summary", "alerts": [{ "title": "alert title", "description": "detailed description", "severity": "high/medium/low", "action": "recommended action" }] }`;

      default:
        return `Analyze financial data${categoryName} for ${departmentName} department ${dateRange} and provide valuable insights. Format the response as JSON with the following structure: { "title": "Analysis title", "summary": "Brief summary", "insights": [{ "title": "insight title", "description": "detailed description", "priority": "high/medium/low" }], "recommendations": [{ "title": "recommendation title", "description": "detailed description", "impact": "high/medium/low", "effort": "high/medium/low" }] }`;
    }
  }
}

export default AIService;
