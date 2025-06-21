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
const PORT = process.env.PORT || 8080;

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

// Simple CORS middleware
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

// Apply CORS middleware to all routes
app.use(corsMiddleware);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});