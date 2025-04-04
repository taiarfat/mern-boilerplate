import { FilterQuery } from "mongoose";
import { CustomError, httpStatusCodes } from "../../../constants/constants";
import User from "../../../models/User";
import { IUser } from "../../../types/index";

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface UsersResult {
  users: IUser[];
  count: number;
}

const fetchUsers = async (
  conditions: FilterQuery<IUser> = {},
  paginationData: PaginationOptions = {}
): Promise<UsersResult> => {
  try {
    const totalData = await User.count(conditions);
    const query = [];
    const filters = { "$match": conditions };

    query.push(filters);
    query.push({ "$project": { userPassword: 0 } });

    const { data: users, count } = await User.pagination(query, { totalData, ...paginationData });

    if (!users.length) {
      throw new CustomError(httpStatusCodes["Bad Request"], "No Data found");
    }

    return { users, count };
  } catch (err) {
    console.log("======= Error fetchUsers", (err as Error).message);
    throw new CustomError(
      (err as CustomError).status || httpStatusCodes["Bad Request"],
      (err as Error).message
    );
  }
};

export default fetchUsers;
