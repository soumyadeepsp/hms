import doctorTokenModel from '../schemas/doctorToken.js';
import userModel from '../schemas/user.js';
import { removeSpecialCharacters } from '../utilities/helperFunctions.js';

export const addDoctors = async (req, res) => {
    try {
        const { doctors } = req.body;
        console.log(doctors);
        await userModel.insertMany(doctors);
        return res.status(201).json({ message: 'Doctors added successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const createDoctorTokens = async (req, res) => {
    try {
        const doctors = await userModel.find({ type: 'doctor' });
        const doctorTokens = [];
        for (let i=0; i<doctors.length; i++) {
            const doctorId = doctors[i]._id;
            const token = await doctorTokenModel.findOne({ doctor_id: doctorId });
            if (!token) {
                // token is not present
                const doctorNameTokens = removeSpecialCharacters(doctors[i].name).split(' ');
                const doctorDescriptionTokens = removeSpecialCharacters(doctors[i].description).split(' ');
                const temp = [...doctorNameTokens, ...doctorDescriptionTokens];
                doctorTokens.push({
                    doctor_id: doctorId,
                    token: temp
                });
            }
        }
        await doctorTokenModel.insertMany(doctorTokens);
        return res.status(200).json({ message: 'Doctor tokens created successfully' });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}