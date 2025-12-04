// Common styles for all pages to ensure consistency

export const pageContainerStyles = {
    p: 3,
    minHeight: 'calc(100vh - 48px)', // Full height minus header
    backgroundColor: 'background.default',
};

export const pageHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    flexWrap: 'wrap',
    gap: 2,
};

export const pageTitleStyles = {
    fontWeight: 600,
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
    color: 'text.primary',
};

export const tableContainerStyles = {
    elevation: 2,
    sx: {
        borderRadius: 2,
        overflow: 'hidden',
        '& .MuiTable-root': {
            minWidth: 650,
        },
    },
};

export const tableHeaderStyles = {
    backgroundColor: 'primary.main',
    '& .MuiTableCell-head': {
        color: 'white',
        fontWeight: 600,
        fontSize: '0.875rem',
        padding: '12px 16px',
    },
};

export const tableRowStyles = {
    '&:hover': {
        backgroundColor: 'action.hover',
        transition: 'background-color 0.2s ease',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
};

export const tableCellStyles = {
    fontSize: '0.875rem',
    padding: '12px 16px',
    color: 'text.primary',
};

export const buttonStyles = {
    primary: {
        variant: 'contained',
        color: 'primary',
        sx: {
            px: 3,
            py: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 3,
            },
        },
    },
    secondary: {
        variant: 'outlined',
        color: 'primary',
        sx: {
            px: 3,
            py: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'translateY(-1px)',
                backgroundColor: 'action.hover',
            },
        },
    },
};

export const formFieldStyles = {
    fullWidth: true,
    size: 'small',
    sx: {
        '& .MuiInputBase-root': {
            fontSize: '0.875rem',
        },
        '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
        },
    },
};

export const selectFieldStyles = {
    ...formFieldStyles,
    sx: {
        ...formFieldStyles.sx,
        minWidth: 150,
    },
};

export const cardStyles = {
    elevation: 2,
    sx: {
        p: 3,
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
            boxShadow: 4,
        },
    },
};

export const chipStyles = {
    draft: {
        label: 'Draft',
        color: 'default',
        size: 'small',
        sx: { fontWeight: 500, fontSize: '0.75rem' },
    },
    submitted: {
        label: 'Submitted',
        color: 'info',
        size: 'small',
        sx: { fontWeight: 500, fontSize: '0.75rem' },
    },
    approved: {
        label: 'Approved',
        color: 'success',
        size: 'small',
        sx: { fontWeight: 500, fontSize: '0.75rem' },
    },
    rejected: {
        label: 'Rejected',
        color: 'error',
        size: 'small',
        sx: { fontWeight: 500, fontSize: '0.75rem' },
    },
    closed: {
        label: 'Closed',
        color: 'warning',
        size: 'small',
        sx: { fontWeight: 500, fontSize: '0.75rem' },
    },
};

// Page transition styles
export const pageTransitionStyles = {
    '@keyframes fadeIn': {
        from: {
            opacity: 0,
            transform: 'translateY(10px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
    animation: 'fadeIn 0.3s ease-in-out',
};

// Responsive grid styles
export const gridContainerStyles = {
    container: true,
    spacing: 3,
    sx: {
        width: '100%',
        margin: 0,
    },
};

export const gridItemStyles = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
};

// Loading skeleton styles
export const skeletonStyles = {
    variant: 'rectangular',
    animation: 'wave',
    sx: {
        borderRadius: 1,
    },
};

// Alert/Snackbar styles
export const alertStyles = {
    success: {
        severity: 'success',
        sx: {
            fontSize: '0.875rem',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
            },
        },
    },
    error: {
        severity: 'error',
        sx: {
            fontSize: '0.875rem',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
            },
        },
    },
    warning: {
        severity: 'warning',
        sx: {
            fontSize: '0.875rem',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
            },
        },
    },
    info: {
        severity: 'info',
        sx: {
            fontSize: '0.875rem',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
            },
        },
    },
};

// Dialog styles
export const dialogStyles = {
    PaperProps: {
        sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: '500px' },
        },
    },
};

export const dialogTitleStyles = {
    sx: {
        fontSize: '1.25rem',
        fontWeight: 600,
        pb: 1,
    },
};

export const dialogContentStyles = {
    sx: {
        pt: 2,
    },
};

export const dialogActionsStyles = {
    sx: {
        px: 3,
        pb: 2,
        gap: 1,
    },
};
