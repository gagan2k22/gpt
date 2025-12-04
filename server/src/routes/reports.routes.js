const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const reportsController = require('../controllers/reports.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', checkPermission('VIEW_DASHBOARDS'), reportsController.getDashboardStats);

module.exports = router;
