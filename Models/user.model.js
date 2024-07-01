import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require:true,
        unique: true
    },
    password:{
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model.Users || mongoose.model('User', UserSchema);