const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BudgetCalcService {
    /**
     * Calculate total budget for a line item by summing all monthly amounts
     */
    async calculateTotalBudgetForLineItem(lineItemId) {
        const months = await prisma.budgetMonth.findMany({
            where: { lineItemId }
        });

        const total = months.reduce((sum, month) => {
            return sum + parseFloat(month.amount || 0);
        }, 0);

        // Update the line item's totalBudget
        await prisma.lineItem.update({
            where: { id: lineItemId },
            data: { totalBudget: total }
        });

        return total;
    }

    /**
     * Apply actual to months based on invoice date
     * Maps the actual to the corresponding month enum
     */
    async applyActualToMonths(actual) {
        const { invoiceDate, amount, lineItemId } = actual;

        if (!invoiceDate || !lineItemId) {
            throw new Error('Invoice date and line item ID are required');
        }

        const date = new Date(invoiceDate);
        const monthIndex = date.getMonth(); // 0-11
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[monthIndex];

        // Update or create the actual with the month
        const updatedActual = await prisma.actual.update({
            where: { id: actual.id },
            data: { month }
        });

        return { month, amount };
    }

    /**
     * Compute variance for a line item (totalBudget - totalActuals)
     */
    async computeVariance(lineItemId) {
        const lineItem = await prisma.lineItem.findUnique({
            where: { id: lineItemId },
            include: { actuals: true }
        });

        if (!lineItem) {
            throw new Error('Line item not found');
        }

        const totalBudget = parseFloat(lineItem.totalBudget || 0);
        const totalActuals = lineItem.actuals.reduce((sum, actual) => {
            return sum + parseFloat(actual.convertedAmount || actual.amount || 0);
        }, 0);

        const variance = totalBudget - totalActuals;
        const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

        return {
            totalBudget,
            totalActuals,
            variance,
            variancePercentage
        };
    }

    /**
     * Currency conversion using stored exchange rates
     */
    async currencyConversion(amount, fromCurrency, toCurrency = 'INR', date = new Date()) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        // Find the most recent exchange rate
        const rate = await prisma.currencyRate.findFirst({
            where: {
                from_currency: fromCurrency,
                to_currency: toCurrency,
                effective_date: {
                    lte: date
                }
            },
            orderBy: {
                effective_date: 'desc'
            }
        });

        if (!rate) {
            throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }

        return amount * rate.rate;
    }

    /**
     * Bulk update monthly budgets for a line item
     */
    async updateMonthlyBudgets(lineItemId, monthlyData) {
        const updates = [];

        for (const [month, amount] of Object.entries(monthlyData)) {
            const update = prisma.budgetMonth.upsert({
                where: {
                    lineitem_month_unique: {
                        lineItemId,
                        month
                    }
                },
                create: {
                    lineItemId,
                    month,
                    amount
                },
                update: {
                    amount
                }
            });
            updates.push(update);
        }

        await prisma.$transaction(updates);

        // Recalculate total
        return await this.calculateTotalBudgetForLineItem(lineItemId);
    }
}

module.exports = new BudgetCalcService();
