import mongoose from "mongoose";

const availableSlotsSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slots: [{ type: String, required: true }]
});

const availableSlotsModel = mongoose.model('Available Slots', availableSlotsSchema);

export default availableSlotsModel;