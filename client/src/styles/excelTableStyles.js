// Excel-like table styles for Budget and PO trackers
export const excelTableStyles = {
    // Container
    tableContainer: {
        width: '100%',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 280px)', // Vertical scroll only
        border: '1px solid #d0d7de',
        borderRadius: '6px',
        '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '6px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    },

    // Table
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        fontSize: '13px',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },

    // Header cells
    headerCell: {
        position: 'sticky',
        top: 0,
        backgroundColor: '#f6f8fa',
        borderBottom: '2px solid #d0d7de',
        borderRight: '1px solid #d0d7de',
        padding: '8px 12px',
        fontWeight: 600,
        fontSize: '12px',
        color: '#24292f',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        zIndex: 10,
        '&:last-child': {
            borderRight: 'none',
        },
    },

    // Filter row cells
    filterCell: {
        position: 'sticky',
        top: '41px', // Height of header cell
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d0d7de',
        borderRight: '1px solid #d0d7de',
        padding: '4px',
        zIndex: 9,
        '&:last-child': {
            borderRight: 'none',
        },
    },

    // Data cells
    dataCell: {
        borderBottom: '1px solid #d0d7de',
        borderRight: '1px solid #d0d7de',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#24292f',
        backgroundColor: '#ffffff',
        '&:last-child': {
            borderRight: 'none',
        },
        '&:hover': {
            backgroundColor: '#f6f8fa',
        },
    },

    // Row hover effect
    tableRow: {
        '&:hover': {
            backgroundColor: '#f6f8fa !important',
        },
        '&:nth-of-type(even)': {
            backgroundColor: '#f9fafb',
        },
    },

    // Filter input
    filterInput: {
        '& .MuiOutlinedInput-root': {
            fontSize: '12px',
            backgroundColor: '#ffffff',
            '& fieldset': {
                borderColor: '#d0d7de',
            },
            '&:hover fieldset': {
                borderColor: '#8c959f',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#0969da',
                borderWidth: '1px',
            },
        },
        '& .MuiOutlinedInput-input': {
            padding: '6px 8px',
        },
    },

    // Numeric cell (right-aligned)
    numericCell: {
        textAlign: 'right',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontWeight: 500,
    },

    // Status chip
    statusChip: {
        fontSize: '11px',
        height: '20px',
        fontWeight: 600,
    },
};
