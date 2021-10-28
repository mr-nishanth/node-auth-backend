const crypto = require("crypto")
const User = require("../models/User.models");
const ErrorResponse = require("../utils/errorResponse")
const sendEmail = require("../utils/sendEmail")


exports.register = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        // Create the user
        const user = await User.create({
            username, email, password
        });
        sendToken(user, 201, res);
    } catch (error) {
        // this error handle by middleware
       next(error)
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    // Check if email and password field is empty or not
    if (!email || !password) {
        return next(new ErrorResponse("Please provide email and password", 400));
    }
    // Check the user is register or not
    // find in db

    try {
        // find with email because the email is unique and get the password of the  email
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }
        const isMatch = await user.matchPasswords(password);
        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials",  401));
        }
        sendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }

}

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(new ErrorResponse("Email could not be match or excited", 404));
        }

        const resetToken = user.getResetPasswordToken()
        await user.save();

        // Frontend deployed url
        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;
        const message = `
        <h1> You have requested a password reset token</h1>
        <p>Please go to this link to reset your password </p>
        <a href=${resetUrl} clicktracking=off >${resetUrl} </a>
        `;

        // Email sender
        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Requested",
                text:message
            })
            res.status(200).json({success:true,data:"Email sent"})
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();
            return next(new ErrorResponse("Email could not be sent", 500));

        }


    } catch (error) {
next(error)
    }

}

exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    try {
        const user = User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {
                $gt:Date.now()
            }
        })
        if (!user) {
            return next(new ErrorResponse("Invalid Reset Token", 400));
        }

        // change new password
        user.password = req.body.password;
        // delete the resetPasswordToken after use
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Save the new password
        await user.save();
        res.status(200).json({
            success:true,
            data:"Password Reset Success"
        })
    } catch (error) {
        next(error)
    }
}

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({success:true,token})
}