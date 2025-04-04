import { Schema } from "mongoose";
import { CustomError, httpStatusCodes } from "../constants/constants";

export default function paginationPlugin(schema: Schema): void {
  schema.static("pagination", async function(query: any[], options: { page?: number; limit?: number; totalData: number }) {
    const { page = 1, limit = 10, totalData } = options;
    const totalPage = Math.ceil(totalData / limit);
    
    if (page > totalPage || page <= 0) {
      throw new CustomError(httpStatusCodes["Bad Request"], "No Data found");
    }
    
    query.push({ $skip: (page - 1) * limit });
    query.push({ $limit: parseInt(limit.toString()) });
    
    const data = await this.aggregate(query);
    return { data, count: totalData };
  });
}
