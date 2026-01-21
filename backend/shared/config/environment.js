require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI,

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

  // 🔹 ADD THIS
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'documents',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-for-dev-only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  // 🔹 STORAGE PROVIDER SWITCH
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local', // "local" or "supabase"
};

// Validate critical environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter((varName) => !config[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
}

module.exports = config;
