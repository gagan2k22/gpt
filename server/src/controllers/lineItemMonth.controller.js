const budgetCalcService = require('../services/budgetCalcService');

const updateLineItemMonths = async (req, res) => {
    try {
        const { id } = req.params;
        const { monthlyData } = req.body;

        if (!monthlyData) {
            return res.status(400).json({ message: 'Monthly data is required' });
        }

        const total = await budgetCalcService.updateMonthlyBudgets(parseInt(id), monthlyData);

        res.json({
            success: true,
            message: 'Monthly budgets updated successfully',
            totalBudget: total
        });
    } catch (error) {
        console.error('Error updating monthly budgets:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateLineItemMonths };
