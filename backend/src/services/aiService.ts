/**
 * AI Service
 *
 * This service handles interactions with the OpenAI API for generating insights,
 * forecasts, anomaly detection, and recommendations.
 */

import axios from "axios";
import { InsightType } from "../models/AIInsight";
import AIInsight from "../models/AIInsight";
import Income from "../models/Income";
import Project from "../models/Project";
import Category from "../models/Category";
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
          prompt: JSON.stringify(prompt),
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
   * Fetch income data from the database, aggregated by month, project, and category
   *
   * @returns Aggregated income data
   */
  private async fetchIncomeData(params?: InsightRequestParams): Promise<any> {
    try {
      // Check if we should apply date filtering
      const applyDateFilter = params?.data?.applyDateFilter === true;

      // Initialize match stage for aggregation
      let matchStage: any = {};

      if (applyDateFilter) {
        // Get date range from params or default to last 12 months
        let startYearMonth: string;
        let endYearMonth: string;

        if (params?.data?.startYearMonth && params?.data?.endYearMonth) {
          startYearMonth = params.data.startYearMonth as string;
          endYearMonth = params.data.endYearMonth as string;
        } else {
          // Default to last 12 months
          const endDate = new Date();
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);

          // Format dates for yearMonth query
          startYearMonth = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
          endYearMonth = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}`;
        }

        // Add date filter to match stage
        matchStage.yearMonth = { $gte: startYearMonth, $lte: endYearMonth };
      }

      // Aggregate income data by month, project, and category
      const incomeData = await Income.aggregate([
        {
          $match: matchStage
        },
        {
          $lookup: {
            from: "projects",
            localField: "project",
            foreignField: "_id",
            as: "projectInfo"
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        {
          $unwind: { path: "$projectInfo", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: "$categoryInfo"
        },
        {
          $group: {
            _id: {
              yearMonth: "$yearMonth",
              project: "$projectInfo.name",
              category: "$categoryInfo.name"
            },
            totalAmount: { $sum: "$amount" }
          }
        },
        {
          $project: {
            _id: 0,
            yearMonth: "$_id.yearMonth",
            project: { $ifNull: ["$_id.project", "Uncategorized"] },
            category: "$_id.category",
            amount: "$totalAmount"
          }
        },
        {
          $sort: { yearMonth: 1 }
        },
        {
          $limit: 10
        }
      ]);

      // Also get monthly totals for easier analysis
      // const monthlyTotals = await Income.aggregate([
      //   {
      //     $match: matchStage
      //   },
      //   {
      //     $group: {
      //       _id: "$yearMonth",
      //       totalAmount: { $sum: "$amount" }
      //     }
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       yearMonth: "$_id",
      //       totalAmount: 1
      //     }
      //   },
      //   {
      //     $sort: { yearMonth: 1 }
      //   }
      // ]);

      return {
        detailedData: incomeData,
        // monthlyTotals: monthlyTotals
      };
    } catch (error) {
      console.error("Error fetching income data:", error);
      return { error: "Failed to fetch income data" };
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

      case `${InsightType.ANOMALY}_revenue`:
          // Fetch income data from the database
          const incomeData = await this.fetchIncomeData(params);

          return `You are a financial analyst specialized in predicting future revenue anomalies and potential risks.Please analyze the company's historical revenue data and identify any patterns that could indicate FUTURE revenue anomalies or risks.Focus on:1. Identifying trends that suggest future revenue drops2. Predicting potential revenue anomalies in the upcoming months3. Early warning signs in the current data that indicate future problems4. Seasonal patterns that might affect future revenue5. External factors that could impact revenue in the near futureHere is the company's historical revenue data, aggregated by month, project, and category:${JSON.stringify(incomeData, null, 2)}Based on this historical data, predict potential future revenue anomalies for the next 3-6 months.Format your response as a JSON object with the following structure:{"predictedAnomalies": [{"period": "YYYY-MM","riskLevel": "high/medium/low","description": "Description of the predicted anomaly or risk","earlyWarningIndicators": ["Indicator 1", "Indicator 2"],"preventativeMeasures": ["Measure 1", "Measure 2"]}],"summary": "Overall summary of predictions and recommendations for preventing future revenue issues"}If no future anomalies are predicted, return an empty array for predictedAnomalies and a summary explaining why the revenue outlook appears stable.`;

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
