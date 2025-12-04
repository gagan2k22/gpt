/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs to prevent XSS and injection attacks
 */

const validator = require('validator');

/**
 * Validate email format
 */
const validateEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Sanitize email
    req.body.email = validator.normalizeEmail(email);
    next();
};

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
const validatePassword = (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long'
        });
    }

    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            message: 'Password must contain at least one uppercase letter'
        });
    }

    if (!/[a-z]/.test(password)) {
        return res.status(400).json({
            message: 'Password must contain at least one lowercase letter'
        });
    }

    if (!/[0-9]/.test(password)) {
        return res.status(400).json({
            message: 'Password must contain at least one number'
        });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({
            message: 'Password must contain at least one special character'
        });
    }

    next();
};

/**
 * Sanitize string inputs to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return validator.escape(str.trim());
    };

    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (key !== 'password' && typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }

    // Sanitize query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }

    next();
};

/**
 * Validate numeric inputs
 */
const validateNumeric = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            const value = req.body[field];
            if (value !== undefined && value !== null) {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    return res.status(400).json({
                        message: `${field} must be a valid number`
                    });
                }
                req.body[field] = num;
            }
        }
        next();
    };
};

/**
 * Validate date inputs
 */
const validateDate = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            const value = req.body[field];
            if (value !== undefined && value !== null) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return res.status(400).json({
                        message: `${field} must be a valid date`
                    });
                }
                req.body[field] = date;
            }
        }
        next();
    };
};

/**
 * Validate required fields
 */
const validateRequired = (fields) => {
    return (req, res, next) => {
        const missing = [];
        for (const field of fields) {
            if (!req.body[field]) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    sanitizeInput,
    validateNumeric,
    validateDate,
    validateRequired
};
