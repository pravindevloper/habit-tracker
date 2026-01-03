require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const statsRoutes = require('./routes/stats');
const dayRecordRoutes = require('./routes/dayRecords');

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   Database Connection
======================= */
connectDB();

/* =======================
   Middleware
======================= */
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   Root Route
======================= */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Habit Tracker API is running 🚀'
  });
});

/* =======================
   Health Check
======================= */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

/* =======================
   API Routes
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/records', dayRecordRoutes);

/* =======================
   404 Handler
======================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint not found: ${req.originalUrl}`
    }
  });
});

/* =======================
   Global Error Handler
======================= */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error'
    }
  });
});

/* =======================
   Start Server
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
