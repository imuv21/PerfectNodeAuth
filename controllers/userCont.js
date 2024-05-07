import userModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../helpers/mailer.js';
import { validationResult } from "express-validator";

class userCont {

    static userSignup = async (req, res) => {
        const { firstName, lastName, email, password, role, country, countryCode, number, countryCode2, whatsappNum } = req.body;
        const user = await userModel.findOne({ email: email });
        if (user) {
            res.status(400).send({ "status": "failed", "message": "User already exists" });
        } else {
            if (firstName && lastName && email && password && role && country && countryCode && number) {
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);

                    const newUser = new userModel({ firstName: firstName, lastName: lastName, email: email, password: hashPassword, role: role, country: country, countryCode: countryCode, number: number, countryCode2: countryCode2, whatsappNum: whatsappNum });
                    await newUser.save();
                    const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

                    const msg = `<p>Hello! ${newUser.firstName}. Thanks for signing up. Please <a href="http://localhost:8000/mail-verification?id=${newUser._id}">click here</a> to verify your email.</p>`;
                    await sendMail(newUser.email, 'Verify your email', msg);
                    res.status(201).send({ "status": "success", "message": "User created successfully", "token": token });
                } catch (error) {
                    res.status(500).send({ "status": "failed", "message": "Error type : " + error });
                }
            } else {
                res.status(400).send({ "status": "failed", "message": "All fields are required" });
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { role, email, password } = req.body;
            if (role && email && password) {
                const user = await userModel.findOne({ email: email });
                if (user !== null) {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if ((user.email === email) && (user.role === role) && isMatch) {
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
                        res.status(200).send({ "status": "success", "message": "User logged in successfully", "token": token });
                    } else {
                        res.status(400).send({ "status": "failed", "message": "Email or password is incorrect" });
                    }
                } else {
                    res.status(400).send({ "status": "failed", "message": "User not found" });
                }
            } else {
                res.status(400).send({ "status": "failed", "message": "All fields are required" });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "Error type : " + error });
        }
    }

    static changePassword = async (req, res) => {
        const { password, confirmPassword } = req.body;
        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                res.status(400).send({ "status": "failed", "message": "Passwords do not match" });
            } else {
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } });
                res.status(200).send({ "status": "success", "message": "Password changed successfully" });
            }
        } else {
            res.status(400).send({ "status": "failed", "message": "All fields are required" });
        }
    }

    static loggedUser = async (req, res) => {
        res.status(200).send({ "status": "success", "user": req.user });
    }

    static forgotPassword = async (req, res) => {
        const { email } = req.body;
        if (email) {
            const user = await userModel.findOne({ email: email });
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
                const link = `http://localhost:3000/api/v1/user/reset-password/${user._id}/${token}`;
                res.status(200).send({ "status": "success", "message": "Password reset link sent to your email", "link": link });
            } else {
                res.status(400).send({ "status": "failed", "message": "User not found" });
            }
        } else {
            res.status(400).send({ "status": "failed", "message": "Please enter your email" });
        }
    }

    static resetPassword = async (req, res) => {
        const { password, confirmPassword } = req.body;
        const { id, token } = req.body;
        const user = await userModel.findById(id);
        const newSecret = user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, newSecret);
            if (password && confirmPassword) {
                if (password !== confirmPassword) {
                    res.status(400).send({ "status": "failed", "message": "Passwords do not match" });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const newHashPassword = await bcrypt.hash(password, salt);
                    await userModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });
                    res.status(200).send({ "status": "success", "message": "Password reset successfully" });
                }
            } else {
                res.status(400).send({ "status": "failed", "message": "All fields are required" });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "Invalid token" });
        }
    }

    static mailVerification = async (req, res) => {
        try {
            if (req.query.id === undefined) {
                return res.status(404).send({ "status": "failed", "message": "Invalid token!" });
            }
            const userData = await userModel.findOne({ _id: req.query.id });
            if (userData) {
                if (userData.isVerified === 1) {
                    return res.status(400).send({ "status": "failed", "message": "Email already verified!" });
                }
                await userModel.findByIdAndUpdate({ _id: req.query.id }, {
                    $set: {
                        isVerified: 1
                    }
                });
                return res.status(200).send({ "status": "success", "message": "Email verified successfully!" });
            } else {
                return res.status(404).send({ "status": "failed", "message": "User not found!" });
            }
        } catch (error) {
            return res.status(500).send({ "status": "failed", "message": "Something went wrong!" });
        }
    }

    static sendMailVerification = async (req, res) => {
        try {
             const errors = validationResult(req);
             if (!errors.isEmpty()) {
                 return res.status(400).json({ success: false, msg: 'Validation error', errors: errors.array() });
             }
            
        } catch (error) {
            return res.status(500).send({ "status": "failed", "message": "Something went wrong!" });
        }
    }
}

export default userCont;