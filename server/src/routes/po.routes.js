const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getPOs, getPOById, createPO, updatePOStatus, getBudgetDetailsByUID } = require('../controllers/po.controller');

const router = express.Router();

router.use(authenticateToken);

// View POs - All authenticated users
router.get('/', checkPermission('VIEW_DASHBOARDS'), getPOs);
router.get('/budget-details/:uid', checkPermission('VIEW_DASHBOARDS'), getBudgetDetailsByUID);
router.get('/:id', checkPermission('VIEW_DASHBOARDS'), getPOById);

// Create/Edit PO - Editor, Approver, Admin
router.post('/', checkPermission('CREATE_PO'), createPO);

// Approve/Reject/Submit PO
router.put('/:id/status', checkPermission('SUBMIT_PO'), updatePOStatus);

module.exports = router;
