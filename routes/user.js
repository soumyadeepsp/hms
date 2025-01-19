import express from 'express';
import { signup, signin, sendMobileOtp, verifyMobileOtp, sendEmailController, testController } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.get('/signin', signin);
userRouter.post('/send-mobile-otp', sendMobileOtp);
userRouter.post('/verify-mobile-otp', verifyMobileOtp);
userRouter.post('/send-email', sendEmailController);
userRouter.get('/test-api', testController);

export default userRouter;