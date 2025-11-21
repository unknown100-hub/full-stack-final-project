// Configure the database connection
const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_tracker';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully (${uri})`);
  } catch (error) {
    console.error('MongoDB connection failed:', error?.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
