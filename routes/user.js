import express from 'express';
import { signup, signin, sendMobileOtp } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.get('/signin', signin);
userRouter.post('/send-mobile-otp', sendMobileOtp);

export default userRouter;