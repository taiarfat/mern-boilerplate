import Joi from "joi";

import { userConstants } from "../../../constants/constants.js";

const createUserSchema = Joi.object({
    userName: Joi.string().trim().regex(/^[a-zA-Z]+$/).min(2).required(),
    userEmail: Joi.string().trim().email().required(),
    userPassword: Joi.string().trim().required(),   // Add password pattern according to requirenment
    userGender: Joi.string().valid(...(Object.values(userConstants.GENDER))),
    userRole: Joi.string().valid(...(Object.values(userConstants.ROLES))).required(),
    userDob: Joi.date().max('now')
})

const updateUserSchema = Joi.object({
    id: Joi.string().trim(),
    userName: Joi.string().trim().regex(/^[a-zA-Z]+$/).min(2),
    userEmail: Joi.string().trim().email(),
    userPassword: Joi.string().trim(),   // Add password pattern according to requirenment
    userGender: Joi.string().valid(...(Object.values(userConstants.GENDER))),
    userRole: Joi.string().valid(...(Object.values(userConstants.ROLES))),
    userDob: Joi.date().max('now')
})

export default {
    createUserSchema,
    updateUserSchema
}