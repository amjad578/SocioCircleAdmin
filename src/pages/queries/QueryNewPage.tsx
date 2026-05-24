import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiCreateQuery, type ApiQueryStatus } from '@/lib/api';

const STATUS_OPTIONS: { value: ApiQueryStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

const QueryNewPage: React.FC = () => {
    const navigate = useNavigate();
    const [values, setValues] = React.useState({
        name: '',
        email: '',
        phone: '',
        description: '',
        remarks: '',
        status: 'pending' as ApiQueryStatus,
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiCreateQuery({ ...values });
            navigate('/queries');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create query');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/queries')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    {/* <Typography variant="h5">Add Query</Typography> */}
                </Box>

                <Paper sx={{ p: 3, maxWidth: 640 }} component="form" onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Name"
                                fullWidth
                                required
                                value={values.name}
                                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Email"
                                fullWidth
                                required
                                type="email"
                                value={values.email}
                                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Phone"
                                fullWidth
                                required
                                value={values.phone}
                                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Status"
                                select
                                fullWidth
                                required
                                value={values.status}
                                onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as ApiQueryStatus }))}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={values.description}
                                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Remarks"
                                fullWidth
                                multiline
                                rows={2}
                                value={values.remarks}
                                onChange={(e) => setValues((v) => ({ ...v, remarks: e.target.value }))}
                            />
                        </Grid>
                    </Grid>



                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button type="button" variant="outlined" color="inherit" onClick={() => navigate('/queries')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Creating...' : 'Create'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default QueryNewPage;
