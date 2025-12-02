const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - should be first
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false
}));

// Compression middleware for response optimization
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6 // Balance between speed and compression ratio
}));

// Enhanced CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '5mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request timeout middleware
app.use((req, res, next) => {
    req.setTimeout(15000); // Reduced to 15 seconds
    res.setTimeout(15000);
    next();
});

// Lightweight request logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'OPEX Management System API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Routes with error handling wrappers
try {
    const authRoutes = require('./routes/auth.routes');
    const userRoutes = require('./routes/user.routes');
    const masterDataRoutes = require('./routes/masterData.routes');
    const budgetRoutes = require('./routes/budget.routes');
    const poRoutes = require('./routes/po.routes');
    const actualsRoutes = require('./routes/actuals.routes');
    const lineItemRoutes = require('./routes/lineItem.routes');
    const fiscalYearRoutes = require('./routes/fiscalYear.routes');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/master', masterDataRoutes);
    app.use('/api/budgets', budgetRoutes);
    app.use('/api/pos', poRoutes);
    app.use('/api/actuals', actualsRoutes);
    app.use('/api/line-items', lineItemRoutes);
    app.use('/api/fiscal-years', fiscalYearRoutes);
} catch (error) {
    console.error('Error loading routes:', error);
    process.exit(1);
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// Global Error Handler with detailed logging
app.use((err, req, res, next) => {
    console.error('=== ERROR ===');
    console.error('Time:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('=============');

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Unauthorized',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Authentication required'
        });
    }

    if (err.code === 'P2002') { // Prisma unique constraint error
        return res.status(409).json({
            message: 'Duplicate entry',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Record already exists'
        });
    }

    if (err.code === 'P2025') { // Prisma record not found
        return res.status(404).json({
            message: 'Record not found',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Requested resource not found'
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server with error handling
let server;
try {
    server = app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`✓ Server is running on port ${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ Time: ${new Date().toISOString()}`);
        console.log('='.repeat(50));
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use`);
        } else {
            console.error('Server error:', error);
        }
        process.exit(1);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
        });
    }

    try {
        const prisma = require('./prisma');
        await prisma.$disconnect();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

module.exports = app;
