import { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode
                primary: {
                  main: '#6366F1',
                },
                background: {
                  default: '#F9FAFB',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#111827',
                  secondary: '#6B7280',
                },
              }
            : {
                // Dark mode
                primary: {
                  main: '#818CF8',
                },
                background: {
                  default: '#0F172A',
                  paper: '#1E293B',
                },
                text: {
                  primary: '#F1F5F9',
                  secondary: '#94A3B8',
                },
              }),
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 600,
          },
          body1: {
            fontSize: '0.875rem',
          },
          body2: {
            fontSize: '0.8125rem',
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                border: mode === 'light' ? '1px solid #F3F4F6' : '1px solid #334155',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
