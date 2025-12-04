const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReportsService {
    /**
     * Get dashboard summary metrics
     */
    async getDashboardSummary(fiscalYearId) {
        // Default to FY25 if not specified (or handle dynamic current FY)
        // For now, we'll aggregate across all data if no FY, or filter by FY relations

        const [totalBudget, totalActuals, poTotal] = await Promise.all([
            prisma.lineItem.aggregate({
                _sum: { totalBudget: true }
            }),
            prisma.actual.aggregate({
                _sum: { amount: true } // Should use convertedAmount in real app
            }),
            prisma.pO.aggregate({
                _sum: { poValue: true } // Should use commonCurrencyValue
            })
        ]);

        const budget = totalBudget._sum.totalBudget || 0;
        const actuals = totalActuals._sum.amount || 0;
        const committed = poTotal._sum.poValue || 0;

        return {
            budget,
            actuals,
            committed,
            variance: budget - actuals,
            utilization: budget > 0 ? (actuals / budget) * 100 : 0
        };
    }

    /**
     * Get Tower-wise budget vs actuals
     */
    async getTowerWiseReport() {
        const towers = await prisma.tower.findMany({
            include: {
                lineItems: {
                    include: {
                        actuals: true
                    }
                }
            }
        });

        return towers.map(tower => {
            const budget = tower.lineItems.reduce((sum, item) => sum + parseFloat(item.totalBudget || 0), 0);
            const actuals = tower.lineItems.reduce((sum, item) => {
                return sum + item.actuals.reduce((aSum, act) => aSum + parseFloat(act.amount || 0), 0);
            }, 0);

            return {
                name: tower.name,
                budget,
                actuals,
                variance: budget - actuals
            };
        });
    }

    /**
     * Get Vendor-wise spend
     */
    async getVendorWiseReport() {
        const vendors = await prisma.vendor.findMany({
            include: {
                actuals: true
            }
        });

        const data = vendors.map(vendor => ({
            name: vendor.name,
            spend: vendor.actuals.reduce((sum, act) => sum + parseFloat(act.amount || 0), 0)
        }));

        // Return top 10 vendors
        return data.sort((a, b) => b.spend - a.spend).slice(0, 10);
    }

    /**
     * Get Monthly Trend
     */
    async getMonthlyTrend() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // This is a simplified aggregation. In a real scenario, we'd group by actual date.
        // Here we'll fetch all actuals and aggregate in JS for simplicity given the schema structure.
        const actuals = await prisma.actual.findMany();

        const trend = {};
        months.forEach(m => trend[m] = 0);

        actuals.forEach(act => {
            if (act.month && trend[act.month] !== undefined) {
                trend[act.month] += parseFloat(act.amount || 0);
            }
        });

        return Object.keys(trend).map(month => ({
            month,
            amount: trend[month]
        }));
    }
}

module.exports = new ReportsService();
