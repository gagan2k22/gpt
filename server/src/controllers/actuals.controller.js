const prisma = require('../prisma');

const getActuals = async (req, res) => {
    try {
        const { fiscal_year, month } = req.query;
        const where = {};
        if (fiscal_year) where.fiscal_year = parseInt(fiscal_year);
        if (month) where.month = parseInt(month);

        const actuals = await prisma.actualsBOA.findMany({
            where,
            include: {
                tower: true,
                budget_head: true,
                cost_centre: true,
                basis: true,
                calculations: true
            }
        });
        res.json(actuals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createActuals = async (req, res) => {
    try {
        const {
            fiscal_year, month, tower_id, budget_head_id, cost_centre_id,
            actual_amount, remarks
        } = req.body;

        const actual = await prisma.actualsBOA.create({
            data: {
                fiscal_year: parseInt(fiscal_year),
                month: parseInt(month),
                tower_id: parseInt(tower_id),
                budget_head_id: parseInt(budget_head_id),
                cost_centre_id: parseInt(cost_centre_id),
                actual_amount: parseFloat(actual_amount),
                remarks
            }
        });

        // Trigger Variance Calculation (Simplified)
        // Trigger Variance Calculation
        // Find corresponding budget
        const budget = await prisma.budgetBOA.findFirst({
            where: {
                fiscal_year: parseInt(fiscal_year),
                tower_id: parseInt(tower_id),
                budget_head_id: parseInt(budget_head_id),
                cost_centre_id: parseInt(cost_centre_id)
            },
            include: {
                monthly_breakdown: true
            }
        });

        if (budget) {
            // Find budget for the specific month
            const monthlyBudget = budget.monthly_breakdown.find(m => m.month === parseInt(month));
            const budgetAmount = monthlyBudget ? monthlyBudget.budget_amount : 0;

            const variance = budgetAmount - actual.actual_amount;
            const variance_pct = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : 0;

            await prisma.actualsCalculation.create({
                data: {
                    budget_boa_id: budget.id,
                    actuals_boa_id: actual.id,
                    variance_amount: variance,
                    variance_percentage: variance_pct
                }
            });
        }

        res.status(201).json(actual);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getActuals, createActuals };
