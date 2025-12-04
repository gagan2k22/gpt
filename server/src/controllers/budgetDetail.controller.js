const budgetDetailService = require('../services/budgetDetail.service');

const getBudgetDetail = async (req, res) => {
    try {
        const { uid } = req.params;
        const detail = await budgetDetailService.getLineItemDetail(uid);
        res.json(detail);
    } catch (error) {
        console.error('Error fetching budget detail:', error);
        if (error.message === 'Line item not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const addReconciliationNote = async (req, res) => {
    try {
        const { uid } = req.params;
        const { note, actualId } = req.body;
        const userId = req.user.id;

        if (!note) {
            return res.status(400).json({ message: 'Note content is required' });
        }

        const newNote = await budgetDetailService.addReconciliationNote(uid, note, userId, actualId);
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error adding reconciliation note:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBudgetDetail,
    addReconciliationNote
};
