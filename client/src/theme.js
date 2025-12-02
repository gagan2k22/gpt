import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // Professional Blue
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9c27b0', // Elegant Purple
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f7fa', // Light Grayish Blue for background
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50', // Dark Blue-Gray for text
            secondary: '#546e7a',
        },
        divider: '#e0e0e0',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600, letterSpacing: '-0.5px' },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 600 }, // No all-caps buttons
    },
    shape: {
        borderRadius: 8, // Softer corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
                },
                elevation2: {
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#f8f9fa',
                    color: '#2c3e50',
                    fontWeight: 600,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 4px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

export default theme;
