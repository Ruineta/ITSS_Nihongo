import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import slideRankingRoutes from './routes/slideRankingRoutes.js';
import slideSearchRoutes from './routes/slideSearchRoutes.js';
import slideUploadRoutes from './routes/slideUploadRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5001',
  'http://127.0.0.1:5001'
];

// Middleware
// CORS configuration - allow multiple origins in development

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files (uploaded slides and thumbnails)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teacher Support Hub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      slideSearch: '/api/slides/search',
      slideDetail: '/api/slides/:id',
      slideUpload: '/api/slides/upload',
      slideFilters: '/api/slides/filters',
      slideRanking: '/api/slides/ranking',
      discussion: '/api/discussions/slides/:slideId',
      discussionComments: '/api/discussions/slides/:slideId/comments'
    }
  });
});

// Mount slide upload routes (must be before /api/slides to avoid conflicts)
app.use('/api/slides', slideUploadRoutes);

// Mount slide search routes
app.use('/api/slides', slideSearchRoutes);

// Mount slide ranking routes
app.use('/api/slides/ranking', slideRankingRoutes);

// Mount discussion routes
app.use('/api/discussions', discussionRoutes);

// Mount system routes
app.use('/api/system', systemRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log('=================================');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error('Please either:');
    console.error(`  1. Stop the process using port ${PORT}`);
    console.error(`  2. Use a different port by setting PORT environment variable`);
    console.error('\nTo find the process using port 5000, run:');
    console.error('  Windows: netstat -ano | findstr :5000');
    console.error('  Then kill it: taskkill /PID <PID> /F');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

export default app;
