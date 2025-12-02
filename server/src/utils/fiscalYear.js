const getFiscalYear = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12

    // Assuming Fiscal Year starts in April
    // If month is April (4) or later, FY is next year
    // e.g., April 2024 is in FY 2025
    if (month >= 4) {
        return year + 1;
    } else {
        return year;
    }
};

module.exports = { getFiscalYear };
