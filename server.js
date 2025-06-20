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
  'https://amazing-swan-11178c.netlify.app', // Netlify production frontend
  'https://amazing-swan-11178c.netlify.app/' // With trailing slash for consistency
];

// Enable CORS pre-flight requests
app.options('*', cors());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins (case-insensitive and ignore trailing slashes)
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      allowedOrigin.toLowerCase() === normalizedOrigin.toLowerCase() ||
      (allowedOrigin.endsWith('/') && allowedOrigin.slice(0, -1).toLowerCase() === normalizedOrigin.toLowerCase())
    );
    
    if (!isAllowed) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.error('CORS Error:', msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Access-Control-Allow-Credentials'],
  maxAge: 86400 // 24 hours
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

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