const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BudgetDetailService {
    /**
     * Get complete details for a single line item by UID
     */
    async getLineItemDetail(uid) {
        // Fetch line item with all relations
        const lineItem = await prisma.lineItem.findUnique({
            where: { uid },
            include: {
                tower: true,
                budgetHead: true,
                costCentre: true,
                fiscalYear: true,
                months: {
                    orderBy: { month: 'asc' }
                },
                actuals: {
                    include: {
                        vendor: true
                    },
                    orderBy: { invoiceDate: 'desc' }
                },
                pos: {
                    include: {
                        vendor: true
                    }
                },
                reconciliationNotes: {
                    include: {
                        user: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!lineItem) {
            throw new Error('Line item not found');
        }

        // Calculate monthly actuals
        const monthlyActuals = this.calculateMonthlyActuals(lineItem.actuals);

        // Calculate variance
        const variance = this.calculateVariance(lineItem.months, monthlyActuals);

        // Get audit history
        const auditHistory = await prisma.auditLog.findMany({
            where: {
                entity: 'LineItem',
                entityId: lineItem.id
            },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return {
            lineItem,
            monthlyActuals,
            variance,
            auditHistory
        };
    }

    /**
     * Calculate monthly actuals grouped by month
     */
    calculateMonthlyActuals(actuals) {
        const monthlyTotals = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        months.forEach(month => {
            monthlyTotals[month] = 0;
        });

        actuals.forEach(actual => {
            if (actual.month) {
                const amount = parseFloat(actual.convertedAmount || actual.amount || 0);
                monthlyTotals[actual.month] = (monthlyTotals[actual.month] || 0) + amount;
            }
        });

        return monthlyTotals;
    }

    /**
     * Calculate variance (budget - actual) for each month and cumulative
     */
    calculateVariance(budgetMonths, monthlyActuals) {
        const monthlyVariance = {};
        let cumulativeBudget = 0;
        let cumulativeActual = 0;

        budgetMonths.forEach(bm => {
            const budget = parseFloat(bm.amount || 0);
            const actual = monthlyActuals[bm.month] || 0;
            const variance = budget - actual;

            monthlyVariance[bm.month] = {
                budget,
                actual,
                variance,
                variancePercentage: budget > 0 ? (variance / budget) * 100 : 0
            };

            cumulativeBudget += budget;
            cumulativeActual += actual;
        });

        return {
            monthly: monthlyVariance,
            cumulative: {
                budget: cumulativeBudget,
                actual: cumulativeActual,
                variance: cumulativeBudget - cumulativeActual,
                variancePercentage: cumulativeBudget > 0
                    ? ((cumulativeBudget - cumulativeActual) / cumulativeBudget) * 100
                    : 0
            }
        };
    }

    /**
     * Add a reconciliation note
     */
    async addReconciliationNote(uid, note, userId, actualId = null) {
        const lineItem = await prisma.lineItem.findUnique({
            where: { uid }
        });

        if (!lineItem) {
            throw new Error('Line item not found');
        }

        const reconciliationNote = await prisma.reconciliationNote.create({
            data: {
                lineItemId: lineItem.id,
                actualId,
                note,
                createdBy: userId
            },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            }
        });

        return reconciliationNote;
    }
}

module.exports = new BudgetDetailService();
