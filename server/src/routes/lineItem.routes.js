const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getLineItems, createLineItem, updateLineItem, deleteLineItem } = require('../controllers/lineItem.controller');

const router = express.Router();

router.use(authenticateToken);

// View line items - All authenticated users
router.get('/', checkPermission('VIEW_DASHBOARDS'), getLineItems);

// Create/Edit/Delete line items - Editor, Approver, Admin
router.post('/', checkPermission('CREATE_LINE_ITEMS'), createLineItem);
router.put('/:id', checkPermission('EDIT_LINE_ITEMS'), updateLineItem);
router.delete('/:id', checkPermission('DELETE_LINE_ITEMS'), deleteLineItem);

module.exports = router;
