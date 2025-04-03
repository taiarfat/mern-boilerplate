import j2s from 'joi-to-swagger';

import authValidatorSchema from "../modules/v1/auth/validatorSchema.js"
import userValidatorSchema from '../modules/v1/user/validatorSchema.js';

// ==========================   Auth Schema   ==========================
const { swagger: login } = j2s(authValidatorSchema.loginSchema);

// ==========================   User Schema   ==========================
const { swagger: addUser } = j2s(userValidatorSchema.createUserSchema);
const { swagger: updateUser } = j2s(userValidatorSchema.updateUserSchema);

export default {
    addUser,
    updateUser,
    login
}