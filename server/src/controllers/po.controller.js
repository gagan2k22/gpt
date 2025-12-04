const poService = require('../services/po.service');

const createPO = async (req, res) => {
    try {
        const po = await poService.createPO(req.body, req.user.id);
        res.status(201).json(po);
    } catch (error) {
        console.error('Error creating PO:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'PO Number already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

const updatePO = async (req, res) => {
    try {
        const po = await poService.updatePO(req.params.id, req.body, req.user.id);
        res.json(po);
    } catch (error) {
        console.error('Error updating PO:', error);
        res.status(500).json({ message: error.message });
    }
};

const getPO = async (req, res) => {
    try {
        const po = await poService.getPO(req.params.id);
        if (!po) return res.status(404).json({ message: 'PO not found' });
        res.json(po);
    } catch (error) {
        console.error('Error fetching PO:', error);
        res.status(500).json({ message: error.message });
    }
};

const listPOs = async (req, res) => {
    try {
        const result = await poService.listPOs(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error listing POs:', error);
        res.status(500).json({ message: error.message });
    }
};

const deletePO = async (req, res) => {
    // Implement if needed, or soft delete
    res.status(501).json({ message: 'Not implemented' });
};

module.exports = {
    createPO,
    updatePO,
    getPO,
    listPOs,
    deletePO
};
