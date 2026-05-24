'use client';

import * as React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E88E5'
    },
    secondary: {
      main: '#FFB300'
    },
    background: {
      default: '#f3f4f6'
    }
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h5: {
      fontWeight: 600
    },
    subtitle1: {
      fontWeight: 500
    }
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backgroundColor: '#ffffff'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid rgba(15,23,42,0.06)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          textTransform: 'none',
          borderRadius: 999,
          fontWeight: 500,
          ...(ownerState.variant === 'contained' && ownerState.color === 'primary' && {
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
          })
        })
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f9fafb'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    }
  }
});

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

