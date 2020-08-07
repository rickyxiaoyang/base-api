const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc     Register a new user
// @route    POST /api/v1/auth/register
// access    Public

exports.register = asyncHandler(async (req, res, next) => {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    };
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
        return next(
            new ErrorResponse(
                `This email is taken. Please use another email`,
                401
            )
        );
    }

    const userCreated = await User.create(user);
    res.status(201).json({
        message: "Resource Created",
    });
});

// @desc     Login a user
// @route    POST /api/v1/auth/login
// access    Public
exports.login = asyncHandler(async (req, res, next) => {
    //check if user exists
    const user = await User.findOne({
        email: req.body.email,
    }).select("+password");

    if (!user) {
        return next(new ErrorResponse(`Invalid Email`, 404));
    }

    //check if password matches
    const isMatch = await user.matchPassword(req.body.password);

    if (!isMatch) {
        return next(new ErrorResponse(`Invalid Credentials`, 401));
    }

    //Sends response with token
    sendTokenResponse(user, 200, res);
});

/*
This function sends the token in cookie/token.
*/
const sendTokenResponse = (user, statusCode, res) => {
    //Create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token: token,
    });
};

// @desc     Login a user
// @route    POST /api/v1/auth/login
// access    Public
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});
