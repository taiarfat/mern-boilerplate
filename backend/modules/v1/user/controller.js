import { httpStatusCodes, responseStatus } from "../../../constants/constants.js";
import createUser from "../../../databases/services/user/createUser.js";
import fetchAllUser from "../../../databases/services/user/fetchUsers.js";
import fetchUser from "../../../databases/services/user/fetchUser.js";
import modifyUser from "../../../databases/services/user/modifyUser.js";
import removeUser from "../../../databases/services/user/removeUser.js";
import { encryptPassword } from "../../../helpers/encryptPassword.js";
import { sendResponse } from "../../../helpers/response.js";

const getUsers = async (req, res, next) => {
    try {
        const { page, limit } = req.query
        const conditions = req.query
        delete conditions.page
        delete conditions.limit
        const users = await fetchAllUser(req.query, { page, limit });
        return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Get All Users", users)
    }
    catch (err) {
        console.log("=====Get users", err.message)
        return next(err)
    }
}

const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await fetchUser({ _id: id });
        return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Get User By Id", user)
    }
    catch (err) {
        console.log("=====Get user by Id", err.message)
        return next(err)
    }
}


const addUser = async (req, res, next) => {
    try {
        const data = { ...req.body, ...req.validatedData };
        data.userPassword = await encryptPassword(data.userPassword)
        const user = await createUser(data);
        return sendResponse(res, httpStatusCodes.Created, responseStatus.SUCCESS, "Add user", user)
    }
    catch (err) {
        console.log("=====Add user", err.message)
        return next(err)
    }
}

const updateUser = async (req, res, next) => {
    try {
        const data = { ...req.body, ...req.validatedData };
        const id = data.id;
        delete data.userEmail
        delete data.id
        const { userPassword } = data
        const updateData = userPassword ? { ...data, userPassword: await encryptPassword(userPassword) } : data
        const user = await modifyUser({ _id: id }, updateData);
        return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Update User", user)
    }
    catch (err) {
        console.log("=====Update user", err.message)
        return next(err)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const users = await removeUser({ _id: id });
        return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Delete Users", users)
    }
    catch (err) {
        console.log("=====Delete user", err.message)
        return next(err)
    }
}

const getUserMe = async (req, res, next) => {
    try {
        const id = req.user._id;
        const user = await fetchUser({ _id: id });
        return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Get User Me", user)
    }
    catch (err) {
        console.log("=====Get user me", err.message)
        return next(err)
    }
}

const updateUserMe = async (req, res, next) => {
    try {
        const id = req.user._id;
        const data = { ...req.body, ...req.validatedData }
        delete data.userRole
        delete data.userEmail
        const { userPassword } = data
        const updateData = userPassword ? { ...data, userPassword: await encryptPassword(userPassword) } : data
        const user = await modifyUser({ _id: id }, updateData);
        return sendResponse(res, httpStatusCodes.OK, responseStatus.SUCCESS, "Update User Me", user)
    }
    catch (err) {
        console.log("=====Update user me", err.message)
        return next(err)
    }
}

export default {
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    getUserMe,
    updateUserMe,
}