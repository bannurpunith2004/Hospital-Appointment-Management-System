import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carepoint', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error('Please ensure MongoDB is running locally or specify a valid MONGODB_URI in .env');
    // We do not force process.exit(1) so that the app gives helpful error responses instead of crashing abruptly
  }
};

export default connectDB;
