import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AppThemeProvider } from '@/components/theme/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AppThemeProvider>
                    <App />
                </AppThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
