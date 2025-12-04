const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all Budget BOA data
exports.getAllBudgetBOA = async (req, res) => {
    try {
        const data = await prisma.budgetBOAData.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching Budget BOA data:', error);
        res.status(500).json({ error: 'Failed to fetch Budget BOA data' });
    }
};

// Create new Budget BOA entry
exports.createBudgetBOA = async (req, res) => {
    try {
        const data = await prisma.budgetBOAData.create({
            data: req.body
        });
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating Budget BOA data:', error);
        res.status(500).json({ error: 'Failed to create Budget BOA data' });
    }
};

// Update Budget BOA entry
exports.updateBudgetBOA = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: _, created_at, updated_at, ...updateData } = req.body;

        const data = await prisma.budgetBOAData.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json(data);
    } catch (error) {
        console.error('Error updating Budget BOA data:', error);
        res.status(500).json({ error: 'Failed to update Budget BOA data' });
    }
};

// Delete Budget BOA entry
exports.deleteBudgetBOA = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.budgetBOAData.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Budget BOA data deleted successfully' });
    } catch (error) {
        console.error('Error deleting Budget BOA data:', error);
        res.status(500).json({ error: 'Failed to delete Budget BOA data' });
    }
};

// Seed initial Budget BOA data
exports.seedBudgetBOA = async (req, res) => {
    try {
        // Check if data already exists
        const count = await prisma.budgetBOAData.count();
        if (count > 0) {
            return res.status(400).json({ message: 'Data already exists. Skipping seed.' });
        }

        const initialData = [
            { vendor_service: 'FY26-Revenue', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-Montreal-Revenue', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-Revenue-NA', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-Anaplan-JGL-API', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-Anaplan-Reimplementation', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-DigiSign', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-EY-Conformity-NA', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-Revenue-Excl JVL', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-Anaplan-Reimplementation-Bio+Spk+Mtl+Cad', basis_of_allocation: 'Revenue' },
            { vendor_service: 'FY26-GXP-OPS', basis_of_allocation: 'Revenue-Pharma Excl JDR' },
            { vendor_service: 'FY26-Cadista', basis_of_allocation: 'Revenue' },
        ];

        const records = initialData.map(item => ({
            vendor_service: item.vendor_service,
            basis_of_allocation: item.basis_of_allocation,
            total_count: 0,
            jpm_corporate: 0,
            jphi_corporate: 0,
            biosys_bengaluru: 0,
            biosys_noida: 0,
            biosys_greater_noida: 0,
            pharmova_api: 0,
            jgl_dosage: 0,
            jgl_ibp: 0,
            cadista_dosage: 0,
            jdi_radio_pharmaceuticals: 0,
            jdi_radiopharmacies: 0,
            jhs_gp_cmo: 0,
            jhs_llc_cmo: 0,
            jhs_llc_allergy: 0,
            ingrevia: 0,
            jil_jacpl: 0,
            jfl: 0,
            consumer: 0,
            jti: 0,
            jogpl: 0,
            enpro: 0,
        }));

        await prisma.budgetBOAData.createMany({
            data: records,
        });

        res.json({ message: 'Seeded successfully', count: records.length });
    } catch (error) {
        console.error('Error seeding Budget BOA data:', error);
        res.status(500).json({ error: 'Failed to seed Budget BOA data' });
    }
};
