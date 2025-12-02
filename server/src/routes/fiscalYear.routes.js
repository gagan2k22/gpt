const express = require('express');
const router = express.Router();
const fiscalYearController = require('../controllers/fiscalYear.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Public route (authenticated) to get fiscal years
router.get('/', authenticateToken, fiscalYearController.getFiscalYears);

// Admin only routes
router.post('/', authenticateToken, authorizeRoles('Admin'), fiscalYearController.createFiscalYear);
router.patch('/:id/status', authenticateToken, authorizeRoles('Admin'), fiscalYearController.toggleFiscalYearStatus);

module.exports = router;
