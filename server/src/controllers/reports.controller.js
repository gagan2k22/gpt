const reportsService = require('../services/reports.service');

const getDashboardStats = async (req, res) => {
    try {
        const summary = await reportsService.getDashboardSummary();
        const towerWise = await reportsService.getTowerWiseReport();
        const vendorWise = await reportsService.getVendorWiseReport();
        const monthlyTrend = await reportsService.getMonthlyTrend();

        res.json({
            summary,
            towerWise,
            vendorWise,
            monthlyTrend
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};
