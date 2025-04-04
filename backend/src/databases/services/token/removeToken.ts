import { FilterQuery } from "mongoose";
import { CustomError, httpStatusCodes } from "../../../constants/constants";
import Token from "../../../models/Token";
import { IToken } from "../../../types/index";

const removeToken = async (conditions: FilterQuery<IToken>): Promise<IToken> => {
  try {
    const data = await Token.findOneAndRemove(conditions);

    if (!data) {
      throw new CustomError(httpStatusCodes["Bad Request"], "Invalid Data");
    }

    return data;
  } catch (err) {
    console.log("======= Error removeToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export default removeToken;
