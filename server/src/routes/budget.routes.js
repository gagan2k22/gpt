const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getBudgets, createBudget, updateBudget, getBudgetTracker } = require('../controllers/budget.controller');

const router = express.Router();

router.use(authenticateToken);

// View budgets - All authenticated users
router.get('/tracker', checkPermission('VIEW_DASHBOARDS'), getBudgetTracker);
router.get('/', checkPermission('VIEW_DASHBOARDS'), getBudgets);

// Create/Edit budget - Editor, Approver, Admin
router.post('/', checkPermission('EDIT_BUDGET_BOA'), createBudget);
router.put('/:id', checkPermission('EDIT_BUDGET_BOA'), updateBudget);

module.exports = router;
