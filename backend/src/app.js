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
const availabilityRoutes = require('./availability/availabilityRoutes');
const sessionRoutes = require('./sessions/sessionRoutes');
const paymentRoutes = require('./payments/paymentRoutes');
const reviewRoutes = require('./reviews/reviewRoutes');
const progressRoutes = require('./progress/progressRoutes');
const dashboardRoutes = require('./dashboard/dashboardRoutes');
const notificationRoutes = require('./notifications/notificationRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TutorConnect API',
      version: '1.0.0',
      description: 'API for TutorConnect Application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/**/*.js'], // look for swagger annotations in all src files
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use('/availability', availabilityRoutes);
app.use('/sessions', sessionRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/progress', progressRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notifications', notificationRoutes);

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
