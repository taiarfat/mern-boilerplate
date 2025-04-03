
import { CustomError, httpStatusCodes } from "../../../constants/constants.js";
import User from "../../../models/User.js";

const modifyUser = async (conditions, updatedValues) => {
    try {
        const data = await User.findOneAndUpdate(conditions, updatedValues, { new: true, runValidators: true });
        if (!data) {
            throw new CustomError(httpStatusCodes["Bad Request"], "Invalid Data")
        }
        return data;
    }

    catch (err) {
        console.log("======= Error modifyUser", err.message)
        throw new CustomError(err.status || httpStatusCodes["Bad Request"], err.message)
    }
}

export default modifyUser;