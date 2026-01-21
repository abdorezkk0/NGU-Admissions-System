const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./shared/config/environment');
const connectDB = require('./shared/config/database');
const { testSupabaseConnection } = require('./shared/config/supabase');
const logger = require('./shared/middleware/requestLogger');
const errorHandler = require('./shared/middleware/errorHandler');
const { apiLimiter } = require('./shared/middleware/rateLimiter');

// Import routes
const authRoutes = require('./modules/auth/routes/authRoutes');
const applicationRoutes = require('./modules/applications/routes/applicationRoutes');
const documentRoutes = require('./modules/documents/routes/documentRoutes');
const storageRoutes = require('./modules/file-storage/routes/storageRoutes');
const eligibilityRoutes = require('./modules/eligibility/routes/eligibilityRoutes'); // ← ADD THIS

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);
app.use('/api', apiLimiter);

// ============================================
// ROUTES
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NGU Admissions API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      applications: '/api/applications',
      programs: '/api/applications/programs',
      documents: '/api/documents',
      files: '/api/files',
      eligibility: '/api/eligibility', // ← ADD THIS
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/files', storageRoutes);
app.use('/api/eligibility', eligibilityRoutes); // ← ADD THIS

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

    // Connect to Supabase (using PostgreSQL)
    await connectDB();
    
    // Test Supabase connection
    await testSupabaseConnection();

    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`\n📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`\n🔐 API Endpoints:`);
      console.log(`   Auth:         http://localhost:${PORT}/api/auth`);
      console.log(`   Applications: http://localhost:${PORT}/api/applications`);
      console.log(`   Documents:    http://localhost:${PORT}/api/documents`);
      console.log(`   Files:        http://localhost:${PORT}/api/files`);
      console.log(`   Eligibility:  http://localhost:${PORT}/api/eligibility\n`); // ← ADD THIS
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();