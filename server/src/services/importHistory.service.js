const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ImportHistoryService {
    async getImportHistory(userId, isAdmin) {
        const where = isAdmin ? {} : { userId };

        return await prisma.importJob.findMany({
            where,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}

module.exports = new ImportHistoryService();
