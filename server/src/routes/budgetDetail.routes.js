const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getBudgetDetail, addReconciliationNote } = require('../controllers/budgetDetail.controller');

const router = express.Router();

router.use(authenticateToken);

// Get budget detail - All authenticated users (or restrict to VIEW_DASHBOARDS)
router.get('/:uid', checkPermission('VIEW_DASHBOARDS'), getBudgetDetail);

// Add reconciliation note - Editors/Approvers/Admins
router.post('/:uid/notes', checkPermission('EDIT_LINE_ITEMS'), addReconciliationNote);

module.exports = router;
