const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const activityLogger = async (req, res, next) => {
    // Capture the original end function to log after response is sent
    const originalEnd = res.end;
    const startTime = Date.now();

    // Store chunks to reconstruct response body if needed (optional, skipping for now to save memory)

    res.end = async function (chunk, encoding) {
        // Restore original end
        res.end = originalEnd;
        res.end(chunk, encoding);

        // Only log non-GET requests or specific critical GETs if needed
        // Logging everything for now as per "all the user activity log" request
        // But usually we skip static files or health checks
        if (req.url.startsWith('/api')) {
            try {
                const userId = req.user ? req.user.id : null;
                const username = req.user ? req.user.username || req.user.email : 'Anonymous';

                // Don't log login attempts with passwords in details
                let details = '';
                if (req.body) {
                    const bodyCopy = { ...req.body };
                    if (bodyCopy.password) bodyCopy.password = '***';
                    details = JSON.stringify(bodyCopy);
                }

                await prisma.userActivityLog.create({
                    data: {
                        user_id: userId,
                        username: username,
                        action: `${req.method} ${req.originalUrl || req.url}`,
                        details: details.substring(0, 1000), // Truncate if too long
                        ip_address: req.ip || req.connection.remoteAddress,
                        timestamp: new Date()
                    }
                });
            } catch (error) {
                console.error('Error logging activity:', error);
            }
        }
    };

    next();
};

module.exports = activityLogger;
