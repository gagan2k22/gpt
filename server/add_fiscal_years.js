const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFiscalYears() {
    try {
        const fiscalYears = [
            {
                year: 2025,
                label: 'FY25',
                description: 'Fiscal Year 2025-2026',
                is_active: true,
                start_date: new Date('2025-04-01'),
                end_date: new Date('2026-03-31')
            },
            {
                year: 2026,
                label: 'FY26',
                description: 'Fiscal Year 2026-2027',
                is_active: true,
                start_date: new Date('2026-04-01'),
                end_date: new Date('2027-03-31')
            },
            {
                year: 2027,
                label: 'FY27',
                description: 'Fiscal Year 2027-2028',
                is_active: false, // Disabled by default, admin can enable
                start_date: new Date('2027-04-01'),
                end_date: new Date('2028-03-31')
            },
            {
                year: 2028,
                label: 'FY28',
                description: 'Fiscal Year 2028-2029',
                is_active: false,
                start_date: new Date('2028-04-01'),
                end_date: new Date('2029-03-31')
            }
        ];

        for (const fy of fiscalYears) {
            await prisma.fiscalYear.upsert({
                where: { year: fy.year },
                update: {},
                create: fy
            });
            console.log(`✓ Added/Updated ${fy.label}`);
        }

        console.log('\n✅ Fiscal years added successfully!');
    } catch (error) {
        console.error('Error adding fiscal years:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addFiscalYears();
