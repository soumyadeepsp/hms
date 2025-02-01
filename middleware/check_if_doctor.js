// create a middlewale for fetching the auth token from cookie and validating it
import jwt from 'jsonwebtoken';
import userModel from '../schemas/user.js';

export const checkIfDoctorMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.type !== 'doctor') {
            return res.status(403).json({ message: 'Forbidden' });
        } else {
            next();
        }
        req.user = user;
        next();
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}