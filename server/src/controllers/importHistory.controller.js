const importHistoryService = require('../services/importHistory.service');

const getHistory = async (req, res) => {
    try {
        const isAdmin = req.user.roles.some(r => r.name === 'Admin');
        const history = await importHistoryService.getImportHistory(req.user.id, isAdmin);
        res.json(history);
    } catch (error) {
        console.error('Error fetching import history:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHistory
};
