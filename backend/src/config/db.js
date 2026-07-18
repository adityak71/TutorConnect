const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let retryTimer = null;
let lastConnectionError = '';

mongoose.connection.on('connected', () => {
  lastConnectionError = '';
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
});

const scheduleReconnect = () => {
  if (retryTimer) return;

  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectDB();
  }, 5000);
};

mongoose.connection.on('disconnected', () => {
  scheduleReconnect();
});

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tutorconnect';

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    const message = `MongoDB connection failed: ${error.message}. Retrying in 5 seconds...`;
    if (message !== lastConnectionError) {
      console.error(message);
      lastConnectionError = message;
    }
    scheduleReconnect();
  }
};

module.exports = connectDB;
