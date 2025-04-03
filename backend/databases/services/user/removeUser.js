import { CustomError, httpStatusCodes } from "../../../constants/constants.js";
import User from "../../../models/User.js";

const removeUser = async (conditions) => {
    try {

        const data = await User.findOneAndRemove(conditions);

        if (!data) {
            throw new CustomError(httpStatusCodes["Bad Request"], "Invalid Data")
        }
        return data
    }
    catch (err) {
        console.log("======= Error removeUser", err.message)
        throw new CustomError(err.status || httpStatusCodes["Bad Request"], err.message)
    }
}

export default removeUser;