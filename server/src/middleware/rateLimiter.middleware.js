/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login attempts
 * 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: true
});

/**
 * Rate limiter for registration
 * 3 attempts per hour per IP
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: {
        message: 'Too many registration attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for general API calls
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for file uploads
 * 10 uploads per hour per IP
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per window
    message: {
        message: 'Too many upload attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for password reset
 * 3 attempts per hour per IP
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: {
        message: 'Too many password reset attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    registerLimiter,
    apiLimiter,
    uploadLimiter,
    passwordResetLimiter
};
