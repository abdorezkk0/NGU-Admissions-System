const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./shared/config/environment');
const connectDB = require('./shared/config/database');
const { testSupabaseConnection } = require('./shared/config/supabase');
const logger = require('./shared/middleware/requestLogger');
const errorHandler = require('./shared/middleware/errorHandler');
const { apiLimiter } = require('./shared/middleware/rateLimiter');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logger);

// Rate limiting for API routes
app.use('/api', apiLimiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API routes (will add modules here)
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NGU Admissions API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      applications: '/api/applications',
      documents: '/api/documents',
      notifications: '/api/notifications',
      eligibility: '/api/eligibility',
    },
  });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// DATABASE CONNECTIONS & SERVER START
// ============================================

const startServer = async () => {
  try {
    console.log('🚀 Starting NGU Admissions Backend...\n');

    // Connect to MongoDB
    await connectDB();

    // Test Supabase connection
    await testSupabaseConnection();

    // Start Express server
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`\n📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();