import express from 'express';
import userRouter from './user.js';
import adminRouter from './admin.js';

const router = express.Router();

router.use('/user', userRouter);
router.use('/admin', adminRouter);

export default router;