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

// @desc     Forgot password & sent email
// @route    POST /api/v1/auth/forgotpassword/
// access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return next(new ErrorResponse(`There is no user with that email`, 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // const resetUrl = `${req.protocol}://${req.get(
    //     "host"
    // )}/api/v1/resetpassword/${resetToken}`;

    try {
        await sendPwdResetMail(req.body.email, resetToken, next);
        res.status(200).json({
            success: true,
            token: resetToken,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new ErrorResponse(`There was an error resetting the password`, 401)
        );
    }
});

// @desc     Reset ID
// @route    POST /api/v1/auth/resetpassword/:resettoken
// access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //get Hashed Token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");
    console.log(resetPasswordToken.toString());
    //Check that the reset is valid.
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorResponse(`Invalid request/token`, 400));
    }

    //Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
    });
});

// @desc     change Password
// @route    POST /api/v1/auth/changepassword
// access    Private
exports.changePassword = asyncHandler(async (req, res, next) => {
    //check that the old password matches.
    const user = await User.findById(req.user.id).select("password");
    await bcrypt.compare(req.body.oldpassword, user.password, (err, data) => {
        if (err) {
            console.log(err);
            if (!matches) {
                return next(new ErrorResponse(`Incorrect password. `, 400));
            }
        }
    });
    //change the password to new.
    user.password = req.body.newpassword;
    await user.save();
    res.status(200).json({
        success: true,
    });
});

// @desc     Get Me
// @route    POST /api/v1/auth/me
// access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});
