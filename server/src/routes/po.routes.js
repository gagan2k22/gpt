const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const poController = require('../controllers/po.controller');

const router = express.Router();

router.use(authenticateToken);

// List POs
router.get('/', checkPermission('VIEW_DASHBOARDS'), poController.listPOs);

// Get PO details
router.get('/:id', checkPermission('VIEW_DASHBOARDS'), poController.getPO);

// Create PO
router.post('/', checkPermission('CREATE_LINE_ITEMS'), poController.createPO); // Using CREATE_LINE_ITEMS as proxy for PO creation

// Update PO
router.put('/:id', checkPermission('EDIT_LINE_ITEMS'), poController.updatePO);

// Delete PO (Admin only)
router.delete('/:id', checkPermission('Admin'), poController.deletePO);

module.exports = router;
