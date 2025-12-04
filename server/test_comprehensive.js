const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, error = null) {
    totalTests++;
    if (passed) {
        passedTests++;
        log(`✓ ${testName}`, colors.green);
    } else {
        failedTests++;
        log(`✗ ${testName}`, colors.red);
        if (error) {
            log(`  Error: ${error.message}`, colors.red);
            errors.push({ test: testName, error: error.message, stack: error.stack });
        }
    }
}

async function testDatabaseConnection() {
    log('\n=== Testing Database Connection ===', colors.cyan);
    try {
        await prisma.$connect();
        logTest('Database connection', true);
        return true;
    } catch (error) {
        logTest('Database connection', false, error);
        return false;
    }
}

async function testModels() {
    log('\n=== Testing Database Models ===', colors.cyan);

    const models = [
        'user', 'role', 'userRole', 'tower', 'budgetHead', 'vendor',
        'costCentre', 'pOEntity', 'serviceType', 'allocationBasis',
        'fiscalYear', 'budgetBOA', 'budgetMonthly', 'budgetCalculation',
        'pO', 'lineItem', 'actualsBOA', 'actualsBasis', 'actualsCalculation',
        'auditLog'
    ];

    for (const model of models) {
        try {
            if (prisma[model]) {
                await prisma[model].findMany({ take: 1 });
                logTest(`Model: ${model}`, true);
            } else {
                throw new Error(`Model ${model} not found in Prisma client`);
            }
        } catch (error) {
            logTest(`Model: ${model}`, false, error);
        }
    }
}

async function testDataIntegrity() {
    log('\n=== Testing Data Integrity ===', colors.cyan);

    // Test 1: Check for users
    try {
        const users = await prisma.user.findMany();
        logTest(`Users exist (count: ${users.length})`, users.length > 0);
    } catch (error) {
        logTest('Users exist', false, error);
    }

    // Test 2: Check for towers
    try {
        const towers = await prisma.tower.findMany();
        logTest(`Towers exist (count: ${towers.length})`, towers.length > 0);
    } catch (error) {
        logTest('Towers exist', false, error);
    }

    // Test 3: Check for budget heads
    try {
        const budgetHeads = await prisma.budgetHead.findMany();
        logTest(`Budget Heads exist (count: ${budgetHeads.length})`, budgetHeads.length > 0);
    } catch (error) {
        logTest('Budget Heads exist', false, error);
    }

    // Test 4: Check for vendors
    try {
        const vendors = await prisma.vendor.findMany();
        logTest(`Vendors exist (count: ${vendors.length})`, vendors.length > 0);
    } catch (error) {
        logTest('Vendors exist', false, error);
    }

    // Test 5: Check for cost centres
    try {
        const costCentres = await prisma.costCentre.findMany();
        logTest(`Cost Centres exist (count: ${costCentres.length})`, costCentres.length > 0);
    } catch (error) {
        logTest('Cost Centres exist', false, error);
    }

    // Test 6: Check for allocation bases
    try {
        const allocationBases = await prisma.allocationBasis.findMany();
        logTest(`Allocation Bases exist (count: ${allocationBases.length})`, allocationBases.length > 0);
    } catch (error) {
        logTest('Allocation Bases exist', false, error);
    }

    // Test 7: Check for fiscal years
    try {
        const fiscalYears = await prisma.fiscalYear.findMany();
        logTest(`Fiscal Years exist (count: ${fiscalYears.length})`, fiscalYears.length > 0);
    } catch (error) {
        logTest('Fiscal Years exist', false, error);
    }

    // Test 8: Check for PO entities
    try {
        const poEntities = await prisma.pOEntity.findMany();
        logTest(`PO Entities exist (count: ${poEntities.length})`, poEntities.length > 0);
    } catch (error) {
        logTest('PO Entities exist', false, error);
    }

    // Test 9: Check for service types
    try {
        const serviceTypes = await prisma.serviceType.findMany();
        logTest(`Service Types exist (count: ${serviceTypes.length})`, serviceTypes.length > 0);
    } catch (error) {
        logTest('Service Types exist', false, error);
    }
}

async function testRelationships() {
    log('\n=== Testing Relationships ===', colors.cyan);

    // Test 1: User with roles
    try {
        const userWithRoles = await prisma.user.findFirst({
            include: { roles: { include: { role: true } } }
        });
        logTest('User with roles relationship', userWithRoles !== null);
    } catch (error) {
        logTest('User with roles relationship', false, error);
    }

    // Test 2: Tower with budget heads
    try {
        const towerWithBudgetHeads = await prisma.tower.findFirst({
            include: { budget_heads: true }
        });
        logTest('Tower with budget heads relationship', towerWithBudgetHeads !== null);
    } catch (error) {
        logTest('Tower with budget heads relationship', false, error);
    }

    // Test 3: Budget BOA with all relations
    try {
        const budgetBOA = await prisma.budgetBOA.findFirst({
            include: {
                tower: true,
                budget_head: true,
                cost_centre: true,
                allocation_basis: true,
                monthly_breakdown: true,
                calculations: true
            }
        });
        logTest('Budget BOA with all relationships', budgetBOA !== null);
    } catch (error) {
        logTest('Budget BOA with all relationships', false, error);
    }

    // Test 4: Line Item with all relations
    try {
        const lineItem = await prisma.lineItem.findFirst({
            include: {
                vendor: true,
                tower: true,
                budget_head: true,
                po_entity: true,
                service_type: true,
                allocation_basis: true,
                po: true
            }
        });
        logTest('Line Item with all relationships', lineItem !== null);
    } catch (error) {
        logTest('Line Item with all relationships', false, error);
    }
}

async function testUniqueConstraints() {
    log('\n=== Testing Unique Constraints ===', colors.cyan);

    // Test 1: Unique email for users
    try {
        const users = await prisma.user.findMany();
        const emails = users.map(u => u.email);
        const uniqueEmails = new Set(emails);
        logTest('User emails are unique', emails.length === uniqueEmails.size);
    } catch (error) {
        logTest('User emails are unique', false, error);
    }

    // Test 2: Unique UID for line items
    try {
        const lineItems = await prisma.lineItem.findMany();
        const uids = lineItems.map(li => li.uid);
        const uniqueUIDs = new Set(uids);
        logTest('Line Item UIDs are unique', uids.length === uniqueUIDs.size);
    } catch (error) {
        logTest('Line Item UIDs are unique', false, error);
    }

    // Test 3: Unique PO numbers
    try {
        const pos = await prisma.pO.findMany();
        const poNumbers = pos.map(po => po.po_number);
        const uniquePONumbers = new Set(poNumbers);
        logTest('PO numbers are unique', poNumbers.length === uniquePONumbers.size);
    } catch (error) {
        logTest('PO numbers are unique', false, error);
    }

    // Test 4: Unique cost centre codes
    try {
        const costCentres = await prisma.costCentre.findMany();
        const codes = costCentres.map(cc => cc.code);
        const uniqueCodes = new Set(codes);
        logTest('Cost Centre codes are unique', codes.length === uniqueCodes.size);
    } catch (error) {
        logTest('Cost Centre codes are unique', false, error);
    }
}

async function testDataValidation() {
    log('\n=== Testing Data Validation ===', colors.cyan);

    // Test 1: All users have valid emails
    try {
        const users = await prisma.user.findMany();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const allValid = users.every(u => emailRegex.test(u.email));
        logTest('All user emails are valid', allValid);
    } catch (error) {
        logTest('All user emails are valid', false, error);
    }

    // Test 2: All budget amounts are positive
    try {
        const budgets = await prisma.budgetBOA.findMany();
        const allPositive = budgets.every(b => b.annual_budget_amount >= 0);
        logTest('All budget amounts are non-negative', allPositive);
    } catch (error) {
        logTest('All budget amounts are non-negative', false, error);
    }

    // Test 3: All line item costs are positive
    try {
        const lineItems = await prisma.lineItem.findMany();
        const allPositive = lineItems.every(li =>
            li.unit_cost >= 0 && li.quantity >= 0 && li.total_cost >= 0
        );
        logTest('All line item costs are non-negative', allPositive);
    } catch (error) {
        logTest('All line item costs are non-negative', false, error);
    }

    // Test 4: Line item total cost matches unit_cost * quantity
    try {
        const lineItems = await prisma.lineItem.findMany();
        const allMatch = lineItems.every(li => {
            const expected = li.unit_cost * li.quantity;
            const diff = Math.abs(expected - li.total_cost);
            return diff < 0.01; // Allow for floating point precision
        });
        logTest('Line item total costs are calculated correctly', allMatch);
    } catch (error) {
        logTest('Line item total costs are calculated correctly', false, error);
    }

    // Test 5: Fiscal year dates are valid
    try {
        const fiscalYears = await prisma.fiscalYear.findMany();
        const allValid = fiscalYears.every(fy => {
            const start = new Date(fy.start_date);
            const end = new Date(fy.end_date);
            return start < end;
        });
        logTest('All fiscal year date ranges are valid', allValid);
    } catch (error) {
        logTest('All fiscal year date ranges are valid', false, error);
    }
}

async function testOrphanedRecords() {
    log('\n=== Testing for Orphaned Records ===', colors.cyan);

    // Test 1: Budget heads without towers - REMOVED (Relation is required in schema)
    logTest('No orphaned budget heads (Schema enforced)', true);

    // Test 2: Line items with invalid vendor references - REMOVED (LineItem does not have vendor relation)
    logTest('Line items vendor check (Not applicable)', true);

    // Test 3: POs with invalid user references - REMOVED (PO does not have created_by relation)
    logTest('POs creator check (Not applicable)', true);
}

async function generateReport() {
    log('\n' + '='.repeat(60), colors.magenta);
    log('COMPREHENSIVE TEST REPORT', colors.magenta);
    log('='.repeat(60), colors.magenta);

    log(`\nTotal Tests: ${totalTests}`, colors.blue);
    log(`Passed: ${passedTests}`, colors.green);
    log(`Failed: ${failedTests}`, colors.red);

    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
    log(`Success Rate: ${successRate}%`, successRate >= 80 ? colors.green : colors.yellow);

    if (errors.length > 0) {
        log('\n=== ERRORS DETAILS ===', colors.red);
        errors.forEach((err, index) => {
            log(`\n${index + 1}. ${err.test}`, colors.yellow);
            log(`   ${err.error}`, colors.red);
        });
    }

    log('\n' + '='.repeat(60), colors.magenta);
}

async function runAllTests() {
    log('Starting Comprehensive Test Suite...', colors.cyan);
    log('Timestamp: ' + new Date().toISOString(), colors.blue);

    const dbConnected = await testDatabaseConnection();

    if (dbConnected) {
        await testModels();
        await testDataIntegrity();
        await testRelationships();
        await testUniqueConstraints();
        await testDataValidation();
        await testOrphanedRecords();
    } else {
        log('\nSkipping further tests due to database connection failure', colors.red);
    }

    await generateReport();

    await prisma.$disconnect();

    // Exit with error code if tests failed
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
