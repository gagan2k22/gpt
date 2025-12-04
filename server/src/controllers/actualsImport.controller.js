const actualsImportService = require('../services/actualsImport.service');

const importActuals = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const dryRun = req.query.dryRun === 'true';
        const result = await actualsImportService.processImport(req.file.buffer, req.user.id, dryRun);

        res.json(result);
    } catch (error) {
        console.error('Error importing actuals:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    importActuals
};
