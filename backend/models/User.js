import mongoose from "mongoose";

import { userConstants } from "../constants/constants.js";
import paginationPlugin from "../helpers/paginationPlugin.js"

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
    },
    userEmail: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        immutable: true,
        required: true,
    },
    userPassword: {
        type: String,
        select: false,
        required: true,
    },
    userGender: {
        type: String,
        enum: [...Object.values(userConstants.GENDER)],
    },
    userRole: {
        type: String,
        ref: "role",
        enum: [...Object.values(userConstants.ROLES)],
        required: true
    },
    userDob: {
        type: Date,
        max: new Date()
    }
}, {
    timestamps: true
})

userSchema.index({ userRole: 1 })
userSchema.plugin(paginationPlugin)

const User = mongoose.model("user", userSchema)

export default User;
