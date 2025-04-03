import { CustomError, httpStatusCodes } from "../../../constants/constants.js";
import User from "../../../models/User.js";

const fetchUsers = async (conditions = {}, paginationData = {}) => {
    try {

        const totalData = await User.count(conditions)
        const query = []
        const filters = { "$match": conditions }
        query.push(filters)
        query.push({ "$project": { userPassword: 0 } })
        const { data: users, count } = await User.pagination(query, { totalData, ...paginationData });
        if (!users.length) {
            throw new CustomError(httpStatusCodes["Bad Request"], "No Data found")
        }
        return { users, count }
    }
    catch (err) {
        console.log("======= Error fetchUsers", err.message)
        throw new CustomError(err.status || httpStatusCodes["Bad Request"], err.message)
    }
}

export default fetchUsers