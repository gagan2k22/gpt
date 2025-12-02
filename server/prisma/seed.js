const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const addFiscalYears = require('../add_fiscal_years');

async function main() {
    console.log('Starting seed...');
    // Add other seed calls here if needed
    // For now, we just want to ensure fiscal years are added
    // Note: add_fiscal_years.js is a standalone script, so requiring it might run it immediately 
    // or we might need to export a function from it.
    // Let's check add_fiscal_years.js content first.
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
