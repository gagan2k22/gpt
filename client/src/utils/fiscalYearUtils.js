// Utility functions for Fiscal Year and Month handling

/**
 * Get fiscal year months (April to March)
 * @param {number} fiscalYear - e.g., 2026 for FY26
 * @returns {Array} Array of month objects with label and value
 */
export const getFiscalYearMonths = (fiscalYear) => {
    const months = [
        { value: 4, label: 'April', calendarYear: fiscalYear - 1 },
        { value: 5, label: 'May', calendarYear: fiscalYear - 1 },
        { value: 6, label: 'June', calendarYear: fiscalYear - 1 },
        { value: 7, label: 'July', calendarYear: fiscalYear - 1 },
        { value: 8, label: 'August', calendarYear: fiscalYear - 1 },
        { value: 9, label: 'September', calendarYear: fiscalYear - 1 },
        { value: 10, label: 'October', calendarYear: fiscalYear - 1 },
        { value: 11, label: 'November', calendarYear: fiscalYear - 1 },
        { value: 12, label: 'December', calendarYear: fiscalYear - 1 },
        { value: 1, label: 'January', calendarYear: fiscalYear },
        { value: 2, label: 'February', calendarYear: fiscalYear },
        { value: 3, label: 'March', calendarYear: fiscalYear },
    ];

    return months.map((month, index) => ({
        ...month,
        displayLabel: `${month.label} ${month.calendarYear}`,
        fiscalMonth: index + 1, // 1-12 for fiscal year
    }));
};

/**
 * Get all available fiscal years
 * @returns {Array} Array of fiscal year objects
 */
export const getAvailableFiscalYears = () => {
    return [
        { value: 2024, label: 'FY 2024', range: 'Apr 2023 - Mar 2024' },
        { value: 2025, label: 'FY 2025', range: 'Apr 2024 - Mar 2025' },
        { value: 2026, label: 'FY 2026', range: 'Apr 2025 - Mar 2026' },
        { value: 2027, label: 'FY 2027', range: 'Apr 2026 - Mar 2027' },
    ];
};

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
};

/**
 * Get fiscal month display (e.g., "April 2025" for FY26 Month 1)
 * @param {number} fiscalYear - Fiscal year
 * @param {number} fiscalMonth - Fiscal month (1-12)
 * @returns {string} Display string
 */
export const getFiscalMonthDisplay = (fiscalYear, fiscalMonth) => {
    const months = getFiscalYearMonths(fiscalYear);
    const month = months[fiscalMonth - 1];
    return month ? month.displayLabel : '';
};
