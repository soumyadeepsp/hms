import userModel from '../schemas/user.js';
import jwt from 'jsonwebtoken';
import { generateRandom4DigitNumber } from '../utilities/helperFunctions.js';
import axios from 'axios';

const secretKey = 'your_secret_key'; // Replace with your actual secret key

const apiKeyForOtp = "TbQDydw9pFqAl42YNrKX5v78nkBgPiEHo1cexMtWGVCjUZusL09YwKrT32hjSkzPZO5NBApRV8suMLqG";

// https://www.fast2sms.com/dev/bulkV2?authorization=YOUR_API_KEY&variables_values=5599&route=otp&numbers=7777777777

export const signup = async (req, res) => {
    const data = req.body;
    const user = new userModel(data);
    await user.save();
    console.log(data);
    return res.status(201).json({ message: 'User created successfully' });
}

export const signin = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
        const token = jwt.sign(
            { email: user.email },
            secretKey,
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        return res.status(200).json({ message: 'Signin successful', token: token });
    } else {
        return res.status(401).json({ message: 'Invalid credentials'});
    }
}

export const sendMobileOtp = async (req, res) => {
    // since this API can be called only after signing in, I expect it to provide the token and mobile number
    const { token, mobile } = req.body;
    const jwtData = jwt.verify(token, secretKey);
    const email = jwtData.email;
    const user = await userModel.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const otp = generateRandom4DigitNumber();
    console.log(otp);
    const sendOtpApi = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKeyForOtp}&variables_values=${otp}&route=otp&numbers=${mobile}`;
    // call the sendOtpApi
    try {
        const response = await axios.get(sendOtpApi);
        if (response.data.return) {
            return res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to send OTP' });
        }
    } catch(err) {
        return res.status(400).json({ message: 'Failed to send OTP' });
    }
    
}