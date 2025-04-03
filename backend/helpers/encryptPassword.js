import bcrypt from "bcrypt"
import config from "../constants/config.js"
import { CustomError, httpStatusCodes } from "../constants/constants.js"

export const encryptPassword = async (password) => {
    const encPassword = await bcrypt.hash(password, parseInt(config.SALT_ROUND))
    return encPassword
}

export const comparePassword = async (password, userPassword) => {
    try {
        return await bcrypt.compare(password, userPassword)
    }
    catch (err) {
        console.log("======== Error CompatePassword", err.message)
        throw new CustomError(err.status || httpStatusCodes["Bad Request"], err.message)
    }
}
