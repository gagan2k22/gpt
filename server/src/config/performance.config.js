// Performance Configuration
// Adjust these values based on your environment and requirements

module.exports = {
    // Database Configuration
    // Note: Connection pooling is configured via DATABASE_URL query parameters
    // Example SQLite: DATABASE_URL="file:./dev.db?connection_limit=10&pool_timeout=10"
    // Example PostgreSQL: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10
    database: {
        queryTimeout: process.env.DB_QUERY_TIMEOUT || 10000, // 10 seconds
    },

    // API Configuration
    api: {
        requestTimeout: process.env.API_TIMEOUT || 15000, // 15 seconds
        bodyLimit: process.env.API_BODY_LIMIT || '5mb',
        compressionLevel: process.env.COMPRESSION_LEVEL || 6, // 1-9, 6 is balanced
        corsMaxAge: process.env.CORS_MAX_AGE || 86400, // 24 hours
    },

    // Pagination Defaults
    pagination: {
        defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 50,
        maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 1000,
        lineItemsPageSize: parseInt(process.env.LINE_ITEMS_PAGE_SIZE) || 100,
    },

    // Logging Configuration
    logging: {
        enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
        logLevel: process.env.LOG_LEVEL || 'error', // 'error', 'warn', 'info', 'debug'
        enableRequestLogging: process.env.NODE_ENV === 'development',
    },

    // Cache Configuration (for future implementation)
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
        maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100, // MB
    },

    // Performance Monitoring
    monitoring: {
        enableMetrics: process.env.ENABLE_METRICS === 'true',
        metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 60000, // 1 minute
    },
};
