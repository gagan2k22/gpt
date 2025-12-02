const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
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
            log(`  Error: ${error}`, colors.red);
            errors.push({ test: testName, error });
        }
    }
}

async function testServerConnection() {
    log('\n=== Testing Server Connection ===', colors.cyan);
    try {
        const response = await axios.get(`${BASE_URL}/`);
        logTest('Server is running', response.status === 200);
        return true;
    } catch (error) {
        logTest('Server is running', false, error.message);
        return false;
    }
}

async function testAuthEndpoints() {
    log('\n=== Testing Auth Endpoints ===', colors.cyan);

    // Test login endpoint
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        logTest('POST /api/auth/login', response.status === 200 && response.data.token);
        return response.data.token;
    } catch (error) {
        logTest('POST /api/auth/login', false, error.response?.data?.message || error.message);
        return null;
    }
}

async function testMasterDataEndpoints(token) {
    log('\n=== Testing Master Data Endpoints ===', colors.cyan);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Test towers
    try {
        const response = await axios.get(`${BASE_URL}/api/master/towers`, { headers });
        logTest('GET /api/master/towers', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/towers', false, error.response?.data?.message || error.message);
    }

    // Test budget heads
    try {
        const response = await axios.get(`${BASE_URL}/api/master/budget-heads`, { headers });
        logTest('GET /api/master/budget-heads', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/budget-heads', false, error.response?.data?.message || error.message);
    }

    // Test vendors
    try {
        const response = await axios.get(`${BASE_URL}/api/master/vendors`, { headers });
        logTest('GET /api/master/vendors', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/vendors', false, error.response?.data?.message || error.message);
    }

    // Test cost centres
    try {
        const response = await axios.get(`${BASE_URL}/api/master/cost-centres`, { headers });
        logTest('GET /api/master/cost-centres', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/cost-centres', false, error.response?.data?.message || error.message);
    }

    // Test PO entities
    try {
        const response = await axios.get(`${BASE_URL}/api/master/po-entities`, { headers });
        logTest('GET /api/master/po-entities', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/po-entities', false, error.response?.data?.message || error.message);
    }

    // Test service types
    try {
        const response = await axios.get(`${BASE_URL}/api/master/service-types`, { headers });
        logTest('GET /api/master/service-types', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/service-types', false, error.response?.data?.message || error.message);
    }

    // Test allocation bases
    try {
        const response = await axios.get(`${BASE_URL}/api/master/allocation-bases`, { headers });
        logTest('GET /api/master/allocation-bases', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/master/allocation-bases', false, error.response?.data?.message || error.message);
    }
}

async function testBudgetEndpoints(token) {
    log('\n=== Testing Budget Endpoints ===', colors.cyan);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Test get budgets
    try {
        const response = await axios.get(`${BASE_URL}/api/budgets`, { headers });
        logTest('GET /api/budgets', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/budgets', false, error.response?.data?.message || error.message);
    }

    // Test get budgets with fiscal year filter
    try {
        const response = await axios.get(`${BASE_URL}/api/budgets?fiscal_year=2025`, { headers });
        logTest('GET /api/budgets?fiscal_year=2025', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/budgets?fiscal_year=2025', false, error.response?.data?.message || error.message);
    }

    // Test budget tracker
    try {
        const response = await axios.get(`${BASE_URL}/api/budgets/tracker`, { headers });
        logTest('GET /api/budgets/tracker', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/budgets/tracker', false, error.response?.data?.message || error.message);
    }
}

async function testLineItemEndpoints(token) {
    log('\n=== Testing Line Item Endpoints ===', colors.cyan);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Test get line items
    try {
        const response = await axios.get(`${BASE_URL}/api/line-items`, { headers });
        logTest('GET /api/line-items', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/line-items', false, error.response?.data?.message || error.message);
    }
}

async function testPOEndpoints(token) {
    log('\n=== Testing PO Endpoints ===', colors.cyan);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Test get POs
    try {
        const response = await axios.get(`${BASE_URL}/api/pos`, { headers });
        logTest('GET /api/pos', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/pos', false, error.response?.data?.message || error.message);
    }
}

async function testActualsEndpoints(token) {
    log('\n=== Testing Actuals Endpoints ===', colors.cyan);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Test get actuals
    try {
        const response = await axios.get(`${BASE_URL}/api/actuals`, { headers });
        logTest('GET /api/actuals', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/actuals', false, error.response?.data?.message || error.message);
    }

    // Test get actuals with filters
    try {
        const response = await axios.get(`${BASE_URL}/api/actuals?fiscal_year=2025&month=4`, { headers });
        logTest('GET /api/actuals?fiscal_year=2025&month=4', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/actuals?fiscal_year=2025&month=4', false, error.response?.data?.message || error.message);
    }
}

async function testFiscalYearEndpoints(token) {
    log('\n=== Testing Fiscal Year Endpoints ===', colors.cyan);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Test get fiscal years
    try {
        const response = await axios.get(`${BASE_URL}/api/fiscal-years`, { headers });
        logTest('GET /api/fiscal-years', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/fiscal-years', false, error.response?.data?.message || error.message);
    }

    // Test get active fiscal years
    try {
        const response = await axios.get(`${BASE_URL}/api/fiscal-years/active`, { headers });
        logTest('GET /api/fiscal-years/active', response.status === 200 && Array.isArray(response.data));
    } catch (error) {
        logTest('GET /api/fiscal-years/active', false, error.response?.data?.message || error.message);
    }
}

async function generateReport() {
    log('\n' + '='.repeat(60), colors.magenta);
    log('API TEST REPORT', colors.magenta);
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
    log('Starting API Test Suite...', colors.cyan);
    log('Timestamp: ' + new Date().toISOString(), colors.blue);
    log(`Testing server at: ${BASE_URL}`, colors.blue);

    const serverRunning = await testServerConnection();

    if (!serverRunning) {
        log('\nServer is not running. Please start the server first:', colors.red);
        log('  cd server && npm run dev', colors.yellow);
        await generateReport();
        process.exit(1);
    }

    const token = await testAuthEndpoints();

    await testMasterDataEndpoints(token);
    await testBudgetEndpoints(token);
    await testLineItemEndpoints(token);
    await testPOEndpoints(token);
    await testActualsEndpoints(token);
    await testFiscalYearEndpoints(token);

    await generateReport();

    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
