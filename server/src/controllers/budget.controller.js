const prisma = require('../prisma');

const getBudgets = async (req, res) => {
    try {
        const { fiscal_year } = req.query;
        const where = fiscal_year ? { fiscal_year: parseInt(fiscal_year) } : {};

        const budgets = await prisma.budgetBOA.findMany({
            where,
            include: {
                tower: true,
                budget_head: true,
                cost_centre: true,
                monthly_breakdown: true,
                calculations: true
            }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBudget = async (req, res) => {
    try {
        const {
            fiscal_year, tower_id, budget_head_id, cost_centre_id, allocation_basis_id,
            annual_budget_amount, remarks, monthly_breakdown
        } = req.body;

        const budget = await prisma.budgetBOA.create({
            data: {
                fiscal_year: parseInt(fiscal_year),
                tower_id: parseInt(tower_id),
                budget_head_id: parseInt(budget_head_id),
                cost_centre_id: parseInt(cost_centre_id),
                allocation_basis_id: allocation_basis_id ? parseInt(allocation_basis_id) : null,
                annual_budget_amount: parseFloat(annual_budget_amount),
                remarks,
                monthly_breakdown: {
                    create: monthly_breakdown.map(m => ({
                        month: m.month,
                        budget_amount: parseFloat(m.budget_amount)
                    }))
                }
            },
            include: {
                monthly_breakdown: true
            }
        });

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { annual_budget_amount, remarks } = req.body;

        const budget = await prisma.budgetBOA.update({
            where: { id: parseInt(id) },
            data: {
                annual_budget_amount: parseFloat(annual_budget_amount),
                remarks
            }
        });
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBudgetTracker = async (req, res) => {
    try {
        const lineItems = await prisma.lineItem.findMany({
            include: {
                tower: true,
                budget_head: true,
                po_entity: true,
                service_type: true,
                allocation_basis: true,
                vendor: true,
                po: true,
                actuals_basis: {
                    include: {
                        actual_boa: true
                    }
                }
            }
        });

        const trackerData = lineItems.map(item => {
            // Dynamically calculate actuals for different fiscal years
            const calculateActualsForYear = (year) => {
                return item.actuals_basis
                    .filter(basis => basis.actual_boa.fiscal_year === year)
                    .reduce((sum, basis) => sum + basis.allocated_amount, 0);
            };

            // Calculate budget for different fiscal years
            // Use the specific allocation amount fields for each fiscal year
            const fy25Budget = item.fy25_allocation_amount || 0;
            const fy26Budget = item.fy26_allocation_amount || 0;
            const fy27Budget = item.fy27_allocation_amount || 0;

            return {
                id: item.id,
                uid: item.uid,
                parent_uid: item.parent_uid,
                vendor_name: item.vendor.name,
                service_description: item.service_description,
                service_start_date: item.service_start_date,
                service_end_date: item.service_end_date,
                is_renewal: item.is_renewal,
                budget_head_name: item.budget_head.name,
                tower_name: item.tower.name,
                contract_id: item.po?.po_number || '-',
                po_entity_name: item.po_entity?.name || '-',
                allocation_basis_name: item.allocation_basis?.name || '-',
                service_type_name: item.service_type?.name || '-',

                // Dynamic fiscal year data
                fy25_budget: fy25Budget,
                fy25_actuals: calculateActualsForYear(2025),
                fy26_budget: fy26Budget,
                fy26_actuals: calculateActualsForYear(2026),
                fy27_budget: fy27Budget,
                fy27_actuals: calculateActualsForYear(2027),

                remarks: item.remarks
            };
        });

        res.json(trackerData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBudgets, createBudget, updateBudget, getBudgetTracker };
