import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#131921', // Amazon-like dark blue header
            light: '#232f3e',
            dark: '#000000',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#febd69', // Amazon-like orange for actions
            light: '#ffcf8b',
            dark: '#c88d3e',
            contrastText: '#111111',
        },
        background: {
            default: '#eaeded', // Light gray background
            paper: '#ffffff',
        },
        text: {
            primary: '#0F1111',
            secondary: '#565959',
        },
        error: {
            main: '#B12704',
        },
        success: {
            main: '#067D62',
        },
    },
    typography: {
        fontFamily: [
            '"Amazon Ember"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 700 },
        h3: { fontSize: '1.75rem', fontWeight: 600 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 700 },
        body1: { fontSize: '1rem', lineHeight: 1.5 },
        body2: { fontSize: '0.875rem' },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    },
                },
                containedSecondary: {
                    backgroundColor: '#FFD814', // Brighter yellow for primary call to actions
                    color: '#0F1111',
                    '&:hover': {
                        backgroundColor: '#F7CA00',
                    }
                }
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    border: '1px solid #e7e7e7',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    },
});

export default theme;
