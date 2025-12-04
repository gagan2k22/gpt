const budgetImportService = require('../services/budgetImportService');

const importBudgets = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const dryRun = req.query.dryRun === 'true';
        const createMissingMasters = req.body.createMissingMasters === 'true';
        const userId = req.user ? req.user.id : null;

        const result = await budgetImportService.processImport(req.file.buffer, userId, {
            dryRun,
            createMissingMasters
        });

        res.json(result);
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { importBudgets };
