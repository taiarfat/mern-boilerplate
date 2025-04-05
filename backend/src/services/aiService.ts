/**
 * AI Service
 *
 * This service handles interactions with the OpenAI API for generating insights,
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
    const { type, topic } = params;

    switch (`${type}_${topic}`) {
      case `${InsightType.FORECAST}_revenue`:
        return ``;

      case `${InsightType.FORECAST}_revenue`:
        return ``;

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
