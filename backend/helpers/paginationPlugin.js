import { CustomError, httpStatusCodes } from "../constants/constants.js";

export default function paginationPlugin(schema) {
    schema.static("pagination", async function (query, options) {
        const { page = 1, limit = 10, totalData } = options;
        const totalPage = Math.ceil(totalData / limit)
        if (page > totalPage || page <= 0) {
            throw new CustomError(httpStatusCodes["Bad Request"], "No Data found")
        }
        query.push({ $skip: (page - 1) * limit })
        query.push({ $limit: parseInt(limit) })
        const data = await this.aggregate(query);
        return { data, count: totalData };
    }
    )
}