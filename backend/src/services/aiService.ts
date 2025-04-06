/**
 * AI Service
 *
 * This service handles interactions with the AI API for generating insights,
 * forecasts, anomaly detection, and recommendations.
 */

import axios from "axios";
import { InsightType } from "../models/AIInsight";
import AIInsight from "../models/AIInsight";
import config from "../constants/config";
import { CustomError, httpStatusCodes } from "../constants/constants";

/**
 * Interface for AI insight request parameters
 */
interface InsightRequestParams {
  type: InsightType;
  topic: string;
  data: any;
  groupBy?: string;
  fullUrl?: string;
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
   * @param apiKey - AI API key
   * @param apiEndpoint - AI API endpoint
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
  async getInsight(
    params: InsightRequestParams,
    fullUrl: string
  ): Promise<any> {
    // Check if we have a cached insight
    const cachedInsight = await AIInsight.findOne({
      fullUrl,
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
      type: params.type,
      fullUrl: fullUrl,
      content,
    });

    return content;
  }

  /**
   * Generate a new insight using AI API
   *
   * @param params - Parameters for the insight request
   * @returns The AI-generated insight
   */
  private async generateInsight(params: InsightRequestParams): Promise<any> {
    try {
      // Construct prompt based on insight type
      const prompt = await this.constructPrompt(params);

      // Call AI API
      console.log("================= AI magic is happing..........");

      console.log("================= prompt", prompt);

      const data = (
        await axios.post(this.apiEndpoint, {
          model: config.AI_MODEL,
          prompt: prompt,
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
    const { type, topic, data, groupBy } = params;

    switch (`${type}_${topic}`) {
      case `${InsightType.FORECAST}_revenue`:
        return `warning: In response to this prompt I want only JSON output no extra text or acknowledgement. You are a financial analyst specializing in revenue forecasting. Based on the historical revenue data provided, forecast revenue for the next 12 months. Historical revenue data: ${JSON.stringify(
          data
        )} Please provide your forecast in JSON format with the following structure: { "chartData": [${
          groupBy === "quarter"
            ? '{"label": "2025-Q1", "value": 120000}, {"label": "2025-Q2", "value": 130000}, ...'
            : '{"label": "2025-01", "value": 40000}, {"label": "2025-02", "value": 42000}, ...'
        }], "totalRevenue": 1500000, "AI_insights": [ {"title": "Growth Trend", "description": "Revenue is projected to grow by X% over the next year due to...", "priority": "high"}, {"title": "Seasonal Patterns", "description": "Revenue shows strong seasonal patterns with peaks in...", "priority": "medium"} ], "AI_recommendations": [ {"title": "Diversify Revenue Streams", "description": "Consider expanding into new markets to...", "impact": "high", "effort": "medium"}, {"title": "Optimize Pricing Strategy", "description": "Analyze current pricing models and consider...", "impact": "medium", "effort": "low"}]} Ensure your forecast accounts for: 1. Seasonal patterns visible in the historical data 2. Overall growth or decline trends 3. Realistic month-to-month or quarter-to-quarter variations. The forecast should be for exactly 12 months into the future, starting from the month after the last data point in the historical data.`;

      case `${InsightType.FORECAST}_expense`:
        return `warning: In response to this prompt I want only JSON output no extra text or acknowledgement. You are a financial analyst specializing in expense forecasting. Based on the historical expense data provided, forecast expenses for the next 12 months. Historical expense data: ${JSON.stringify(data)} Please provide your forecast in JSON format with the following structure:{ "chartData": [${ groupBy === "quarter" ? '{"label": "2025-Q1", "value": 80000}, {"label": "2025-Q2", "value": 85000}, ...' : '{"label": "2025-01", "value": 25000}, {"label": "2025-02", "value": 27000}, ...' }], "totalExpenses": 1000000, "expenseBreakdown": [ {"type": "salary", "total": 500000, "percentage": 50}, {"type": "operational", "total": 200000, "percentage": 20}, {"type": "marketing", "total": 150000, "percentage": 15}, {"type": "R&D", "total": 100000, "percentage": 10}, {"type": "Misc", "total": 50000, "percentage": 5} ], "AI_insights": [ {"title": "Cost Drivers", "description": "The main drivers of expense growth are...", "priority": "high"}, {"title": "Expense Patterns", "description": "Expenses show cyclical patterns with increases in...", "priority": "medium"} ], "AI_recommendations": [ {"title": "Optimize Operational Costs", "description": "Consider reviewing vendor contracts to...", "impact": "high", "effort": "medium"}, {"title": "Implement Budget Controls", "description": "Establish stricter approval processes for...", "impact": "medium", "effort": "low"} ] } Ensure your forecast accounts for: 1. Seasonal patterns visible in the historical data 2. Overall growth or decline trends 3. Realistic month-to-month or quarter-to-quarter variations 4. Appropriate distribution across expense types based on historical patterns The forecast should be for exactly 12 months into the future, starting from the month after the last data point in the historical data.`; 
      case `${InsightType.ANOMALY}_`:
        return ``;

      case `${InsightType.TREND}_`:
        return ``;

      case `${InsightType.RECOMMENDATION}_`:
        return ``;

      case `${InsightType.ALERT}_`:
        return ``;

      default:
        console.error("Error! ================== constructPrompt", type, topic);
        throw new CustomError(
          httpStatusCodes["Internal Server Error"],
          "Invalid insight type"
        );
    }
  }
}

export default AIService;
