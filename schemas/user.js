import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    type: { type: String, required: true, enum: ['patient', 'doctor', 'admin']},
    age: { type: Number, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true, enum: ["M", "F", "O"]}
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = async function(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

const userModel = mongoose.model('User', userSchema);

export default userModel;