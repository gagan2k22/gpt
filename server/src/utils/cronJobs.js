const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

const initCronJobs = () => {
    console.log('Initializing Cron Jobs...');

    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily cleanup job...');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await prisma.userActivityLog.deleteMany({
                where: {
                    timestamp: {
                        lt: thirtyDaysAgo
                    }
                }
            });

            console.log(`Cleanup complete. Deleted ${result.count} old activity logs.`);
        } catch (error) {
            console.error('Error in cleanup job:', error);
        }
    });
};

module.exports = { initCronJobs };
