import express from 'express';
import { addDoctors, createDoctorTokens } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctors', addDoctors);
adminRouter.get('/create-doctor-tokens', createDoctorTokens);

export default adminRouter;