const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const {
    getCurrencyRates,
    getRate,
    upsertRate,
    deleteRate
} = require('../controllers/currencyRate.controller');

const router = express.Router();

router.use(authenticateToken);

// View currency rates - All authenticated users
router.get('/', checkPermission('VIEW_DASHBOARDS'), getCurrencyRates);
router.get('/:from/:to', checkPermission('VIEW_DASHBOARDS'), getRate);

// Create/Update/Delete rates - Admin only
router.post('/', checkPermission('MANAGE_MASTER_DATA'), upsertRate);
router.delete('/:id', checkPermission('MANAGE_MASTER_DATA'), deleteRate);

module.exports = router;
