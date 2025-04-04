import { FilterQuery, ProjectionType } from "mongoose";
import { CustomError, httpStatusCodes } from "../../../constants/constants";
import Token from "../../../models/Token";
import { IToken } from "../../../types/index";

const fetchToken = async (
  conditions: FilterQuery<IToken>,
  project: ProjectionType<IToken> = {}
): Promise<IToken> => {
  try {
    const data = await Token.findOne(conditions, project).lean();

    if (!data) {
      throw new CustomError(httpStatusCodes.Unauthorized, "Invalid Tokens");
    }

    return data;
  } catch (err) {
    console.log("======= Error fetchToken", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export default fetchToken;
