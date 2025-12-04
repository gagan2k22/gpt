const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getBudgets, createBudget, updateBudget, getBudgetTracker } = require('../controllers/budget.controller');

const multer = require('multer');
const { importBudgets } = require('../controllers/budgetImportController');
const { exportBudgets } = require('../controllers/budgetExportController');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(authenticateToken);

// View budgets - All authenticated users
router.get('/tracker', checkPermission('VIEW_DASHBOARDS'), getBudgetTracker);
router.get('/', checkPermission('VIEW_DASHBOARDS'), getBudgets);

// Export budgets
router.get('/export', checkPermission('VIEW_DASHBOARDS'), exportBudgets);

// Import budgets
router.post('/import', checkPermission('EDIT_BUDGET_BOA'), upload.single('file'), importBudgets);

// Create/Edit budget - Editor, Approver, Admin
router.post('/', checkPermission('EDIT_BUDGET_BOA'), createBudget);
router.put('/:id', checkPermission('EDIT_BUDGET_BOA'), updateBudget);

module.exports = router;
