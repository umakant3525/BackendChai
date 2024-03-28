import mongoose from "mongoose";
import{ DB_NAME} from '../constants.js';

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected!!\nDB Host: ${mongoose.connection.host}`);
    } catch(error) {
        console.error("MongoDB connection Error:", error);
        process.exit(1);
    }
};

export default connectDB;
