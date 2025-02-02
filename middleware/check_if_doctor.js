// create a middlewale for fetching the auth token from cookie and validating it

export const checkIfDoctorMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.type !== 'doctor') {
            console.log("you are not a doctor");
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