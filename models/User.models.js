const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 6,
        max: 30,
        required: [true, "Please provide a username"]
    },
    email: {
        type: String,
        min: 6,
        max: 50,
        required: [true, "Please provide a email"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        min: 6,
        max: 30,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Check before save the data into database
// if the password is modified or not
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

UserSchema.methods.matchPasswords = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Generate random strings
// require('crypto').randomBytes(35).toString("hex")
UserSchema.methods.getSignedToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

// Create resetToken
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    // hash the resetToken and store in resetPasswordToken
    this.resetPasswordToken = crypto
        .createHash("sha246")
        .update(resetToken)
        .digest("hex");

        // (60 *1000) -> 1mins ; 10 * (60 *1000) -> 10mins
    this.resetPasswordExpire = Date.now() + 10 * (60 *1000)
    return resetToken
}

const User = mongoose.model("User", UserSchema);
module.exports = User;