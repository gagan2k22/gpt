const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllActualBOA = async (req, res) => {
    try {
        const { fiscal_year } = req.query;
        const where = {};
        if (fiscal_year) {
            where.fiscal_year = fiscal_year;
        }

        const data = await prisma.actualBOAData.findMany({
            where,
            orderBy: {
                id: 'asc',
            },
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching Actual BOA data:', error);
        res.status(500).json({ error: 'Failed to fetch Actual BOA data' });
    }
};

exports.createActualBOA = async (req, res) => {
    try {
        const newData = await prisma.actualBOAData.create({
            data: req.body,
        });
        res.status(201).json(newData);
    } catch (error) {
        console.error('Error creating Actual BOA entry:', error);
        res.status(500).json({ error: 'Failed to create Actual BOA entry' });
    }
};

exports.updateActualBOA = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = await prisma.actualBOAData.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.json(updatedData);
    } catch (error) {
        console.error('Error updating Actual BOA entry:', error);
        res.status(500).json({ error: 'Failed to update Actual BOA entry' });
    }
};

exports.deleteActualBOA = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.actualBOAData.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting Actual BOA entry:', error);
        res.status(500).json({ error: 'Failed to delete Actual BOA entry' });
    }
};

exports.seedActualBOA = async (req, res) => {
    try {
        // Check if data already exists
        const count = await prisma.actualBOAData.count();
        if (count > 0) {
            return res.status(400).json({ message: 'Data already exists. Skipping seed.' });
        }

        const initialData = [
            // FY25 Data
            "FY25-Employee-Global", "FY25-Global-Mailbox", "FY25-Trackwise Licenses-JPHI", "FY25-Spokane",
            "FY25-Global-Mailbox-With-JFWL", "FY25-Master Control-All", "FY25-Master Control-MTL", "FY25-Master Control-Cadista",
            "FY25-SAP Licenses", "FY25-Concur Usage-SAP Entites", "FY25-Assets-Global", "FY25-India-Mailbox",
            "FY25-AWS-JVL", "FY25-LN Licenses", "FY25-Azure-JVL", "FY25-DR-JVL", "FY25-Revenue",
            "FY25-Global Employee-Exl. Consumer", "FY25-SDWAN-JVL", "FY25-Rfxcel", "FY25-Montreal",
            "FY25-Adobe-NA", "FY25-Zoom-NA", "FY25-Revenue-NA", "FY25-Employee-NA", "FY25-Compliancewire",
            "FY25-Minitab-License", "FY25-Autocad", "FY25-DLP-NA", "FY25-NA-Mailbox", "FY25-Anaplan-JGL-API",
            "FY25-Corevist", "FY25-Tenable", "FY25-Anaplan-Reimplementation", "FY25-Assets-NA", "FY25-Assets-India",
            "FY25-Application User%", "FY25-Licenses-M365", "FY25-AWS-Biosys", "FY25-Salesforce-ABU",
            "FY25-Anaplan-JGL-FY'24-Only", "FY25-Druva-MTL", "FY25-Montreal", "FY25-Employee-Pharma India",
            "FY25-Employee-Pharma", "FY25-Employee-India", "FY25-SalesForce-JDI-ABU", "FY25-DC Infra",
            "FY25-Cadista-Aws", "FY25-DigiSign", "FY25-Application User%Excl Ingrevia", "FY25-Jira",
            "FY25-Summit JDR", "FY25-EY-Conformity", "FY25-EY-Conformity-NA", "FY25-JGL-IBP-Mailbox",
            "FY25-JGL-IBP-Asset", "FY25-JGL-IBP-Zoom", "FY25-JGL-IBP-Emp", "FY25-JGL-IBP-IT-Emp",
            "FY25-Revenue-Excl JVL", "FY25-Anaplan-Reimplementation-Bio+Spk+Mtl+Cad", "FY25-Trackwise-MTL",
            "FY25-Trackwise-SPK", "FY25-GXP-OPS", "FY25-Cadista", "FY25-ISE-MTL",

            // FY26 Data
            "FY26-Employee-Global", "FY26-Global-Mailbox", "FY26-Trackwise Licenses-JPM", "FY26-Global-Mailbox-With-JFWL",
            "FY26-Master Control-All", "FY26-Master Control-MTL", "FY26-Master Control-Cadista", "FY26-SAP Licenses",
            "FY26-Concur Usage-SAP Entites", "FY26-Assets-Global", "FY26-India-Mailbox", "FY26-AWS-JVL",
            "FY26-LN Licenses", "FY26-Azure-JVL", "FY26-DR-JVL", "FY26-Revenue", "FY26-Global Employee-Exl. Consumer",
            "FY26-SDWAN-JVL", "FY26-Rfxcel", "FY26-Montreal-Revenue", "FY26-Adobe-NA", "FY26-Zoom-NA",
            "FY26-Revenue-NA", "FY26-Employee-NA", "FY26-Compliancewire", "FY26-Minitab-License", "FY26-Autocad",
            "FY26-DLP-NA", "FY26-NA-Mailbox", "FY26-Anaplan-JGL-API", "FY26-Corevist", "FY26-Tenable",
            "FY26-Anaplan-Reimplementation", "FY26-Assets-NA", "FY26-Assets-India", "FY26-Application User%",
            "FY26-Licenses-M365", "FY26-AWS-Biosys", "FY26-Salesforce-ABU", "FY26-Anaplan-JGL-FY'24-Only",
            "FY26-Druva-MTL", "FY26-Montreal-EMP Count", "FY26-Employee-Pharma India", "FY26-Employee-Pharma",
            "FY26-Employee-India", "FY26-SalesForce-JDI-ABU", "FY26-DC Infra", "FY26-Cadista-Aws", "FY26-DigiSign",
            "FY26-Application User%Excl Ingrevia", "FY26-Jira", "FY26-Summit JDR", "FY26-EY-Conformity",
            "FY26-EY-Conformity-NA", "FY26-JGL-IBP-Mailbox", "FY26-JGL-IBP-Asset", "FY26-JGL-IBP-Zoom",
            "FY26-JGL-IBP-Emp", "FY26-JGL-IBP-IT-Emp", "FY26-Revenue-Excl JVL", "FY26-Anaplan-Reimplementation-Bio+Spk+Mtl+Cad",
            "FY26-Trackwise-MTL", "FY26-Trackwise-SPK", "FY26-GXP-OPS", "FY26-Cadista", "FY26-ISE-MTL",
            "FY26-SDWAN-HO", "FY26-SAP Licenses-JGL & API", "FY26-Spokane", "FY26-SAP Licenses-NA",
            "FY26-Montreal-JDI+JHSGP", "FY26-ChemAir", "FY26-Montreal-Minitab"
        ];

        const records = initialData.map(item => {
            const fiscal_year = item.startsWith('FY26') ? 'FY26' : 'FY25';
            return {
                vendor_service: item,
                fiscal_year: fiscal_year,
                basis_of_allocation: '', // Default empty
                total_count: 0,
                // Initialize other fields to 0 or null as needed
            };
        });

        await prisma.actualBOAData.createMany({
            data: records,
        });

        res.json({ message: 'Seeded successfully', count: records.length });
    } catch (error) {
        console.error('Error seeding Actual BOA data:', error);
        res.status(500).json({ error: 'Failed to seed Actual BOA data' });
    }
};
