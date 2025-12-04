const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const logs = await prisma.userActivityLog.findMany({
            take: 10,
            orderBy: {
                timestamp: 'desc'
            }
        });

        let output = '--- Recent Activity Logs ---\n';
        logs.forEach(log => {
            output += `[${log.timestamp.toISOString()}] User: ${log.username || 'Anonymous'} | Action: ${log.action}\n`;
            output += `Details: ${log.details}\n`;
            output += '---------------------------\n';
        });

        if (logs.length === 0) {
            output += 'No logs found.\n';
        }

        fs.writeFileSync('logs_output.txt', output);
        console.log('Logs written to logs_output.txt');

    } catch (error) {
        fs.writeFileSync('logs_output.txt', `Error: ${error.message}`);
        console.error('Error fetching logs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
