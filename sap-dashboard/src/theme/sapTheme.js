import { createTheme } from '@mui/material/styles';

const sapTheme = createTheme({
    palette: {
        primary: {
            main: '#6D4CFA', // purple hero color
            contrastText: '#fff',
        },
        secondary: {
            main: '#0a6ed1', // SAP-blue accent
            contrastText: '#fff',
        },
        background: {
            default: '#f4f6fb',
            paper: '#ffffff',
        },
        text: {
            primary: '#10203b',
            secondary: '#6b7a90',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", Arial, sans-serif',
        h6: { fontWeight: 700 },
        subtitle1: { color: '#6b7a90' },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
    },
});

export default sapTheme;
