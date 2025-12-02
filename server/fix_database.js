const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function fixDuplicateUIDs() {
    log('\n=== Fixing Duplicate UIDs ===', colors.cyan);

    try {
        const lineItems = await prisma.lineItem.findMany();
        const uidMap = new Map();
        const duplicates = [];

        lineItems.forEach(item => {
            if (uidMap.has(item.uid)) {
                duplicates.push(item);
            } else {
                uidMap.set(item.uid, item);
            }
        });

        if (duplicates.length > 0) {
            log(`Found ${duplicates.length} duplicate UIDs`, colors.yellow);

            for (const item of duplicates) {
                const newUID = `${item.uid}-${item.id}`;
                await prisma.lineItem.update({
                    where: { id: item.id },
                    data: { uid: newUID }
                });
                log(`✓ Fixed duplicate UID: ${item.uid} → ${newUID}`, colors.green);
            }
        } else {
            log('✓ No duplicate UIDs found', colors.green);
        }
    } catch (error) {
        log(`✗ Error fixing duplicate UIDs: ${error.message}`, colors.red);
    }
}

async function fixOrphanedRecords() {
    log('\n=== Fixing Orphaned Records ===', colors.cyan);

    try {
        // Check for line items with invalid vendor references
        const lineItems = await prisma.lineItem.findMany({
            include: { vendor: true }
        });

        const invalidVendorItems = lineItems.filter(item => !item.vendor);

        if (invalidVendorItems.length > 0) {
            log(`Found ${invalidVendorItems.length} line items with invalid vendor references`, colors.yellow);

            // Create a default vendor if needed
            let defaultVendor = await prisma.vendor.findFirst({
                where: { name: 'Unknown Vendor' }
            });

            if (!defaultVendor) {
                defaultVendor = await prisma.vendor.create({
                    data: { name: 'Unknown Vendor' }
                });
                log('✓ Created default vendor', colors.green);
            }

            for (const item of invalidVendorItems) {
                await prisma.lineItem.update({
                    where: { id: item.id },
                    data: { vendor_id: defaultVendor.id }
                });
            }
            log(`✓ Fixed ${invalidVendorItems.length} orphaned line items`, colors.green);
        } else {
            log('✓ No orphaned line items found', colors.green);
        }
    } catch (error) {
        log(`✗ Error fixing orphaned records: ${error.message}`, colors.red);
    }
}

async function validateAndFixCalculations() {
    log('\n=== Validating and Fixing Calculations ===', colors.cyan);

    try {
        const lineItems = await prisma.lineItem.findMany();
        let fixedCount = 0;

        for (const item of lineItems) {
            const expectedTotal = item.unit_cost * item.quantity;
            const diff = Math.abs(expectedTotal - item.total_cost);

            if (diff > 0.01) {
                await prisma.lineItem.update({
                    where: { id: item.id },
                    data: { total_cost: expectedTotal }
                });
                fixedCount++;
            }
        }

        if (fixedCount > 0) {
            log(`✓ Fixed ${fixedCount} line item calculations`, colors.green);
        } else {
            log('✓ All line item calculations are correct', colors.green);
        }
    } catch (error) {
        log(`✗ Error validating calculations: ${error.message}`, colors.red);
    }
}

async function ensureMasterDataExists() {
    log('\n=== Ensuring Master Data Exists ===', colors.cyan);

    try {
        // Ensure at least one user exists
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            log('Creating default admin user...', colors.yellow);
            const hashedPassword = await bcrypt.hash('password123', 10);

            await prisma.user.create({
                data: {
                    name: 'Admin',
                    email: 'admin@example.com',
                    password_hash: hashedPassword,
                    roles: {
                        create: {
                            role: {
                                connectOrCreate: {
                                    where: { name: 'Admin' },
                                    create: { name: 'Admin' }
                                }
                            }
                        }
                    }
                }
            });
            log('✓ Created default admin user', colors.green);
        } else {
            log(`✓ Users exist (${userCount})`, colors.green);
        }

        // Ensure service types exist
        const serviceTypeCount = await prisma.serviceType.count();
        if (serviceTypeCount === 0) {
            log('Creating default service types...', colors.yellow);
            await prisma.serviceType.createMany({
                data: [
                    { name: 'Shared Service' },
                    { name: 'Dedicated Service' }
                ]
            });
            log('✓ Created default service types', colors.green);
        } else {
            log(`✓ Service types exist (${serviceTypeCount})`, colors.green);
        }

        // Ensure fiscal years exist
        const fiscalYearCount = await prisma.fiscalYear.count();
        if (fiscalYearCount === 0) {
            log('Creating default fiscal years...', colors.yellow);
            const currentYear = new Date().getFullYear();

            for (let i = 0; i < 3; i++) {
                const year = currentYear + i;
                await prisma.fiscalYear.create({
                    data: {
                        year: year,
                        label: `FY${year.toString().slice(-2)}`,
                        description: `Fiscal Year ${year}`,
                        is_active: i === 0,
                        start_date: new Date(`${year}-04-01`),
                        end_date: new Date(`${year + 1}-03-31`)
                    }
                });
            }
            log('✓ Created default fiscal years', colors.green);
        } else {
            log(`✓ Fiscal years exist (${fiscalYearCount})`, colors.green);
        }

    } catch (error) {
        log(`✗ Error ensuring master data: ${error.message}`, colors.red);
    }
}

async function cleanupInvalidData() {
    log('\n=== Cleaning Up Invalid Data ===', colors.cyan);

    try {
        // Remove budget monthly entries with invalid months
        const invalidMonthly = await prisma.budgetMonthly.findMany({
            where: {
                OR: [
                    { month: { lt: 1 } },
                    { month: { gt: 12 } }
                ]
            }
        });

        if (invalidMonthly.length > 0) {
            await prisma.budgetMonthly.deleteMany({
                where: {
                    id: { in: invalidMonthly.map(m => m.id) }
                }
            });
            log(`✓ Removed ${invalidMonthly.length} invalid monthly budget entries`, colors.green);
        } else {
            log('✓ No invalid monthly budget entries found', colors.green);
        }

        // Remove actuals with invalid months
        const invalidActuals = await prisma.actualsBOA.findMany({
            where: {
                OR: [
                    { month: { lt: 1 } },
                    { month: { gt: 12 } }
                ]
            }
        });

        if (invalidActuals.length > 0) {
            await prisma.actualsBOA.deleteMany({
                where: {
                    id: { in: invalidActuals.map(a => a.id) }
                }
            });
            log(`✓ Removed ${invalidActuals.length} invalid actuals entries`, colors.green);
        } else {
            log('✓ No invalid actuals entries found', colors.green);
        }

    } catch (error) {
        log(`✗ Error cleaning up invalid data: ${error.message}`, colors.red);
    }
}

async function optimizeDatabase() {
    log('\n=== Optimizing Database ===', colors.cyan);

    try {
        // For SQLite, we can run VACUUM to optimize
        await prisma.$executeRawUnsafe('VACUUM;');
        log('✓ Database optimized', colors.green);
    } catch (error) {
        log(`✗ Error optimizing database: ${error.message}`, colors.red);
    }
}

async function generateReport() {
    log('\n' + '='.repeat(60), colors.magenta);
    log('DATABASE HEALTH REPORT', colors.magenta);
    log('='.repeat(60), colors.magenta);

    try {
        const stats = {
            users: await prisma.user.count(),
            towers: await prisma.tower.count(),
            budgetHeads: await prisma.budgetHead.count(),
            vendors: await prisma.vendor.count(),
            costCentres: await prisma.costCentre.count(),
            poEntities: await prisma.pOEntity.count(),
            serviceTypes: await prisma.serviceType.count(),
            allocationBases: await prisma.allocationBasis.count(),
            fiscalYears: await prisma.fiscalYear.count(),
            budgets: await prisma.budgetBOA.count(),
            pos: await prisma.pO.count(),
            lineItems: await prisma.lineItem.count(),
            actuals: await prisma.actualsBOA.count()
        };

        log('\nRecord Counts:', colors.cyan);
        Object.entries(stats).forEach(([key, value]) => {
            log(`  ${key}: ${value}`, colors.blue);
        });

        log('\n' + '='.repeat(60), colors.magenta);
    } catch (error) {
        log(`✗ Error generating report: ${error.message}`, colors.red);
    }
}

async function runAllFixes() {
    log('Starting Database Repair and Optimization...', colors.cyan);
    log('Timestamp: ' + new Date().toISOString(), colors.blue);

    try {
        await ensureMasterDataExists();
        await fixDuplicateUIDs();
        await fixOrphanedRecords();
        await validateAndFixCalculations();
        await cleanupInvalidData();
        await optimizeDatabase();
        await generateReport();

        log('\n✓ All fixes completed successfully!', colors.green);
    } catch (error) {
        log(`\n✗ Fatal error: ${error.message}`, colors.red);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run all fixes
runAllFixes().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
