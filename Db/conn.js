import mongoose from 'mongoose';
// const config = require('config');
// const URL = config.get('mongoURL');
import { DB_NAME } from '../constants.js';

//connect to database
const mongoConnect = async() => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`DB is Connected!! ${connectionInstance.connection.host}`);
    }catch(e){
        console.log('MongoDB connection Failed : ',e);
        process.exit(1);
    }
}

export default mongoConnect;