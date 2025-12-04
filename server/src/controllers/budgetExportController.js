const budgetExportService = require('../services/budgetExportService');

const exportBudgets = async (req, res) => {
    try {
        const { template, fy } = req.query;
        const workbook = await budgetExportService.generateExport({ template, fy });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=budget_export_${template || 'report'}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { exportBudgets };
