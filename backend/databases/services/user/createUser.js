import { CustomError, httpStatusCodes } from "../../../constants/constants.js"
import User from "../../../models/User.js"

const createUser = async (data) => {
    try {
        const newUser = (await User.create(data)).toJSON()
        delete newUser.userPassword
        return newUser
    }
    catch (err) {
        console.log("======= Error createUser", err.message)
        throw new CustomError(err.status || httpStatusCodes["Bad Request"], err.message)
    }
}

export default createUser