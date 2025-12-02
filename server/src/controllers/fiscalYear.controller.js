const prisma = require('../prisma');

const getFiscalYears = async (req, res) => {
    try {
        const fiscalYears = await prisma.fiscalYear.findMany({
            orderBy: { year: 'asc' }
        });
        res.json(fiscalYears);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleFiscalYearStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const fiscalYear = await prisma.fiscalYear.update({
            where: { id: parseInt(id) },
            data: { is_active }
        });

        res.json(fiscalYear);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFiscalYear = async (req, res) => {
    try {
        const { year, label, description, start_date, end_date, is_active } = req.body;

        const fiscalYear = await prisma.fiscalYear.create({
            data: {
                year: parseInt(year),
                label,
                description,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                is_active: is_active !== undefined ? is_active : true
            }
        });

        res.status(201).json(fiscalYear);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFiscalYears,
    toggleFiscalYearStatus,
    createFiscalYear
};
