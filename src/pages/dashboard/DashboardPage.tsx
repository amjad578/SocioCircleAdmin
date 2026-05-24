import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const DashboardPage: React.FC = () => {
    return (
        <ProtectedRoute requiredPermissions={['dashboard:view']}>
            <Box>
                <Typography variant="h5" gutterBottom>
                    Overview
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Campaign
                            </Typography>
                            <Typography variant="h4">0</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Active Campaigns
                            </Typography>
                            <Typography variant="h4">0</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </ProtectedRoute>
    );
};

export default DashboardPage;
