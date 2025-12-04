const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');

class BudgetExportService {
    async generateExport(options = {}) {
        const { template = 'report', fy } = options;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Budget Data');

        // Define columns based on template
        if (template === 'upload') {
            worksheet.columns = [
                { header: 'UID', key: 'uid', width: 20 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Tower', key: 'tower', width: 15 },
                { header: 'Budget Head', key: 'budgetHead', width: 20 },
                { header: 'Jan', key: 'Jan', width: 12 },
                { header: 'Feb', key: 'Feb', width: 12 },
                { header: 'Mar', key: 'Mar', width: 12 },
                { header: 'Apr', key: 'Apr', width: 12 },
                { header: 'May', key: 'May', width: 12 },
                { header: 'Jun', key: 'Jun', width: 12 },
                { header: 'Jul', key: 'Jul', width: 12 },
                { header: 'Aug', key: 'Aug', width: 12 },
                { header: 'Sep', key: 'Sep', width: 12 },
                { header: 'Oct', key: 'Oct', width: 12 },
                { header: 'Nov', key: 'Nov', width: 12 },
                { header: 'Dec', key: 'Dec', width: 12 },
                { header: 'Total', key: 'total', width: 15 }
            ];

            // Add data if not just a blank template
            const lineItems = await prisma.lineItem.findMany({
                include: {
                    tower: true,
                    budgetHead: true,
                    months: true
                }
            });

            lineItems.forEach(item => {
                const row = {
                    uid: item.uid,
                    description: item.description,
                    tower: item.tower?.name,
                    budgetHead: item.budgetHead?.name,
                    total: item.totalBudget
                };

                // Fill months
                item.months.forEach(bm => {
                    row[bm.month] = bm.amount;
                });

                worksheet.addRow(row);
            });

        } else {
            // Report Template (More detailed)
            worksheet.columns = [
                { header: 'UID', key: 'uid', width: 20 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Tower', key: 'tower', width: 15 },
                { header: 'Budget Head', key: 'budgetHead', width: 20 },
                { header: 'Total Budget', key: 'totalBudget', width: 15 },
                // Add actuals/variance columns here later when Actuals are fully linked
            ];

            const lineItems = await prisma.lineItem.findMany({
                include: {
                    tower: true,
                    budgetHead: true
                }
            });

            lineItems.forEach(item => {
                worksheet.addRow({
                    uid: item.uid,
                    description: item.description,
                    tower: item.tower?.name,
                    budgetHead: item.budgetHead?.name,
                    totalBudget: item.totalBudget
                });
            });
        }

        // Styling
        worksheet.getRow(1).font = { bold: true };

        return workbook;
    }
}

module.exports = new BudgetExportService();
