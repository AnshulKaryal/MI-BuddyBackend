import mongoose from 'mongoose';
import 'dotenv/config'

const mongoConnect = async() => {
    mongoose.set('strictQuery',true);
    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database Connected");
    return db;
}

export default mongoConnect;