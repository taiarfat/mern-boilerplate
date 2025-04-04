import { FilterQuery } from "mongoose";
import { CustomError, httpStatusCodes } from "../../../constants/constants";
import User from "../../../models/User";
import { IUser } from "../../../types/index";

const modifyUser = async (
  conditions: FilterQuery<IUser>,
  updatedValues: Partial<IUser>
): Promise<IUser> => {
  try {
    const data = await User.findOneAndUpdate(
      conditions,
      updatedValues,
      { new: true, runValidators: true }
    );

    if (!data) {
      throw new CustomError(httpStatusCodes["Bad Request"], "Invalid Data");
    }

    return data;
  } catch (err) {
    console.log("======= Error modifyUser", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export default modifyUser;
