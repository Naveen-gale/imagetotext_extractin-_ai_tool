import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MongoDB URI is missing in .env");
            return;
        }
        
        mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected."));
        mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected."));

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Initial Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
