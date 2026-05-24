import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiGetQuery, apiUpdateQuery, type ApiQueryStatus } from '@/lib/api';

const STATUS_OPTIONS: { value: ApiQueryStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

const QueryEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    type FormValues = {
        name: string;
        email: string;
        phone: string;
        description: string;
        remarks: string;
        status: ApiQueryStatus;
    };

    const [values, setValues] = React.useState<FormValues | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetQuery(id!);
                if (!data) { navigate('/queries'); return; }
                setValues({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    description: data.description ?? '',
                    remarks: data.remarks ?? '',
                    status: data.status,
                });
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load query');
            }
        };
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values) return;
        setError(null);
        setLoading(true);
        try {
            await apiUpdateQuery(id!, {
                name: values.name,
                email: values.email,
                phone: values.phone,
                description: values.description,
                remarks: values.remarks,
                status: values.status,
            });
            navigate(`/queries/${id}`);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update query');
        } finally {
            setLoading(false);
        }
    };

    if (!values && !error) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );


    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/queries')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Edit Query</Typography>
                </Box>

                <Paper sx={{ p: 3, maxWidth: 640 }} component="form" onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {values && (
                        <>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Name"
                                        fullWidth
                                        required
                                        value={values.name}
                                        onChange={(e) => setValues((v) => ({ ...v!, name: e.target.value }))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Email"
                                        fullWidth
                                        required
                                        type="email"
                                        value={values.email}
                                        onChange={(e) => setValues((v) => ({ ...v!, email: e.target.value }))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Phone"
                                        fullWidth
                                        required
                                        value={values.phone}
                                        onChange={(e) => setValues((v) => ({ ...v!, phone: e.target.value }))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Status"
                                        select
                                        fullWidth
                                        required
                                        value={values.status}
                                        onChange={(e) => setValues((v) => ({ ...v!, status: e.target.value as ApiQueryStatus }))}
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
                                        onChange={(e) => setValues((v) => ({ ...v!, description: e.target.value }))}
                                    />
                                </Grid>
                                {/* <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Remarks"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={values.remarks}
                                        onChange={(e) => setValues((v) => ({ ...v!, remarks: e.target.value }))}
                                    />
                                </Grid> */}
                            </Grid>



                            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    sx={{ minWidth: 120 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/queries/${id}`)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>


        </ProtectedRoute>
    );
};

export default QueryEditPage;
