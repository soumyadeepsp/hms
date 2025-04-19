import userModel from '../schemas/user.js';
import doctorTokenModel from '../schemas/doctorToken.js';
import jwt from 'jsonwebtoken';
import { generateRandom4DigitNumber, removeSpecialCharacters } from '../utilities/helperFunctions.js';
import axios from 'axios';
import otpModel from '../schemas/otp.js';
import { sendEmail } from '../config/nodemailer.js';
import feedbackModel from '../schemas/feedback.js';
import availableSlotsModel from '../schemas/availableSlots.js';
import bookingsModel from '../schemas/bookings.js';
import mongoose from 'mongoose';

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
            res.cookie('auth_token', token);
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

export const addFeedback = async (req, res) => {
    try {
        const user = req.user;
        const patientId = user._id;
        const { doctorId, rating, feedback } = req.body;
        console.log("patientId =>"+patientId);
        console.log(doctorId, rating, feedback);
        const session = await mongoose.startSession();
        session.startTransaction();
        const newFeedback = new feedbackModel({ patientId: patientId, doctorId: doctorId, rating: rating, feedback: feedback });
        await newFeedback.save({ session: session });
        console.log("new feedback addd");
        const doctor = await userModel.findById(doctorId);
        const patient = await userModel.findById(patientId);
        await doctor.feedbackReceived.push(newFeedback._id);
        await patient.feedbackGiven.push(newFeedback._id);
        const newFeedback1 = new feedbackModel({ doctorId: doctorId, rating: rating, feedback: feedback });
        await newFeedback1.save({ session: session });
        await doctor.save({ session: session });
        await patient.save({ session: session });
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({ message: 'Feedback added successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const addAvailableSlots = async (req, res) => {
    try {
        const user = req.user;
        if (user.type !== 'doctor') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const slots = req.body.slots;
        console.log(slots);
        const slotsPresent = await availableSlotsModel.findOne({ doctorId: user._id });
        if (slotsPresent) {
            // await slotsPresent.deleteOne();
            slotsPresent.slots = slots;
            await slotsPresent.save();
            return res.status(200).json({ message: 'Available slots updated successfully' });
        }
        const availableSlots = await new availableSlotsModel({doctorId: user._id, slots: slots});
        await availableSlots.save();
        console.log(availableSlots);
        return res.status(201).json({ message: 'Available slots added successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const showAvailableSlots = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const availableSlots = await availableSlotsModel.findOne({ doctorId: doctorId});
        if (!availableSlots) {
            return res.status(404).json({ message: 'No available slots found' });
        }
        return res.status(200).json({ message: 'Available slots found successfully', slots: availableSlots.slots });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const bookSlot = async (req, res) => {
    try {
        const user = req.user;
        const { doctorId, date, time } = req.body;
        const doctor = await userModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        const availableSlots = await availableSlotsModel.findOne({ doctorId: doctorId });
        if (!availableSlots) {
            return res.status(404).json({ message: 'No available slots found' });
        }
        if  (doctorId==user._id) {
            return res.status(403).json({ message: 'Forbidden as you cannot book a slot with yourself!' });
        }
        const timeSlots = availableSlots.slots.get(date);
        const index = timeSlots.indexOf(time);
        if (index === -1) {
            return res.status(400).json({ message: 'Slot not available' });
        }
        timeSlots.splice(index, 1);
        availableSlots.slots.set(date, timeSlots);
        await availableSlots.save();
        const newBooking = await new bookingsModel({ doctorId: doctorId, patientId: user._id, date: date, time: time });
        await newBooking.save();
        return res.status(200).json({ message: 'Slot booked successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const cancelBooking = async (req, res) => {
    try {
        const user = req.user;
        const { bookingId } = req.params;
        const booking = await bookingsModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.patientId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const doctorId = booking.doctorId;
        const availableSlots = await availableSlotsModel.findOne({ doctorId: doctorId });
        const timeSlots = availableSlots.slots.get(booking.date);
        timeSlots.push(booking.time);
        availableSlots.slots.set(booking.date, timeSlots);
        await availableSlots.save();
        await booking.deleteOne();
        return res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const fetchAllBookingsForDoctor = async (req, res) => {
    try {
        const user = req.user;
        if (user.type !== 'doctor') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        console.log(user);
        const bookings = await bookingsModel.find({doctorId: user._id});
        console.log(bookings);
        return res.status(200).json({ message: 'Bookings found successfully', bookings: bookings });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const fetchBookingForPatient = async (req, res) => {
    try {
        const user = req.user;
        const booking = await bookingsModel.find({patientId: user._id});
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        return res.status(200).json({ message: 'Booking found successfully', booking: booking });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const cancelBookingByDoctor = async (req, res) => {
    try {
        const user = req.user;
        const { bookingId } = req.body;
        const booking = await bookingsModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.doctorId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await booking.deleteOne();
        return res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const cancelBookingByPatient = async (req, res) => {
    try {
        const user = req.user;
        const booking = await bookingsModel.find({patientId: user._id});
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.patientId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await booking.deleteOne();
        return res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const fetchAllFeedbacksWithRatingAs1 = async (req, res) => {
    try {
        // 1st way using normal find function
        // const feedbacks = await feedbackModel.find({ rating: 1 });
        // if (!feedbacks) {
        //     return res.status(404).json({ message: 'Feedback not found' });
        // }
        //1st way using aggregation
        const feedback = await feedbackModel.aggregate([
            {
                $match: {
                    rating: 1
                }
            }, {
                $project: {
                    doctorId: 0,
                    rating: 0,
                    patientId: 0,
                    _id: 0,
                    feedback: 1
                }
            }
        ]);

        // using JS code (2nd way)
        // const feedbacks = await feedbackModel.findAll();
        // for (let i=0; i<feedbacks.length; i++) {
        //     if (feedbacks[i].rating !== 1) {
        //         feedbacks[i].deleteOne();
        //     }
        // }
        return res.status(200).json({ message: 'Feedback found successfully', feedbacks: feedbacks });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}