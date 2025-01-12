import userModel from '../schemas/user.js';

export const signup = async (req, res) => {
    const data = req.body;
    const user = new userModel(data);
    await user.save();
    console.log(data);
    res.json({ message: 'Data received', data: data });
}