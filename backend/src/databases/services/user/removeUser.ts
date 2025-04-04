import { FilterQuery } from "mongoose";
import { CustomError, httpStatusCodes } from "../../../constants/constants";
import User from "../../../models/User";
import { IUser } from "../../../types/index";

const removeUser = async (conditions: FilterQuery<IUser>): Promise<IUser> => {
  try {
    const data = await User.findOneAndRemove(conditions);

    if (!data) {
      throw new CustomError(httpStatusCodes["Bad Request"], "Invalid Data");
    }

    return data;
  } catch (err) {
    console.log("======= Error removeUser", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export default removeUser;
