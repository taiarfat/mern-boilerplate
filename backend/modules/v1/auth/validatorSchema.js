import Joi from "joi";

const loginSchema = Joi.object({
    userEmail: Joi.string().trim().email().required(),
    userPassword: Joi.string().trim().required()
})

const registerSchema = Joi.object({
    userName: Joi.string().trim().required(),
    userEmail: Joi.string().trim().email().required(),
    userPassword: Joi.string().trim().min(6).required(),
    userGender: Joi.string().valid('male', 'female', 'other'),
    userRole: Joi.string().valid('user', 'admin').default('user')
})

export default {
    loginSchema,
    registerSchema
}