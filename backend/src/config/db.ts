// Opens the MongoDB connection used by the API process.
import mongoose from "mongoose";
import Note from "../models/Note.js";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    await Note.syncIndexes();
  } catch (error) {
    console.error("Error connecting to MONGODB", error);
    process.exit(1);
  }
};
