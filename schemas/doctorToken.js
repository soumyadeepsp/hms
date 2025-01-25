import mongoose from "mongoose";

const doctorTokenSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: [{ type: String, required: true }],
});

const doctorTokenModel = mongoose.model('DoctorTokens', doctorTokenSchema);

export default doctorTokenModel;