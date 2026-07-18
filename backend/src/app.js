require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const authRoutes = require('./auth/authRoutes');
const userRoutes = require('./users/userRoutes');
const tutorRoutes = require('./tutors/tutorRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
const corsOrigin = process.env.CLIENT_URL || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (profile pictures, documents)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TutorConnect Auth & User Management API is running.' });
});

// Database readiness check for routes that use MongoDB
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Start MongoDB or update MONGO_URI in .env.',
    });
  }

  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tutors', tutorRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    const suggestedPort = Number(PORT) + 1 || 5001;
    console.error(`Port ${PORT} is already in use. Set a different PORT in .env, for example PORT=${suggestedPort}.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error.message);
  process.exit(1);
});
