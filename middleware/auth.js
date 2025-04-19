// create a middlewale for fetching the auth token from cookie and validating it
import jwt from 'jsonwebtoken';
import userModel from '../schemas/user.js';

export const authMiddleware = async (req, res, next) => {
    console.log("hello world");
    try {
        const token = req.cookies.auth_token;
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
        } catch(err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await userModel.findOne({ email: decoded.email });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}