const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const connectDB = require('./server/database/connection');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./server/middleware/rateLimiter');

require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 10000;

// Trust Heroku proxy for correct client IPs
app.set('trust proxy', 1);

// Logging and parsing - move these before CORS
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' })); // Limit body size

// CORS configuration - must be before other middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://amazing-swan-11178c.netlify.app',
  'https://amazing-swan-11178c.netlify.app/'
];

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log incoming request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    origin,
    'user-agent': req.headers['user-agent']
  });

  // Allow all origins for now (restrict in production)
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Content-Length', '0');
    return res.status(204).end();
  }

  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: {
      origin: req.headers.origin,
      authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined,
      'content-type': req.headers['content-type']
    }
  });
  next();
});

// Custom MongoDB sanitization middleware
const sanitizeMongo = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj) return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    
    // Handle objects
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Remove MongoDB operators
        if (key.startsWith('$')) {
          continue;
        }
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize query parameters
  if (req.query) {
    const sanitizedQuery = sanitize(req.query);
    // Instead of mutating req.query, we'll attach sanitized version to req
    req.sanitizedQuery = sanitizedQuery;
  }

  // Sanitize request body
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Apply custom sanitization
app.use(sanitizeMongo);

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Static files
app.set("view engine", "ejs");
app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
app.use('/img', express.static(path.resolve(__dirname, "assets/img")));
app.use('/js', express.static(path.resolve(__dirname, "assets/js")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Database connection
connectDB();

// Routes
app.use('/', require('./server/routes/router'));

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Create HTTP server
const http = require('http');
const server = http.createServer(app);

// Start server only when we have a valid database connection
const startServer = () => {
  // Start the server on all network interfaces (0.0.0.0)
  server.listen(PORT, '0.0.0.0', () => {
    const address = server.address();
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server listening on http://${address.address}:${address.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  return server;
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server after database connection is established
console.log('Starting server initialization...');

// In production, connect to database first
if (process.env.NODE_ENV === 'production') {
  console.log('Connecting to database...');
  connectDB()
    .then(() => {
      console.log('✅ Database connected successfully');
      startServer();
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err);
      process.exit(1);
    });
} else {
  // In development, start server immediately
  console.log('Starting server in development mode...');
  startServer();
}

module.exports = app; // For testing