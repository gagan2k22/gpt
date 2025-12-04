const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const importHistoryController = require('../controllers/importHistory.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkPermission('VIEW_DASHBOARDS'), importHistoryController.getHistory);

module.exports = router;
