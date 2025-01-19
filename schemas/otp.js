import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    otp: { type: Number, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true, enum: ['email', 'mobile']}
});

otpSchema.methods.autoDelete = function() {
    setTimeout(() => {
        this.deleteOne()
            .then(() => console.log(`OTP for ${this.email} deleted after 30 seconds`))
            .catch(err => console.error(`Error deleting OTP for ${this.email}:`, err));
    }, 30000); // 30 seconds
};

const otpModel = mongoose.model('Otp', otpSchema);

export default otpModel;