import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

const DashboardLayout: React.FC = () => {
    return (
        <ProtectedRoute>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Topbar />
                    <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </ProtectedRoute>
    );
};

export default DashboardLayout;
