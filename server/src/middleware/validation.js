// Input validation middleware to prevent crashes from invalid data

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                return res.status(400).json({
                    message: 'Validation Error',
                    errors
                });
            }

            req.body = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

// Validate numeric ID parameters
const validateId = (req, res, next) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        if (isNaN(numericId) || numericId < 1) {
            return res.status(400).json({
                message: 'Invalid ID parameter',
                error: 'ID must be a positive integer'
            });
        }

        req.params.id = numericId;
        next();
    } catch (err) {
        next(err);
    }
};

// Validate query parameters
const validateQuery = (allowedParams = []) => {
    return (req, res, next) => {
        try {
            const queryKeys = Object.keys(req.query);
            const invalidParams = queryKeys.filter(key => !allowedParams.includes(key));

            if (invalidParams.length > 0) {
                return res.status(400).json({
                    message: 'Invalid query parameters',
                    invalidParams,
                    allowedParams
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (req, res, next) => {
    try {
        const sanitize = (obj) => {
            if (typeof obj === 'string') {
                // Remove potentially dangerous characters
                return obj.replace(/[<>]/g, '');
            }
            if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    obj[key] = sanitize(obj[key]);
                }
            }
            return obj;
        };

        if (req.body) {
            req.body = sanitize(req.body);
        }
        if (req.query) {
            req.query = sanitize(req.query);
        }
        if (req.params) {
            req.params = sanitize(req.params);
        }

        next();
    } catch (err) {
        next(err);
    }
};

// Validate required fields
const validateRequired = (fields) => {
    return (req, res, next) => {
        try {
            const missingFields = [];

            for (const field of fields) {
                if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                    missingFields.push(field);
                }
            }

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    missingFields
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

// Validate data types
const validateTypes = (typeMap) => {
    return (req, res, next) => {
        try {
            const errors = [];

            for (const [field, expectedType] of Object.entries(typeMap)) {
                const value = req.body[field];

                if (value === undefined || value === null) {
                    continue; // Skip if field is not present
                }

                let isValid = true;

                switch (expectedType) {
                    case 'number':
                        isValid = !isNaN(parseFloat(value)) && isFinite(value);
                        break;
                    case 'integer':
                        isValid = Number.isInteger(Number(value));
                        break;
                    case 'string':
                        isValid = typeof value === 'string';
                        break;
                    case 'boolean':
                        isValid = typeof value === 'boolean' || value === 'true' || value === 'false';
                        break;
                    case 'date':
                        isValid = !isNaN(Date.parse(value));
                        break;
                    case 'email':
                        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        break;
                    case 'array':
                        isValid = Array.isArray(value);
                        break;
                    case 'object':
                        isValid = typeof value === 'object' && !Array.isArray(value);
                        break;
                }

                if (!isValid) {
                    errors.push({
                        field,
                        expectedType,
                        receivedValue: value
                    });
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Type validation failed',
                    errors
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

// Async handler wrapper to catch errors in async route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        try {
            const key = req.ip || req.connection.remoteAddress;
            const now = Date.now();

            if (!rateLimitMap.has(key)) {
                rateLimitMap.set(key, []);
            }

            const requests = rateLimitMap.get(key);
            const recentRequests = requests.filter(time => now - time < windowMs);

            if (recentRequests.length >= maxRequests) {
                return res.status(429).json({
                    message: 'Too many requests',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            recentRequests.push(now);
            rateLimitMap.set(key, recentRequests);

            // Cleanup old entries periodically
            if (Math.random() < 0.01) {
                for (const [k, times] of rateLimitMap.entries()) {
                    const recent = times.filter(time => now - time < windowMs);
                    if (recent.length === 0) {
                        rateLimitMap.delete(k);
                    } else {
                        rateLimitMap.set(k, recent);
                    }
                }
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = {
    validateRequest,
    validateId,
    validateQuery,
    sanitizeInput,
    validateRequired,
    validateTypes,
    asyncHandler,
    rateLimit
};
