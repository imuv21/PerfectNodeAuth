import userModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


class userCont {

    static userSignup = async (req, res) => {
        const { name, email, password, role } = req.body;
        const user = await userModel.findOne({ email: email });
        if (user) {
            res.status(400).send({ "status": "failed", "message": "User already exists" });
        } else {
            if (name && email && password && role) {
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);

                    const newUser = new userModel({ name: name, email: email, password: hashPassword, role: role });
                    await newUser.save();

                    const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
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
            const { email, password } = req.body;
            if( email && password ){
                const user = await userModel.findOne({ email: email });
                if(user !== null){
                    const isMatch = await bcrypt.compare(password, user.password);
                    if((user.email === email) && isMatch){
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
                        res.status(200).send({ "status": "success", "message": "User logged in successfully", "token": token });
                    } else{
                        res.status(400).send({ "status": "failed", "message": "Email or password is incorrect" });
                    }
                } else{
                    res.status(400).send({ "status": "failed", "message": "User not found" });
                }
            } else {
                res.status(400).send({ "status": "failed", "message": "All fields are required" });
            }
        } catch (error){
            res.status(500).send({ "status": "failed", "message": "Error type : " + error });
        } 
    } 

    static changePassword = async (req, res) => {
        const { password, confirmPassword } = req.body;
        if ( password && confirmPassword ) {
            if ( password !== confirmPassword ){
                res.status(400).send({ "status": "failed", "message": "Passwords do not match" });
            } else{
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword }});
                res.status(200).send({ "status": "success", "message": "Password changed successfully" });
            }
        } else{
            res.status(400).send({ "status": "failed", "message": "All fields are required" });
        }
    }
}

export default userCont;