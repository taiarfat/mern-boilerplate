import { CustomError, httpStatusCodes } from "../../../constants/constants.js";
import User from "../../../models/User.js";

const fetchUser = async (conditions, project = {}) => {
    try {
        const data = await User.findOne(conditions, project).lean();
        if (!data) {
            throw new CustomError(httpStatusCodes["Bad Request"], "Invalid Data")
        }
        return data
    }
    catch (err) {
        console.log("======= Error fetchUser", err.message)
        throw new CustomError(err.status || httpStatusCodes["Bad Request"], err.message)
    }
}

export default fetchUser