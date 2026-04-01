import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
