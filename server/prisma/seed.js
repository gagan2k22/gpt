const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seeding...');

    // 1. Seed Fiscal Years
    const fiscalYears = [
        { name: 'FY24', startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31'), isActive: false },
        { name: 'FY25', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), isActive: true },
        { name: 'FY26', startDate: new Date('2025-04-01'), endDate: new Date('2026-03-31'), isActive: false },
    ];

    for (const fy of fiscalYears) {
        await prisma.fiscalYear.upsert({
            where: { name: fy.name },
            update: {},
            create: fy,
        });
    }
    console.log('✓ Fiscal Years seeded');

    // 2. Seed Roles
    const roles = ['Admin', 'Editor', 'Viewer', 'Approver'];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
    }
    console.log('✓ Roles seeded');

    // 3. Seed Admin User
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123', 12);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: 'Admin User',
            email: adminEmail,
            password_hash: adminPassword,
            is_active: true,
            roles: {
                create: {
                    role: {
                        connect: { name: 'Admin' }
                    }
                }
            }
        },
    });
    console.log('✓ Admin user seeded');

    // 4. Seed Master Data - Towers
    const towers = ['IT', 'HR', 'Finance', 'Operations'];
    for (const name of towers) {
        await prisma.tower.upsert({
            where: { id: -1 }, // Hack to force create if not exists by name check usually, but here we just create if empty or ignore
            // Better: findFirst check. But for simplicity in upsert we need unique field.
            // Tower name is not unique in schema? Let's check.
            // Schema: model Tower { id Int @id, name String } - name NOT unique.
            // So we use findFirst.
            update: {},
            create: { name },
        });
        // Actually upsert requires unique where. Since name isn't unique, we'll use findFirst/create
    }

    // Correct approach for non-unique fields
    for (const name of towers) {
        const exists = await prisma.tower.findFirst({ where: { name } });
        if (!exists) {
            await prisma.tower.create({ data: { name } });
        }
    }
    console.log('✓ Towers seeded');

    // 5. Seed Master Data - Vendors
    const vendors = ['Microsoft', 'AWS', 'Google', 'Oracle', 'Dell'];
    for (const name of vendors) {
        const exists = await prisma.vendor.findFirst({ where: { name } });
        if (!exists) {
            await prisma.vendor.create({ data: { name } });
        }
    }
    console.log('✓ Vendors seeded');

    // 6. Seed Master Data - Budget Heads
    // Need a tower first
    const tower = await prisma.tower.findFirst();
    if (tower) {
        const budgetHeads = ['Software Licenses', 'Hardware', 'Consulting', 'Cloud Services'];
        for (const name of budgetHeads) {
            const exists = await prisma.budgetHead.findFirst({ where: { name } });
            if (!exists) {
                await prisma.budgetHead.create({
                    data: {
                        name,
                        tower_id: tower.id
                    }
                });
            }
        }
        console.log('✓ Budget Heads seeded');
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
