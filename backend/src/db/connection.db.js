import mongoose from 'mongoose';
import { DB_URI } from '../config/config.js';

const connectDB = async () => {
  try {
    // Remove __v from all JSON responses globally
    mongoose.set('toJSON', { virtuals: true, versionKey: false });
    mongoose.set('toObject', { virtuals: true, versionKey: false });

    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
export default connectDB;
