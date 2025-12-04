const express = require('express');
const router = express.Router();
const budgetBOAController = require('../controllers/budgetBOA.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, budgetBOAController.getAllBudgetBOA);
router.post('/', authenticateToken, budgetBOAController.createBudgetBOA);
router.put('/:id', authenticateToken, budgetBOAController.updateBudgetBOA);
router.delete('/:id', authenticateToken, budgetBOAController.deleteBudgetBOA);
router.post('/seed', authenticateToken, budgetBOAController.seedBudgetBOA);

module.exports = router;
