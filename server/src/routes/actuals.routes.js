const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getActuals, createActuals } = require('../controllers/actuals.controller');

const router = express.Router();

router.use(authenticateToken);

// View actuals - All authenticated users
router.get('/', checkPermission('VIEW_DASHBOARDS'), getActuals);

// Upload actuals - Editor, Approver, Admin
router.post('/', checkPermission('UPLOAD_ACTUALS'), createActuals);

module.exports = router;
