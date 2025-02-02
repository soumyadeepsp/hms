import express from 'express';
import { signup, signin, sendMobileOtp, verifyMobileOtp, 
    sendEmailController, testController, searchDoctors, 
    addFeedback, addAvailableSlots, showAvailableSlots, 
    bookSlot, fetchAllBookingsForDoctor, fetchBookingForPatient, 
    cancelBookingByDoctor, cancelBookingByPatient } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkIfDoctorMiddleware } from '../middleware/check_if_doctor.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.get('/signin', signin);
userRouter.post('/send-mobile-otp', sendMobileOtp);
userRouter.post('/verify-mobile-otp', verifyMobileOtp);
userRouter.post('/send-email', sendEmailController);
userRouter.get('/test-api', testController);
userRouter.get('/search-doctors/:query', searchDoctors);
userRouter.post('/add-feedback', authMiddleware, addFeedback);
userRouter.post('/add-available-slots', authMiddleware, addAvailableSlots);
userRouter.get('/show-available-slots/:doctorId', showAvailableSlots);
userRouter.post('/book-slot', authMiddleware, bookSlot);
userRouter.get('/get-doctor-bookings', authMiddleware, fetchAllBookingsForDoctor);
userRouter.get('/get-patient-booking', authMiddleware, fetchBookingForPatient);
userRouter.delete('/delete-booking/:bookingId', authMiddleware, cancelBookingByDoctor);
userRouter.delete('/delete-booking/:bookingId', authMiddleware, cancelBookingByPatient);

export default userRouter;