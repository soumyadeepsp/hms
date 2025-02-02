import mongoose from "mongoose";

const bookingsSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
});

const bookingsModel = mongoose.model('Bookings', bookingsSchema);

export default bookingsModel;