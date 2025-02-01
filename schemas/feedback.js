import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true , enum: [1,2,3,4,5] },
    feedback: { type: String }
});

const feedbackModel = mongoose.model('Feedback', feedbackSchema);

export default feedbackModel;