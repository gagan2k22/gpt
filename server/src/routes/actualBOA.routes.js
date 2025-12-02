const express = require('express');
const router = express.Router();
const actualBOAController = require('../controllers/actualBOA.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Public or protected routes - adjust permission as needed
// Assuming these should be protected
router.get('/', authenticateToken, actualBOAController.getAllActualBOA);
router.post('/', authenticateToken, actualBOAController.createActualBOA);
router.put('/:id', authenticateToken, actualBOAController.updateActualBOA);
router.delete('/:id', authenticateToken, actualBOAController.deleteActualBOA);
router.post('/seed', authenticateToken, actualBOAController.seedActualBOA);

module.exports = router;
