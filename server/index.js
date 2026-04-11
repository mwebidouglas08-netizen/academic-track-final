require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow React app inline scripts
  crossOriginEmbedderPolicy: false,
}));

// ── CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later.' } }));
app.use('/api/admin/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts.' } }));
app.use('/api/', rateLimit({ windowMs: 1 * 60 * 1000, max: 120, message: { error: 'Rate limit exceeded.' } }));

// ── Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// ── Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(buildPath));

  // Student app at /
  app.get('*', (req, res, next) => {
    // If it's an API route return 404 instead of the HTML
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ── Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry — that record already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record not found.' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  AcademiTrack server running on port ${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
