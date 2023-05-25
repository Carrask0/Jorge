import mongoose from 'mongoose';

export const userDataSchema = new mongoose.Schema({
    username: String,
    password: String,
    score: Number,
}, { collection: 'UserData' });

const UserData = mongoose.model('UserData', userDataSchema);

export default UserData;