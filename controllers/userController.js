import userModel from '../schemas/user.js';
import doctorTokenModel from '../schemas/doctorToken.js';
import jwt from 'jsonwebtoken';
import { generateRandom4DigitNumber, removeSpecialCharacters } from '../utilities/helperFunctions.js';
import axios from 'axios';
import otpModel from '../schemas/otp.js';
import { sendEmail } from '../config/nodemailer.js';

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
    try {
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
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error or expired token' });
    }
}

export const sendMobileOtp = async (req, res) => {
    // since this API can be called only after signing in, I expect it to provide the token and mobile number
    try {
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
        const response = await axios.get(sendOtpApi);
        if (response.data.return) {
            // if sending otp was successful, only then will I store the otp in the database
            const newOtp = new otpModel({ otp: otp, email: email, type: 'mobile' });
            await newOtp.save();
            newOtp.autoDelete();
            return res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to send OTP' });
        }
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error or expired token' });
    }
}

export const verifyMobileOtp = async (req, res) => {
    try {
        const { token, otp, mobile } = req.body;
        const jwtData = jwt.verify(token, secretKey);
        const email = jwtData.email;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otpDoc = await otpModel.findOne({ email: email, otp: otp, type: 'mobile' });
        if (!otpDoc) {
            return res.status(400).json({ message: 'Invalid OTP or the OTP has expired.' });
        }
        user.mobile = mobile;
        user.is_mobile_verified = true;
        await user.save();
        await otpDoc.deleteOne(); // instantly delete the otp from the database
        return res.status(200).json({ message: 'Mobile number verified successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error or expired token' });
    }
}

export const sendEmailController = async (req, res) => {
    try {
        const { token, email, subject, text } = req.body;
        const jwtData = jwt.verify(token, secretKey);
        const userEmail = jwtData.email;
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await sendEmail(email, subject, text);
        return res.status(200).json({ message: 'Email sent successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error or expired token' });
    }
}

export const testController = (req, res) => {
    try {
        const query = req.query;
        console.log(query.k1);
        const headers = req.headers;
        console.log(headers);
        return res.status(200).json({ message: 'Test API' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const searchDoctors = async (req, res) => {
    try {
        const query = req.params.query;
        const searchTokens = removeSpecialCharacters(query).split(' ');
        const doctorTokens = await doctorTokenModel.find({});
        const tokenMatchingScore = [];
        for (let i=0; i<doctorTokens.length; i++) {
            const tokens = doctorTokens[i].token;
            let score = 0;
            for (let j=0; j<searchTokens.length; j++) {
                if (tokens.includes(searchTokens[j])) {
                    score++;
                }
            }
            tokenMatchingScore.push({ doctor_id: doctorTokens[i].doctor_id, score: score });
        }
        await tokenMatchingScore.sort((a, b) => a.score - b.score);
        console.log(tokenMatchingScore);
        const doctors = [];
        for (let i=tokenMatchingScore.length-1; i>=tokenMatchingScore.length-5; i--) {
            if (tokenMatchingScore[i].score === 0) {
                break;
            }
            const doctor = await userModel.findById(tokenMatchingScore[i].doctor_id );
            console.log(doctor);
            doctors.push(doctor);
        }
        console.log(doctors);
        return res.status(200).json({ message: 'Doctors found successfully', doctors: doctors });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}