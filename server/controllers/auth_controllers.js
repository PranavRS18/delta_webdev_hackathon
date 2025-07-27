const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendMail } = require("../mails/sendMail");
require('dotenv').config();

// Register
module.exports.putUserCredentials = async (req, res) => {
    const {username, email, password} = req.body;

    try {
        const user = await User.create({username, email, password});
        const checkEmail = await sendMail({
            username: username,
            email : email,
            template : 'welcome',
            token: jwt.sign({id: user._id}, process.env.EMAIL_SECRET, {expiresIn: 20 * 60 * 60}),
        });

        if (checkEmail === 535) {
            await User.deleteOne({id: user._id});
            return res.status(400).send({
                message: "Give us a Valid Email"
            });
        }

        return res.status(201).json({
            user : user._id,
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send({
                message: `This Email has already been registered with ${process.env.NAME}`
            });
        }
        else if (err.message.includes('User validation failed')) {
            let errors = {
                username: '',
                email: '',
                password: '',
            }
            Object.values(err.errors).forEach(({properties}) => {
                errors[properties.path] = properties.message;
            });
            for (const error in errors) {
                if (errors[error] !== '') {
                    return res.status(400).send({
                        message: errors[error]
                    });
                }
            }
        }
        else {
            console.log(err);
            return res.status(400).send({
                message: "Invalid Error"
            });
        }
    }
}

// Login
module.exports.getUserCredentials = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user.verified) {
            return res.status(400).send({
                message: "A Verification Link has been sent to your Email."
            });
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
                expiresIn: 3 * 24 * 60 * 60,
            });
            return res.status(200).json({
                token : token,
            });
        } else {
            res.status(400).send({
                message: "Invalid Email or Password"
            });
        }
    } catch (err) {
        res.status(400).send({
            message: "Register if you are a New User"
        });
    }
}

// Verification
module.exports.giveVerified = async (req, res) => {
    const token = req.query.token;

    try {
        if (!token) return res.redirect('http://localhost:8080/verification-error?error=' + "Token not provided.");
        const payload = jwt.verify(token, process.env.EMAIL_SECRET)

        const verification = await User.updateOne({ _id: payload.id }, {
            $set: { verified: true }
        });

        if (verification.matchedCount) res.redirect(process.env.CLIENT);
        else res.redirect(process.env.CLIENT + '/verification-error?error=' + "Verification Process was Unsuccessful");

    } catch (err) {
        if(err.name === "JsonWebTokenError") return res.redirect(process.env.CLIENT + '/verification-error?error=' + "Invalid Token");

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id) return res.redirect(process.env.CLIENT + '/verification-error?error=' + "Invalid token");

        const user = await User.findOne({_id: decoded.id});
        const checkEmail = await sendMail({
            username: user.username,
            email : user.email,
            template : 'forgotPassword',
            token: jwt.sign({id: user._id}, process.env.EMAIL_SECRET, {expiresIn: 20 * 60 * 60}),
        });

        if (checkEmail === 535) {
            return res.redirect(process.env.CLIENT + '/verification-error?error=' + "Failed to Resend Verification Email");
        }
        return res.redirect(process.env.CLIENT + '/verification-error?error=' + "Verification link has expired. A New Verification Email has been sent.");
    }
}

// Forgot Password
module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email });
        const checkEmail = await sendMail({
            username: user.username,
            email : email,
            template : 'forgotPassword',
            token: jwt.sign({id: user._id}, process.env.RESET_SECRET, {expiresIn: 20 * 60 * 60}),
        });
        if (checkEmail === 535) {
            return res.status(400).send({
                message: "Give us a Valid Email"
            });
        }
        return res.status(200).send({
            message: "An Email has been sent"
        });
    } catch (err) {
        res.status(400).send({
            message: `Register to ${process.env.NAME} if you are a New User`
        });
    }
}

// Reset Password
module.exports.resetPassword = async (req, res) => {
    const {password, token} = req.body;

    try {
        if (!token) return res.status(400).send({
            message: "Invalid Reset Password Session"
        });
        const payload = jwt.verify(token, process.env.RESET_SECRET);

        const user = await User.findById(payload.id);

        if (user) {
            user.password = password;
            await user.save();
            return res.status(200).send({
                message: "Your Password has been reset successfully"
            });
        }
        else return res.status(400).send({
            message: "Reset Process was Unsuccessful"
        });

    } catch (err) {
        if (err.message.includes('User validation failed')) return res.status(400).send({
            message: Object.values(err.errors)[0].properties.message
        });
        if (err.name === "JsonWebTokenError") return res.status(400).send({
            message: "Invalid Token"
        });

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id) return res.status(400).send({
            message: "Invalid token"
        });

        const user = await User.findOne({_id: decoded.id});
        const checkEmail = await sendMail({
            username: user.username,
            email : user.email,
            template : 'forgotPassword',
            token: jwt.sign({id: user._id}, process.env.RESET_SECRET, {expiresIn: 20 * 60 * 60}),
        });

        if (checkEmail === 535) {
            return res.status(400).send({
                message: "Failed to Resend Reset Email"
            });
        }
        return res.status(400).send({
            message: "Reset link has expired. A New Reset Password Email has been sent."
        });
    }
}

// Session Verification
module.exports.sessionVerification = async (req, res) => {
    const { token } = req.body;
    try {
        if (!token) return res.status(400).send({
            message: "Token not provided."
        });
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(payload.id)

        res.status(200).send({
            UID: user._id,
            username: user.username,
            email : user.email,
        });

    } catch(err) {
        if(err.name === "JsonWebTokenError") return res.status(400).send({
            message: "Invalid Token"
        });
        else if (err.name === "TokenExpiredError") return res.status(400).send({
            message: "Session has Expired"
        }); else return res.status(400).send({
            message: "Invalid User"
        });
    }
}
