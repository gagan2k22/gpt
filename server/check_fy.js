const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking for FiscalYear model in Prisma Client...');
        if (prisma.fiscalYear) {
            console.log('✅ prisma.fiscalYear exists.');
            const count = await prisma.fiscalYear.count();
            console.log(`Found ${count} FiscalYear records.`);
            const years = await prisma.fiscalYear.findMany();
            console.log('Records:', years);
        } else {
            console.error('❌ prisma.fiscalYear is UNDEFINED. Client generation might be out of sync.');
        }
    } catch (error) {
        console.error('Error accessing FiscalYear:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
